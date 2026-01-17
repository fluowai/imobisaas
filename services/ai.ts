import Groq from 'groq-sdk';
import { Property } from '../types';
import { LandingPage, BlockType, BlockConfig, LandingPageTheme, Block } from '../types/landingPage';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';

export const generateLandingPageFromProperty = async (property: Property): Promise<Partial<LandingPage>> => {
  // 1. Try to get key from DB first
  let apiKey = import.meta.env.VITE_GROQ_API_KEY || '';

  try {
    const { data } = await supabase
      .from('site_settings')
      .select('integrations')
      .single();
    
    if (data?.integrations?.groq?.apiKey) {
      apiKey = data.integrations.groq.apiKey;
    }
  } catch (err) {
    console.warn('Failed to fetch API key from DB, using env fallback', err);
  }

  if (!apiKey) {
    throw new Error('Groq API Key not configured. Please add it in System Settings.');
  }

  // Initialize Groq with the dynamic key
  const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  // Construct enhanced prompt with copywriting expertise
  const propertyImages = property.images && property.images.length > 0 
    ? property.images 
    : [];
  
  const prompt = `
Você é um ESPECIALISTA em copywriting imobiliário e marketing de alto padrão.
Sua missão: criar uma landing page IRRESISTÍVEL para vender este imóvel rural.

=== DADOS DO IMÓVEL ===
Título: ${property.title}
Tipo: ${property.type}
Preço: R$ ${property.price.toLocaleString('pt-BR')}
Localização: ${property.location.city} - ${property.location.state}
Endereço: ${property.location.address || property.location.neighborhood}

Área: ${property.features.areaHectares} hectares
Casa Sede: ${property.features.casaSede ? 'Sim' : 'Não'}
Casas de Caseiros: ${property.features.caseiros || 0}
Galpões: ${property.features.galpoes || 0}
Currais: ${property.features.currais ? 'Sim' : 'Não'}
Tipo de Solo: ${property.features.tipoSolo || 'Não informado'}
Uso Atual: ${property.features.usoAtual?.join(', ') || 'Não informado'}
Fontes de Água: ${property.features.fontesAgua?.join(', ') || 'Não informado'}
Mata Nativa: ${property.features.percentualMata ? property.features.percentualMata + '%' : 'Não informado'}

Descrição Original: 
${property.description}

Imagens Disponíveis: ${propertyImages.length} fotos profissionais

=== SUA TAREFA ===
Gerar um JSON com blocos de landing page que VENDEM.

REGRAS DE OURO DO COPYWRITING:
1. BENEFÍCIOS > Características (ex: "Acorde com o canto dos pássaros" em vez de "Mata nativa")
2. EMOÇÃO > Razão (criar desejo, não só informar)
3. ESPECÍFICO > Genérico (números exatos, detalhes concretos)
4. AÇÃO > Passividade (verbos fortes: descubra, garanta, conquiste)
5. URGÊNCIA e EXCLUSIVIDADE (criar senso de oportunidade única)

ESTRUTURA OBRIGATÓRIA:

{
  "name": "Nome curto para a página (ex: 'fazenda-paraiso-morretes')",
  "title": "Título SEO com localização e tipo",
  "description": "Meta description de 150-160 caracteres vendendo o sonho",
  "themeConfig": {
    "primaryColor": "#2d5016",
    "secondaryColor": "#8b4513", 
    "fontFamily": "Montserrat"
  },
  "blocks": [...]
}

BLOCOS (ordem exata):

1. HERO - Primeira Impressão Matadora
{
  "type": "hero",
  "config": {
    "title": "Título EMOCIONAL e ASPIRACIONAL (máx 60 caracteres)
             Exemplos:
             ❌ 'Fazenda em ${property.location.city}'
             ✅ 'Seu Refúgio Particular no Coração de ${property.location.city}'
             ✅ 'Viva o Sonho Rural a Apenas 1h da Cidade'",
    "subtitle": "Complemento com NÚMEROS CONCRETOS e LOCALIZAÇÃO
                 Ex: '${property.features.areaHectares} hectares de natureza preservada em ${property.location.city}'",
    "backgroundImage": "${propertyImages[0] || ''}",
    "overlayOpacity": 0.4,
    "ctaText": "CTA ESPECÍFICA (ex: 'Agendar Visita Presencial', 'Ver Fotos Completas')",
    "ctaLink": "#contato",
    "height": 600,
    "alignment": "center",
    "textColor": "#ffffff"
  }
}

2. STATS - Números que Impressionam
{
  "type": "stats",
  "config": {
    "stats": [
      {
        "value": "${property.features.areaHectares} ha",
        "label": "Descrição ASPIRACIONAL do número (ex: 'De Pura Natureza')",
        "icon": "🌿"
      },
      {
        "value": "Número relevante 2 (ex: estruturas, anos, % mata)",
        "label": "Benefício do número",
        "icon": "emoji"
      },
      {
        "value": "Número relevante 3",
        "label": "Benefício",
        "icon": "emoji"
      }
    ],
    "columns": 3
  }
}

3. TEXT - Descrição Persuasiva (NÃO copie a descrição original!)
{
  "type": "text",
  "config": {
    "content": "<p>PARÁGRAFO 1: Abertura emocional criando o SONHO</p>
                <p>PARÁGRAFO 2: Benefícios concretos transformando características em VANTAGENS</p>
                <p>PARÁGRAFO 3: Exclusividade e chamada para ação suave</p>
                
                TÉCNICAS:
                - Usar 'você' e 'seu' (personalizar)
                - Pintar cenários (storytelling)
                - Focar em TRANSFORMAÇÃO DE VIDA
                - Destacar em <strong>negrito</strong> palavras-chave",
    "fontSize": 16,
    "fontWeight": 400,
    "color": "#374151",
    "alignment": "left"
  }
}

4. FEATURES - Amenidades como DIFERENCIAIS Premium
{
  "type": "features",
  "config": {
    "features": [
      Gerar 6-8 features baseadas nos dados do imóvel.
      TRANSFORMAR características em BENEFÍCIOS:
      
      ❌ "Casa Sede: Sim"
      ✅ {
        "title": "Casa Sede Completa",
        "description": "Espaço pronto para receber sua família com conforto",
        "icon": "🏡"
      }
      
      ❌ "Fontes de água: Rio, Nascente"
      ✅ {
        "title": "3 Fontes de Água Natural",
        "description": "Autonomia hídrica total para você e seus projetos",
        "icon": "💧"
      }
    ],
    "columns": 3
  }
}

5. PROPERTY_CAROUSEL - Carrossel Profissional de Fotos
{
  "type": "property_carousel",
  "config": {
    "images": ${JSON.stringify(propertyImages.map((url, i) => ({
      src: url,
      alt: `${property.title} - Vista ${i + 1}`,
      caption: `Gerar legenda DESCRITIVA e VENDEDORA para cada foto (ex: "Vista panorâmica da propriedade ao entardecer")`
    })))},
    "autoplay": false,
    "autoplayDelay": 4000,
    "showThumbnails": true,
    "showDots": true
  }
}

6. CTA - Chamada Final Urgente
{
  "type": "cta",
  "config": {
    "title": "Título com URGÊNCIA ou EXCLUSIVIDADE
             Ex: 'Esta Oportunidade Não Vai Durar Muito Tempo'
             Ex: 'Garanta Sua Visita Exclusiva Hoje'",
    "description": "Texto curto reforçando o VALOR ÚNICO desta propriedade",
    "buttonText": "WhatsApp: Falar com Especialista AGORA",
    "buttonLink": "https://wa.me/5544997223030",
    "backgroundColor": "#2d5016",
    "textColor": "#ffffff"
  }
}

7. FORM - Captura de Lead
{
  "type": "form",
  "config": {
    "title": "Agendar Visita Presencial",
    "fields": [
      {"name": "name", "type": "text", "label": "Nome Completo", "required": true, "placeholder": "Como prefere ser chamado?"},
      {"name": "phone", "type": "tel", "label": "WhatsApp", "required": true, "placeholder": "(00) 00000-0000"},
      {"name": "email", "type": "email", "label": "E-mail", "required": false, "placeholder": "seu@email.com"},
      {"name": "message", "type": "textarea", "label": "Quando gostaria de visitar?", "required": false, "placeholder": "Conte-nos sobre suas expectativas..."}
    ],
    "submitText": "Confirmar Agendamento",
    "successMessage": "Recebemos seu interesse! Entraremos em contato em até 2 horas."
  }
}

CRÍTICO:
- TODOS os títulos devem ser ÚNICOS e específicos deste imóvel
- NÃO use textos genéricos ou placeholders
- FOQUE em vendas, não informações
- Use gatilhos mentais: escassez, exclusividade, prova social, autoridade

RETORNE APENAS O JSON. SEM MARKDOWN. SEM EXPLICAÇÕES.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a JSON generator. You always return valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      response_format: { type: "json_object" }
    });

    const text = completion.choices[0]?.message?.content || '{}';
    
    const parsed = JSON.parse(text);
    
    // Post-process to ensure IDs and types match our system
    let blocks: Block[] = (parsed.blocks || []).map((b: any, index: number) => ({
      id: uuidv4(),
      type: b.type as BlockType,
      order: index,
      visible: true,
      config: b.config,
      styles: { padding: '40px 20px' },
      responsive: {}
    }));

    // FORCE property images into blocks (post-processing override)
    if (propertyImages.length > 0) {
      // 1. Find hero block and inject first image
      const heroBlock = blocks.find(b => b.type === BlockType.HERO);
      if (heroBlock && heroBlock.config) {
        (heroBlock.config as any).backgroundImage = propertyImages[0];
      }

      // 2. Find or create PROPERTY_CAROUSEL block if 2+ images
      if (propertyImages.length >= 2) {
        let carouselBlock = blocks.find(b => b.type === BlockType.PROPERTY_CAROUSEL);
        
        // Convert image URLs to carousel format
        const carouselImages = propertyImages.map((url, idx) => ({
          src: url,
          alt: `${property.title} - Vista ${idx + 1}`,
          caption: `Explore cada detalhe desta propriedade`
        }));
        
        if (!carouselBlock) {
          // Create new carousel block
          carouselBlock = {
            id: uuidv4(),
            type: BlockType.PROPERTY_CAROUSEL,
            order: blocks.length,
            visible: true,
            config: {
              images: carouselImages,
              autoplay: false,
              autoplayDelay: 4000,
              showThumbnails: true,
              showDots: true
            } as any,
            styles: { padding: '40px 20px' },
            responsive: {}
          };
          blocks.push(carouselBlock);
        } else {
          // Update existing carousel
          carouselBlock.config = {
            ...carouselBlock.config,
            images: carouselImages,
            autoplay: false,
            autoplayDelay: 4000,
            showThumbnails: true,
            showDots: true
          } as any;
        }
      }

      // 3. Find image blocks and populate them
      blocks.forEach((block, index) => {
        if (block.type === BlockType.IMAGE && propertyImages[index + 1]) {
          block.config = {
            ...block.config,
            src: propertyImages[index + 1] || propertyImages[0],
            alt: property.title
          };
        }
      });
    }

    return {
      name: parsed.name || property.title,
      title: parsed.title || property.title,
      description: parsed.description || property.description,
      themeConfig: {
        ...parsed.themeConfig,
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        borderRadius: '0.5rem',
        spacing: { xs: '0.5rem', sm: '1rem', md: '1.5rem', lg: '2rem', xl: '3rem' },
        fontSize: { base: '1rem', heading1: '2.5rem', heading2: '2rem', heading3: '1.75rem' }
      } as LandingPageTheme,
      blocks: blocks
    };

  } catch (error) {
    console.error('Error generating landing page:', error);
    throw new Error('Failed to generate landing page content: ' + (error as any).message);
  }
};
