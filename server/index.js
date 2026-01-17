
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { sendContactFormEmail } from './services/emailService.js';


// Configuração de ambiente para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') }); // Sobe um nível para achar .env na raiz

const app = express();
app.use(cors());
app.use(express.json());

// Log middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Erro: Credenciais do Supabase não encontradas no .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- CONNECTION TEST ENDPOINT ---
app.post('/api/test-connection', async (req, res) => {
    const { baseUrl, token, instanceName } = req.body;

    if (!baseUrl || !token || !instanceName) {
        return res.status(400).json({ error: 'Configuração incompleta' });
    }

    try {
        console.log(`🔌 Testando conexão com: ${baseUrl} / ${instanceName}`);
        
        // Tenta obter o estado da conexão
        const apiUrl = `${baseUrl}/instance/connectionState/${instanceName}`;
        
        const response = await axios.get(apiUrl, {
            headers: {
                'apikey': token
            }
        });

        // Evolution API v2 geralmente retorna objecto com 'instance' e 'state'
        const state = response.data?.instance?.state || response.data?.state;

        if (state === 'open' || state === 'connecting') {
             res.json({ status: 'success', state, message: 'Conexão estabelecida com sucesso!' });
        } else {
             res.json({ status: 'warning', state, message: `Instância encontrada, mas estado é: ${state}` });
        }

    } catch (e) {
        console.error('❌ Falha no teste de conexão:', e.message);
        const errorMsg = e.response?.data?.message || e.message;
        res.status(200).json({ status: 'error', error: errorMsg });
    }
});

// --- WHATSAPP ENDPOINT ---
app.post('/api/send-welcome', async (req, res) => {
    const { name, phone, propertyTitle } = req.body;
    
    if (!name || !phone) return res.status(400).json({ error: 'Dados insuficientes' });

    try {
        // 1. Buscar Configurações do Banco de Dados
        const { data: settingsData, error } = await supabase
            .from('site_settings')
            .select('integrations')
            .single();

        if (error || !settingsData?.integrations?.evolutionApi?.enabled) {
            console.log('⚠️ Envio de WhatsApp ignorado: Integração desativada ou não configurada.');
            return res.json({ status: 'skipeed', reason: 'disabled' });
        }

        const config = settingsData.integrations.evolutionApi;
        
        // 2. Formatar Telefone (remover caracteres não numéricos)
        const cleanPhone = phone.replace(/\D/g, '');
        // Adicionar código do país se necessário (assumindo BR 55)
        const formattedPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;

        // 3. Montar Mensagem
        const message = `Olá, ${name}! 👋\n\nRecebemos seu interesse no imóvel *${propertyTitle}*.\n\nNosso especialista já foi notificado e entrará em contato em breve para tirar suas dúvidas.\n\nEnquanto isso, salve nosso contato!`;

        // 4. Enviar via Evolution API
        const apiUrl = `${config.baseUrl}/message/sendText/${config.instanceName}`;
        
        console.log(`📤 Enviando WhatsApp para ${formattedPhone} via ${apiUrl}`);

        await axios.post(apiUrl, {
            number: formattedPhone,
            text: message
        }, {
            headers: {
                'apikey': config.token,
                'Content-Type': 'application/json'
            }
        });

        console.log(`✅ WhatsApp enviado com sucesso para ${name}`);
        res.json({ status: 'sent' });

    } catch (e) {
        console.error('❌ Erro ao enviar WhatsApp:', e.message);
        // Não retornar 500 para não quebrar o fluxo do frontend, apenas logar
        res.status(200).json({ status: 'error', error: e.message });
    }
});

