
import { supabase } from '../../supabase.js';
import axios from 'axios';

const WEBHOOK_BASE = 'https://webhook.consultio.com.br/evolution';
const WEBHOOK_TOKEN = 'FX8aVOSIDtzZsxaKg697b9539a5b58'; // Token que a Evolution vai mandar no header

// GET /api/evolution/instances
export async function getInstances(req, res) {
  try {
    // Pegar organization_id do settings ou auth (simulando single tenant por enquanto se necessario)
    // No futuro, isso vem do middleware de auth
    
    // Simplificação: Pegar do header ou assumir single context
    const { data: instances, error } = await supabase
        .from('instances')
        .select('*');
        
    if (error) throw error;
    
    res.json({ success: true, instances });
  } catch (error) {
    console.error('Erro ao listar instâncias:', error);
    res.status(500).json({ error: error.message });
  }
}

// POST /api/evolution/instances
export async function createInstance(req, res) {
  try {
    const { instanceName, organizationId } = req.body;
    
    if (!instanceName || !organizationId) {
        return res.status(400).json({ error: 'Nome da instância e ID da organização são obrigatórios' });
    }

    // 1. Buscar Configuração Global da Evolution (URL do servidor principal)
    const { data: settings } = await supabase
      .from('site_settings')
      .select('integrations')
      .eq('organization_id', organizationId)
      .single();

    if (!settings?.integrations?.evolutionApi?.baseUrl) {
        return res.status(400).json({ error: 'Evolution API Base URL não configurada nos Settings' });
    }

    const config = settings.integrations.evolutionApi;
    const baseUrl = config.baseUrl;
    const globalApiKey = config.token; // API Key Global da Evolution

    console.log(`🚀 Criando instância ${instanceName} no servidor ${baseUrl}...`);

    // 2. Criar na Evolution API
    // POST /instance/create
    try {
        await axios.post(`${baseUrl}/instance/create`, {
            instanceName: instanceName,
            token: "", // Token aleatório gerado pela Evolution se vazio
            qrcode: true
        }, {
            headers: { 'apikey': globalApiKey }
        });
    } catch (evoError) {
        // Se der erro que já existe, continuamos para garantir que salvamos no DB e configuramos webhook
        if (evoError.response?.data?.error?.includes('already exists')) {
            console.log('⚠️ Instância já existe na Evolution, atualizando configurações...');
        } else {
            throw new Error(`Erro Evolution Create: ${evoError.response?.data?.message || evoError.message}`);
        }
    }

    // 3. Configurar Webhook Automaticamente
    // POST /webhook/set/:instance
    const webhookUrl = `${WEBHOOK_BASE}/${instanceName}`;
    console.log(`🔗 Configurando Webhook: ${webhookUrl}`);

    await axios.post(`${baseUrl}/webhook/set/${instanceName}`, {
        webhookUrl: webhookUrl,
        webhookByEvents: true,
        events: [
            "MESSAGES_UPSERT",
            "MESSAGES_UPDATE",
            "SEND_MESSAGE",
            "CONNECTION_UPDATE"
        ],
        enabled: true,
        webhookHeaders: {
            "Authorization": `Bearer ${WEBHOOK_TOKEN}`
        }
    }, {
        headers: { 'apikey': globalApiKey }
    });

    // 4. Buscar Token da Instância recém criada (opcional, se precisarmos salvar)
    // GET /instance/fetchInstances - filtrando (ou assumindo que usamos a Global Key para controlar)
    
    // 5. Salvar no Banco de Dados ImobiSaaS
    const { data: newInstance, error: dbError } = await supabase
        .from('instances')
        .upsert({
            organization_id: organizationId,
            name: instanceName,
            status: 'created', // Será atualizado pelo webhook de connection
            server_url: baseUrl
        }, { onConflict: 'name' })
        .select()
        .single();
        
    if (dbError) throw dbError;

    res.json({ success: true, instance: newInstance, message: 'Instância criada e webhook configurado!' });

  } catch (error) {
    console.error('❌ Erro ao criar instância:', error);
    res.status(500).json({ error: error.message });
  }
}

// DELETE /api/evolution/instances/:id
export async function deleteInstance(req, res) {
    try {
        const { id } = req.params;
        
        // 1. Buscar dados da instância para saber o nome
        const { data: instance } = await supabase
            .from('instances')
            .select('name, organization_id')
            .eq('id', id)
            .single();
            
        if (!instance) return res.status(404).json({ error: 'Instância não encontrada' });

        // 2. Buscar Configuração
        const { data: settings } = await supabase
            .from('site_settings')
            .select('integrations')
            .eq('organization_id', instance.organization_id)
            .single();
            
        const config = settings?.integrations?.evolutionApi;
            
        if (config) {
            // 3. Deletar na Evolution API
            // DELETE /instance/delete/:instance
            try {
                await axios.delete(`${config.baseUrl}/instance/delete/${instance.name}`, {
                    headers: { 'apikey': config.token }
                });
            } catch (err) {
                console.warn('Erro ao deletar na Evolution (pode já não existir):', err.message);
            }
        }

        // 4. Remover do Banco
        await supabase.from('instances').delete().eq('id', id);

        res.json({ success: true });

    } catch (error) {
        console.error('Erro ao deletar instância:', error);
        res.status(500).json({ error: error.message });
    }
}