// --- CONTACT FORM ENDPOINT ---
app.post('/api/contact', async (req, res) => {
    const { 
        name, email, phone, message,
        // Tracking data
        utm_source, utm_medium, utm_campaign, utm_term, utm_content,
        referrer_url, landing_page_url, client_id, fbp, fbc, session_data
    } = req.body;
    
    // Validation
    if (!name || !email || !phone || !message) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    try {
        console.log(`📧 Novo contato recebido de: ${name} (${email})`);
        if (utm_source) {
            console.log(`📊 Origem: ${utm_source} / ${utm_medium} / ${utm_campaign}`);
        }
        
        // 1. Get site settings for contact email and WhatsApp template
        const { data: settingsData, error: settingsError } = await supabase
            .from('site_settings')
            .select('contact_email, contact_whatsapp_template, integrations')
            .single();
        
        if (settingsError) {
            console.error('❌ Erro ao buscar configurações:', settingsError);
        }
        
        const contactEmail = settingsData?.contact_email || 'contato@fazendasbrasil.com';
        const whatsappTemplate = settingsData?.contact_whatsapp_template || 
            'Olá {name}! Recebemos seu contato através do formulário "Fale Conosco". Nossa equipe já está analisando sua mensagem e entrará em contato em breve. Obrigado!';
        
        // 2. Create lead in CRM with tracking data
        const { data: leadData, error: leadError } = await supabase
            .from('crm_leads')
            .insert([{
                name,
                email,
                phone,
                source: utm_source || 'Fale Conosco',
                status: 'Novo',
                notes: message,
                // Tracking fields
                utm_source,
                utm_medium,
                utm_campaign,
                utm_term,
                utm_content,
                referrer_url,
                landing_page_url,
                client_id,
                fbp,
                fbc,
                session_data: session_data ? JSON.stringify(session_data) : null
            }])
            .select()
            .single();
        
        if (leadError) {
            console.error('❌ Erro ao criar lead:', JSON.stringify(leadError, null, 2));
            throw new Error(`Erro ao salvar contato no CRM: ${leadError.message || JSON.stringify(leadError)}`);
        }
        
        console.log(`✅ Lead criado com sucesso: ${leadData.id}`);
        
        // 3. Send email notification
        try {
            await sendContactFormEmail({ name, email, phone, message }, contactEmail);
            console.log(`✅ Email de notificação enviado para ${contactEmail}`);
        } catch (emailError) {
            console.error('❌ Erro ao enviar email:', emailError.message);
            // Continue even if email fails
        }
        
        // 4. Send WhatsApp auto-reply
        if (settingsData?.integrations?.evolutionApi?.enabled) {
            try {
                const config = settingsData.integrations.evolutionApi;
                const cleanPhone = phone.replace(/\D/g, '');
                const formattedPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
                
                // Replace template variables
                const whatsappMessage = whatsappTemplate
                    .replace(/{name}/g, name)
                    .replace(/{email}/g, email)
                    .replace(/{phone}/g, phone)
                    .replace(/{message}/g, message);
                
                const apiUrl = `${config.baseUrl}/message/sendText/${config.instanceName}`;
                
                await axios.post(apiUrl, {
                    number: formattedPhone,
                    text: whatsappMessage
                }, {
                    headers: {
                        'apikey': config.token,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log(`✅ WhatsApp enviado para ${name}`);
            } catch (whatsappError) {
                console.error('❌ Erro ao enviar WhatsApp:', whatsappError.message);
                // Continue even if WhatsApp fails
            }
        }
        
        // Return success
        res.json({ 
            success: true, 
            message: 'Contato recebido com sucesso!',
            leadId: leadData.id
        });
        
    } catch (error) {
        console.error('❌ Erro ao processar contato:', error);
        res.status(500).json({ 
            error: 'Erro ao processar seu contato. Por favor, tente novamente.' 
        });
    }
});


// ============================================
// SITE TEXTS API - Sistema de Textos Editáveis
// ============================================

// GET /api/texts - Listar todos os textos
app.get('/api/texts', async (req, res) => {
    try {
        const { category, section } = req.query;
        
        let query = supabase.from('site_texts').select('*');
        
        if (category) {
            query = query.eq('category', category);
        }
        
        if (section) {
            query = query.eq('section', section);
        }
        
        const { data, error } = await query.order('section', { ascending: true });
        
        if (error) {
            console.error('❌ Erro ao buscar textos:', error);
            return res.status(500).json({ error: 'Erro ao buscar textos' });
        }
        
        // Transformar array em objeto chave-valor para facilitar uso no frontend
        const textsMap = {};
        data.forEach(text => {
            textsMap[text.key] = text.value;
        });
        
        res.json({ 
            success: true, 
            texts: textsMap,
            raw: data // Enviar também os dados completos para o admin
        });
        
    } catch (error) {
        console.error('❌ Erro ao processar textos:', error);
        res.status(500).json({ error: 'Erro ao processar textos' });
    }
});

// GET /api/texts/:key - Buscar texto específico
app.get('/api/texts/:key', async (req, res) => {
    try {
        const { key } = req.params;
        
        const { data, error } = await supabase
            .from('site_texts')
            .select('*')
            .eq('key', key)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Texto não encontrado' });
            }
            console.error('❌ Erro ao buscar texto:', error);
            return res.status(500).json({ error: 'Erro ao buscar texto' });
        }
        
        res.json({ success: true, text: data });
        
    } catch (error) {
        console.error('❌ Erro ao processar texto:', error);
        res.status(500).json({ error: 'Erro ao processar texto' });
    }
});

// PUT /api/texts/:key - Atualizar texto específico
app.put('/api/texts/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;
        
        if (!value) {
            return res.status(400).json({ error: 'Valor é obrigatório' });
        }
        
        const { data, error } = await supabase
            .from('site_texts')
            .update({ value, updated_at: new Date().toISOString() })
            .eq('key', key)
            .select()
            .single();
        
        if (error) {
            console.error('❌ Erro ao atualizar texto:', error);
            return res.status(500).json({ error: 'Erro ao atualizar texto' });
        }
        
        console.log(`✅ Texto atualizado: ${key} = "${value}"`);
        res.json({ success: true, text: data });
        
    } catch (error) {
        console.error('❌ Erro ao processar atualização:', error);
        res.status(500).json({ error: 'Erro ao processar atualização' });
    }
});

// POST /api/texts/bulk - Atualização em massa
app.post('/api/texts/bulk', async (req, res) => {
    try {
        const { updates } = req.body; // Array de { key, value }
        
        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({ error: 'Updates deve ser um array não vazio' });
        }
        
        console.log(`📝 Atualizando ${updates.length} textos em massa...`);
        
        const results = [];
        const errors = [];
        
        for (const update of updates) {
            try {
                const { data, error } = await supabase
                    .from('site_texts')
                    .update({ value: update.value, updated_at: new Date().toISOString() })
                    .eq('key', update.key)
                    .select()
                    .single();
                
                if (error) {
                    errors.push({ key: update.key, error: error.message });
                } else {
                    results.push(data);
                }
            } catch (err) {
                errors.push({ key: update.key, error: err.message });
            }
        }
        
        console.log(`✅ Atualizados: ${results.length}, ❌ Erros: ${errors.length}`);
        
        res.json({ 
            success: true, 
            updated: results.length,
            errors: errors.length,
            results,
            errorDetails: errors
        });
        
    } catch (error) {
        console.error('❌ Erro ao processar atualização em massa:', error);
        res.status(500).json({ error: 'Erro ao processar atualização em massa' });
    }
});

// POST /api/texts/seed - Popular textos iniciais (apenas para setup)
app.post('/api/texts/seed', async (req, res) => {
    try {
        console.log('🌱 Iniciando seed de textos...');
        
        // Verificar se já existem textos
        const { count } = await supabase
            .from('site_texts')
            .select('*', { count: 'exact', head: true });
        
        if (count > 0) {
            return res.status(400).json({ 
                error: 'Textos já existem no banco. Use /api/texts/bulk para atualizar.' 
            });
        }
        
        // Executar seed (na prática, o seed SQL já foi executado)
        // Este endpoint é apenas para referência/debug
        res.json({ 
            success: true, 
            message: 'Execute o arquivo seed_site_texts.sql no Supabase SQL Editor' 
        });
        
    } catch (error) {
        console.error('❌ Erro ao processar seed:', error);
        res.status(500).json({ error: 'Erro ao processar seed' });
    }
});

// DELETE /api/texts/:key - Deletar texto (restaura para default)
app.delete('/api/texts/:key', async (req, res) => {
    try {
        const { key } = req.params;
        
        // Buscar o valor padrão
        const { data: textData, error: fetchError } = await supabase
            .from('site_texts')
            .select('default_value')
            .eq('key', key)
            .single();
        
        if (fetchError) {
            return res.status(404).json({ error: 'Texto não encontrado' });
        }
        
        // Restaurar para o valor padrão
        const { data, error } = await supabase
            .from('site_texts')
            .update({ value: textData.default_value, updated_at: new Date().toISOString() })
            .eq('key', key)
            .select()
            .single();
        
        if (error) {
            console.error('❌ Erro ao restaurar texto:', error);
            return res.status(500).json({ error: 'Erro ao restaurar texto' });
        }
        
        console.log(`🔄 Texto restaurado para padrão: ${key}`);
        res.json({ success: true, text: data, message: 'Texto restaurado para o valor padrão' });
        
    } catch (error) {
        console.error('❌ Erro ao processar restauração:', error);
        res.status(500).json({ error: 'Erro ao processar restauração' });
    }
});


// Endpoint de Migração
app.post('/api/migrate', async (req, res) => {
  const { startUrl } = req.body;
  if (!startUrl) return res.status(400).json({ error: 'URL é obrigatória' });

  console.log(`🚀 Recebida solicitação de migração para: ${startUrl}`);
  
  // Responde imediatamente para não bloquear o front (processamento em background)
  res.json({ message: 'Migração iniciada em background', status: 'started' });

  try {
    await runScraper(startUrl);
  } catch (error) {
    console.error("❌ Erro no processo de scraper:", error);
  }
});

const BASE_URL = 'https://www.fazendasbrasil.com.br';

async function runScraper(targetUrl) {
    console.log(`🚜 Iniciando scraper em: ${targetUrl}`);
    
    // Tenta pegar múltiplas páginas (ex: 3 páginas para teste)
    // Para simplificar, vamos pegar apenas a URL passada e processar seus links
    
    try {
        const { data: pageHtml } = await axios.get(targetUrl, {
             headers: { 
               'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
               'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
             }
        });
        
        console.log(`📄 HTML salvo em debug_scrape.html (${pageHtml.length} bytes)`);

        const $ = cheerio.load(pageHtml);
        
        console.log(`📄 HTML carregado: ${pageHtml.length} caracteres.`);

        const propertyLinks = [];
        
        // Nova estratégia: procurar pelos IDs dos cards de propriedade
        // Ex: <div class="col-sm-6 col-md-4 col-lg-4 col-xl-4 col-xxl-3 card-deck" id="property-25">
        $('[id^="property-"]').each((i, el) => {
            const id = $(el).attr('id');
            if (id) {
                const propertyId = id.replace('property-', '');
                // Pegar o link real dentro do card
                const link = $(el).find('a[href*="/imoveis/"]').first().attr('href');
                if (link) {
                    const fullUrl = link.startsWith('http') ? link : `${BASE_URL}${link}`;
                    console.log(`   ✅ Imóvel #${propertyId}: ${fullUrl}`);
                    if (!propertyLinks.includes(fullUrl)) propertyLinks.push(fullUrl);
                }
            }
        });

        console.log(`🔎 Encontrados ${propertyLinks.length} imóveis válidos.`);
        
        // Limitar para teste (processar apenas os primeiros 5)
        const linksToProcess = propertyLinks.slice(0, 5);
        console.log(`📦 Processando ${linksToProcess.length} imóveis (limitado para teste)...\n`);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < linksToProcess.length; i++) {
            try {
                const link = linksToProcess[i];
                console.log(`\n[${i + 1}/${linksToProcess.length}] Processando: ${link}`);
                const fullUrl = link.startsWith('http') ? link : `${BASE_URL}${link}`;
                await processProperty(fullUrl);
                successCount++;
                console.log(`✅ Sucesso! Total processado: ${successCount}`);
            } catch (error) {
                errorCount++;
                console.error(`❌ Erro ao processar item ${i + 1}:`, error.message);
                console.error(`Stack:`, error.stack);
            }
            
            // Delay anti-bloqueio
            console.log(`⏳ Aguardando 2 segundos...`);
            await new Promise(r => setTimeout(r, 2000));
        }
        
        console.log(`\n🏁 Ciclo finalizado!`);
        console.log(`✅ Sucessos: ${successCount}`);
        console.log(`❌ Erros: ${errorCount}`);

    } catch (e) {
        console.error("Erro ao acessar página de listagem:", e.message);
    }
}

async function processProperty(url) {
    try {
        console.time(`Processando ${url}`);
        const { data: html } = await axios.get(url, {
             headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(html);

        // Extração Robusta
        const title = $('h1').text().trim() || $('h2').first().text().trim() || 'Sem Título';
        const bodyText = $('body').text();

        // Preço
        let price = 0;
        let priceText = $('.valor').text().trim() || $('.price').text().trim(); 
        if (!priceText) {
            // Regex fallback
            const match = bodyText.match(/R\$\s?([\d.,]+)/);
            if (match) priceText = match[1];
        }
        if (priceText) {
             price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.'));
        }

        // Location
        let city = 'Importado'; 
        let state = 'BR';
        const titleMatch = title.match(/em\s(.*?)\s-\s([A-Z]{2})/);
        if (titleMatch) {
            city = titleMatch[1].trim();
            state = titleMatch[2].trim();
        }

        // Description
        const description = $('.descricao-imovel').text().trim() || $('.description').text().trim() || $('p').text().slice(0, 300);

        // Area e Imagens
        let area = 0;
        const areaMatch = bodyText.match(/([\d.,]+)\s?(hectares|ha|alqueires)/i);
        if (areaMatch) {
           let val = parseFloat(areaMatch[1].replace('.','').replace(',','.'));
           if (areaMatch[2].toLowerCase().includes('alq')) val *= 48400; // Alqueire SP
           else val *= 10000; // Hectare
           area = val;
        }

        const images = [];
        $('img').each((i, el) => {
            const src = $(el).attr('src');
            if (src && (src.endsWith('.jpg') || src.endsWith('.png')) && !src.includes('logo')) {
                const full = src.startsWith('http') ? src : `${BASE_URL}${src}`;
                if (images.length < 10 && !images.includes(full)) images.push(full);
            }
        });

        // Upsert no Supabase
        const propertyData = {
            title,
            description,
            price: price || 0,
            type: 'Fazenda',
            status: 'Disponível',
            city,
            state, 
            features: { area, bedrooms: 0, bathrooms: 0 },
            images,
            highlighted: true,
            created_at: new Date().toISOString()
        };
        
        console.log(`   💾 Tentando salvar: ${title}`);
        console.log(`   📊 Dados:`, JSON.stringify(propertyData, null, 2));
        
        const { data, error } = await supabase.from('properties').upsert(propertyData, { onConflict: 'title' });

        if (error) {
            console.error(`   ❌ Falha DB: ${title}`);
            console.error(`   ❌ Erro completo:`, JSON.stringify(error, null, 2));
        } else {
            console.log(`   ✅ Migrado com sucesso: ${title}`);
        }
        
        console.timeEnd(`Processando ${url}`);

    } catch (e) {
        console.error(`   ⚠️ Erro ao ler imóvel ${url}:`, e.message);
    }
}

// Health Check
app.get('/', (req, res) => {
  res.send('Servidor de Migração Online 🚀');
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`🔌 Servidor de Migração rodando na porta ${PORT}`);
});
