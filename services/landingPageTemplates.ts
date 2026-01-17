import { LandingPageTheme, Block, BlockType } from '../types/landingPage';
import { v4 as uuidv4 } from 'uuid';

export interface LandingPageTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  themeConfig: LandingPageTheme;
  blocks: Omit<Block, 'id'>[];
}

// Helper para gerar blocos com IDs únicos
export const generateBlocksFromTemplate = (templateBlocks: Omit<Block, 'id'>[]): Block[] => {
  return templateBlocks.map((block, index) => ({
    ...block,
    id: uuidv4(),
    order: index
  }));
};

export const LANDING_PAGE_TEMPLATES: LandingPageTemplate[] = [
  // ============================================
  // TEMPLATE 1: SONHO RURAL PREMIUM
  // ============================================
  {
    id: 'sonho-rural-premium',
    name: 'Sonho Rural Premium',
    description: 'Hero impactante com formulário em destaque e badges de benefícios',
    thumbnail: '🏔️',
    category: 'Fazendas',
    themeConfig: {
      primaryColor: '#1e40af',
      secondaryColor: '#fbbf24',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontFamily: 'Montserrat',
      borderRadius: '0.5rem',
      spacing: { xs: '0.5rem', sm: '1rem', md: '1.5rem', lg: '2rem', xl: '3rem' },
      fontSize: { base: '1rem', heading1: '3rem', heading2: '2.25rem', heading3: '1.875rem' }
    },
    blocks: [
      {
        type: BlockType.HERO,
        order: 0,
        visible: true,
        config: {
          title: 'Encontre a Fazenda dos Seus Sonhos!',
          subtitle: 'Propriedades Rurais a Venda com as Melhores Oportunidades',
          backgroundImage: '',
          overlayOpacity: 0.4,
          ctaText: 'Agende uma Visita Hoje!',
          ctaLink: '#contato',
          height: 600,
          alignment: 'left',
          textColor: '#ffffff'
        },
        styles: { padding: '0' },
        responsive: {}
      },
      {
        type: BlockType.STATS,
        order: 1,
        visible: true,
        config: {
          stats: [
            { icon: '🌾', value: '500+', label: 'Hectares Disponíveis' },
            { icon: '📍', value: '15+', label: 'Regiões Premium' },
            { icon: '🌳', value: '100%', label: 'Natureza Preservada' }
          ],
          columns: 3
        },
        styles: { padding: '60px 20px', backgroundColor: '#f9fafb' },
        responsive: {}
      },
      {
        type: BlockType.TEXT,
        order: 2,
        visible: true,
        config: {
          content: `<p style="font-size: 1.125rem; line-height: 1.75;">Imagine acordar todos os dias com a vista do <strong>verde infinito</strong>, o som dos pássaros e a sensação de paz que só o campo pode proporcionar.</p>
                    <p style="font-size: 1.125rem; line-height: 1.75;">Nossas fazendas são cuidadosamente selecionadas para oferecer o melhor em <strong>qualidade de vida</strong>, <strong>potencial produtivo</strong> e <strong>valorização</strong>.</p>
                    <p style="font-size: 1.125rem; line-height: 1.75;">Seja para investimento, lazer ou produção, encontre aqui a propriedade ideal para realizar seus sonhos.</p>`,
          fontSize: 18,
          fontWeight: 400,
          color: '#374151',
          alignment: 'center'
        },
        styles: { padding: '60px 40px' },
        responsive: {}
      },
      {
        type: BlockType.PROPERTY_GRID,
        order: 3,
        visible: true,
        config: {
          columns: 3,
          gap: 24,
          showFilters: false,
          maxItems: 6,
          sortBy: 'price',
          cardStyle: 'modern'
        },
        styles: { padding: '60px 20px' },
        responsive: {}
      },
      {
        type: BlockType.CTA,
        order: 4,
        visible: true,
        config: {
          title: 'Pronto para Conhecer Sua Próxima Propriedade?',
          description: 'Agende uma visita exclusiva e veja pessoalmente o potencial do seu futuro investimento',
          buttonText: 'Falar com Especialista Agora',
          buttonLink: 'https://wa.me/5544997223030',
          backgroundColor: '#1e40af',
          textColor: '#ffffff'
        },
        styles: { padding: '80px 20px' },
        responsive: {}
      },
      {
        type: BlockType.FORM,
        order: 5,
        visible: true,
        config: {
          title: 'Agende Sua Visita',
          fields: [
            { name: 'name', type: 'text', label: 'Nome Completo', required: true, placeholder: 'Como prefere ser chamado?' },
            { name: 'phone', type: 'tel', label: 'WhatsApp', required: true, placeholder: '(00) 00000-0000' },
            { name: 'email', type: 'email', label: 'E-mail', required: false, placeholder: 'seu@email.com' },
            { name: 'message', type: 'textarea', label: 'Quando gostaria de visitar?', required: false, placeholder: 'Conte-nos sobre suas expectativas...' }
          ],
          submitText: 'Confirmar Agendamento',
          successMessage: 'Recebemos seu interesse! Entraremos em contato em até 2 horas.'
        },
        styles: { padding: '60px 20px', backgroundColor: '#f9fafb' },
        responsive: {}
      }
    ]
  },

  // ============================================
  // TEMPLATE 2: REFÚGIO RURAL MODERNO
  // ============================================
  {
    id: 'refugio-rural-moderno',
    name: 'Refúgio Rural Moderno',
    description: 'Design com overlay e grid de propriedades em destaque',
    thumbnail: '🏡',
    category: 'Fazendas',
    themeConfig: {
      primaryColor: '#15803d',
      secondaryColor: '#ea580c',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontFamily: 'Poppins',
      borderRadius: '0.75rem',
      spacing: { xs: '0.5rem', sm: '1rem', md: '1.5rem', lg: '2rem', xl: '3rem' },
      fontSize: { base: '1rem', heading1: '2.75rem', heading2: '2.25rem', heading3: '1.875rem' }
    },
    blocks: [
      {
        type: BlockType.HERO,
        order: 0,
        visible: true,
        config: {
          title: 'Fazendas à Venda',
          subtitle: 'Invista no Seu Refúgio Rural com Segurança e Rentabilidade',
          backgroundImage: '',
          overlayOpacity: 0.5,
          ctaText: 'Ver Propriedades Disponíveis',
          ctaLink: '#propriedades',
          height: 650,
          alignment: 'center',
          textColor: '#ffffff'
        },
        styles: { padding: '0' },
        responsive: {}
      },
      {
        type: BlockType.FEATURES,
        order: 1,
        visible: true,
        config: {
          features: [
            { title: 'Áreas de Cultivo Preparadas', description: 'Solo fértil pronto para produção', icon: '🌾' },
            { title: 'Criação de Gado Premium', description: 'Pastagens de alta qualidade', icon: '🐄' },
            { title: 'Lagos e Mata Nativa', description: 'Água abundante e natureza preservada', icon: '🌳' }
          ],
          columns: 3
        },
        styles: { padding: '60px 20px' },
        responsive: {}
      },
      {
        type: BlockType.TEXT,
        order: 2,
        visible: true,
        config: {
          content: `<h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 1.5rem;">Conheça Nossas Melhores Ofertas</h2>
                    <p style="font-size: 1.125rem; line-height: 1.75;">Cada propriedade é uma <strong>oportunidade única</strong> de investimento. Selecionadas criteriosamente, nossas fazendas oferecem infraestrutura completa, localização estratégica e potencial de valorização garantido.</p>`,
          fontSize: 18,
          fontWeight: 400,
          color: '#374151',
          alignment: 'center'
        },
        styles: { padding: '40px 20px' },
        responsive: {}
      },
      {
        type: BlockType.PROPERTY_GRID,
        order: 3,
        visible: true,
        config: {
          columns: 3,
          gap: 32,
          showFilters: false,
          maxItems: 3,
          sortBy: 'price',
          cardStyle: 'modern'
        },
        styles: { padding: '40px 20px', backgroundColor: '#f9fafb' },
        responsive: {}
      },
      {
        type: BlockType.STATS,
        order: 4,
        visible: true,
        config: {
          stats: [
            { icon: '✓', value: '200+', label: 'Propriedades Vendidas' },
            { icon: '★', value: '98%', label: 'Clientes Satisfeitos' },
            { icon: '⚡', value: '15', label: 'Anos de Experiência' }
          ],
          columns: 3
        },
        styles: { padding: '80px 20px' },
        responsive: {}
      },
      {
        type: BlockType.FORM,
        order: 5,
        visible: true,
        config: {
          title: 'Solicite Mais Informações',
          fields: [
            { name: 'name', type: 'text', label: 'Nome', required: true, placeholder: 'Seu nome' },
            { name: 'phone', type: 'tel', label: 'Telefone', required: true, placeholder: '(00) 00000-0000' },
            { name: 'email', type: 'email', label: 'E-mail', required: true, placeholder: 'seu@email.com' }
          ],
          submitText: 'Enviar Solicitação',
          successMessage: 'Obrigado! Entraremos em contato em breve.'
        },
        styles: { padding: '60px 20px', backgroundColor: '#15803d', color: '#ffffff' },
        responsive: {}
      }
    ]
  },

  // ============================================
  // TEMPLATE 3: SONHO DOURADO
  // ============================================
  {
    id: 'sonho-dourado',
    name: 'Sonho Dourado',
    description: 'Layout split com destaque para benefícios e formulário dourado',
    thumbnail: '⭐',
    category: 'Fazendas',
    themeConfig: {
      primaryColor: '#16a34a',
      secondaryColor: '#eab308',
      backgroundColor: '#fef3c7',
      textColor: '#1f2937',
      fontFamily: 'Raleway',
      borderRadius: '1rem',
      spacing: { xs: '0.5rem', sm: '1rem', md: '1.5rem', lg: '2rem', xl: '3rem' },
      fontSize: { base: '1rem', heading1: '2.5rem', heading2: '2rem', heading3: '1.75rem' }
    },
    blocks: [
      {
        type: BlockType.HERO,
        order: 0,
        visible: true,
        config: {
          title: 'Realize Seu Sonho de Ter uma Fazenda!',
          subtitle: 'Fazendas à Venda com Condições Imperdíveis',
          backgroundImage: '',
          overlayOpacity: 0.3,
          ctaText: 'Peça Mais Informações',
          ctaLink: '#form',
          height: 550,
          alignment: 'left',
          textColor: '#ffffff'
        },
        styles: { padding: '0' },
        responsive: {}
      },
      {
        type: BlockType.FEATURES,
        order: 1,
        visible: true,
        config: {
          features: [
            { title: 'Propriedades Agrícolas', description: 'Terras produtivas de alta qualidade', icon: '✓' },
            { title: 'Ideal para Pecuária', description: 'Pastagens preparadas e infraestrutura', icon: '✓' },
            { title: 'Áreas de Lazer e Lagoas', description: 'Espaços de convivência e relaxamento',  icon: '✓' },
            { title: 'Documentação Regularizada', description: 'Segurança jurídica total', icon: '✓' }
          ],
          columns: 2
        },
        styles: { padding: '60px 20px', backgroundColor: '#ffffff' },
        responsive: {}
      },
      {
        type: BlockType.PROPERTY_CAROUSEL,
        order: 2,
        visible: true,
        config: {
          images: [],
          autoplay: true,
          autoplayDelay: 5000,
          showThumbnails: true,
          showDots: true
        },
        styles: { padding: '60px 20px' },
        responsive: {}
      },
      {
        type: BlockType.FORM,
        order: 3,
        visible: true,
        config: {
          title: 'Fale Conosco Agora!',
          fields: [
            { name: 'name', type: 'text', label: 'Seu Nome', required: true, placeholder: 'Nome completo' },
            { name: 'email', type: 'email', label: 'Seu E-mail', required: true, placeholder: 'seu@email.com' },
            { name: 'phone', type: 'tel', label: 'Telefone', required: true, placeholder: '(00) 00000-0000' }
          ],
          submitText: 'Envie Agora',
          successMessage: 'Mensagem enviada! Retornaremos em breve.'
        },
        styles: { padding: '60px 40px', backgroundColor: '#eab308', color: '#1f2937' },
        responsive: {}
      },
      {
        type: BlockType.CTA,
        order: 4,
        visible: true,
        config: {
          title: 'Oportunidade Limitada!',
          description: 'Propriedades exclusivas com preços especiais por tempo limitado',
          buttonText: 'WhatsApp: Falar com Corretor',
          buttonLink: 'https://wa.me/5544997223030',
          backgroundColor: '#16a34a',
          textColor: '#ffffff'
        },
        styles: { padding: '80px 20px' },
        responsive: {}
      }
    ]
  },

  // ============================================
  // TEMPLATE 4: ESSÊNCIA DO CAMPO
  // ============================================
  {
    id: 'essencia-do-campo',
    name: 'Essência do Campo',
    description: 'Design minimalista e clean com foco em storytelling',
    thumbnail: '🌾',
    category: 'Fazendas',
    themeConfig: {
      primaryColor: '#059669',
      secondaryColor: '#0891b2',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontFamily: 'Inter',
      borderRadius: '0.5rem',
      spacing: { xs: '0.5rem', sm: '1rem', md: '1.5rem', lg: '2rem', xl: '3rem' },
      fontSize: { base: '1rem', heading1: '2.5rem', heading2: '2rem', heading3: '1.75rem' }
    },
    blocks: [
      {
        type: BlockType.HERO,
        order: 0,
        visible: true,
        config: {
          title: 'Viva a Essência do Campo',
          subtitle: 'Descubra propriedades que transformam sonhos em realidade',
          backgroundImage: '',
          overlayOpacity: 0.35,
          ctaText: 'Conhecer Propriedades',
          ctaLink: '#propriedades',
          height: 700,
          alignment: 'center',
          textColor: '#ffffff'
        },
        styles: { padding: '0' },
        responsive: {}
      },
      {
        type: BlockType.STATS,
        order: 1,
        visible: true,
        config: {
          stats: [
            { icon: '🏆', value: '1000+', label: 'Hectares Comercializados' },
            { icon: '👥', value: '500+', label: 'Famílias Realizadas' },
            { icon: '🌟', value: '25', label: 'Anos de Tradição' },
            { icon: '💚', value: '100%', label: 'Compromisso com Você' }
          ],
          columns: 4
        },
        styles: { padding: '80px 20px', backgroundColor: '#f0fdfa' },
        responsive: {}
      },
      {
        type: BlockType.TEXT,
        order: 2,
        visible: true,
        config: {
          content: `<h2 style="font-size: 2.25rem; font-weight: bold; margin-bottom: 1.5rem; text-align: center;">Uma Nova Vida Espera por Você</h2>
                    <p style="font-size: 1.25rem; line-height: 1.8; margin-bottom: 1rem;">Há algo especial em <strong>possuir um pedaço de terra</strong>. Não é apenas sobre metros quadrados ou investimento financeiro — é sobre criar raízes, construir legado e viver com propósito.</p>
                    <p style="font-size: 1.25rem; line-height: 1.8; margin-bottom: 1rem;">Nossas propriedades são cuidadosamente selecionadas para oferecer não apenas <strong>potencial econômico</strong>, mas também <strong>qualidade de vida incomparável</strong>.</p>
                    <p style="font-size: 1.25rem; line-height: 1.8;">Seja você um investidor experiente ou alguém buscando uma mudança de vida, temos a propriedade perfeita esperando por você.</p>`,
          fontSize: 20,
          fontWeight: 400,
          color: '#374151',
          alignment: 'left'
        },
        styles: { padding: '80px 60px' },
        responsive: {}
      },
      {
        type: BlockType.PROPERTY_CAROUSEL,
        order: 3,
        visible: true,
        config: {
          images: [],
          autoplay: false,
          autoplayDelay: 4000,
          showThumbnails: true,
          showDots: true
        },
        styles: { padding: '60px 20px', backgroundColor: '#f9fafb' },
        responsive: {}
      },
      {
        type: BlockType.FEATURES,
        order: 4,
        visible: true,
        config: {
          features: [
            { title: 'Infraestrutura Completa', description: 'Energia, água, acesso pavimentado', icon: '⚡' },
            { title: 'Áreas Produtivas', description: 'Solo preparado para agricultura', icon: '🌱' },
            { title: 'Sustentabilidade', description: 'Preservação ambiental certificada', icon: '🌍' },
            { title: 'Suporte Total', description: 'Acompanhamento jurídico e técnico', icon: '🤝' }
          ],
          columns: 2
        },
        styles: { padding: '80px 40px' },
        responsive: {}
      },
      {
        type: BlockType.CTA,
        order: 5,
        visible: true,
        config: {
          title: 'Pronto para Começar?',
          description: 'Entre em contato e descubra como podemos ajudar você a realizar esse sonho',
          buttonText: 'Falar com Especialista',
          buttonLink: 'https://wa.me/5544997223030',
          backgroundColor: '#059669',
          textColor: '#ffffff'
        },
        styles: { padding: '100px 20px' },
        responsive: {}
      },
      {
        type: BlockType.FORM,
        order: 6,
        visible: true,
        config: {
          title: 'Receba Nossa Consultoria Gratuita',
          fields: [
            { name: 'name', type: 'text', label: 'Nome', required: true, placeholder: 'Seu nome completo' },
            { name: 'email', type: 'email', label: 'E-mail', required: true, placeholder: 'seu@email.com' },
            { name: 'phone', type: 'tel', label: 'Telefone', required: true, placeholder: '(00) 00000-0000' },
            { name: 'message', type: 'textarea', label: 'Conte-nos sobre seus objetivos', required: false, placeholder: 'O que você busca em uma propriedade rural?' }
          ],
          submitText: 'Solicitar Consultoria',
          successMessage: 'Obrigado! Nossa equipe entrará em contato em breve.'
        },
        styles: { padding: '80px 40px', backgroundColor: '#f0fdfa' },
        responsive: {}
      }
    ]
  },

  // ============================================
  // TEMPLATE 5: VISTA PANORÂMICA (NOVO)
  // ============================================
  {
    id: 'vista-panoramica',
    name: 'Vista Panorâmica',
    description: 'Layout imersivo com hero full-screen, timeline visual e mapa integrado',
    thumbnail: '🌄',
    category: 'Fazendas',
    themeConfig: {
      primaryColor: '#2d5016',
      secondaryColor: '#e8dcc4',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontFamily: 'Montserrat',
      borderRadius: '0px',
      spacing: { xs: '1rem', sm: '2rem', md: '3rem', lg: '4rem', xl: '5rem' },
      fontSize: { base: '1rem', heading1: '3.5rem', heading2: '2.5rem', heading3: '2rem' }
    },
    blocks: [
      {
        type: BlockType.HEADER,
        order: 0,
        visible: true,
        config: {
          brandName: 'Fazendas Brasil',
          showWhatsApp: true,
          whatsappNumber: '5544997223030',
          sticky: true,
          transparent: true,
          textColor: '#ffffff'
        },
        styles: { padding: '0' },
        containerWidth: 'full'
      },
      {
        type: BlockType.HERO,
        order: 1,
        visible: true,
        config: {
          title: 'Seu Refúgio Particular',
          subtitle: '6.110m² de natureza em Morretes, PR',
          backgroundImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
          overlayOpacity: 0.3,
          ctaText: 'Agendar Visita Presencial',
          ctaLink: '#contato',
          height: 800,
          alignment: 'center',
          textColor: '#ffffff'
        },
        styles: { padding: '0' },
        containerWidth: 'full'
      },
      {
        type: BlockType.STATS,
        order: 2,
        visible: true,
        config: {
          stats: [
            { icon: '🌳', value: '6.110m²', label: 'Área Total' },
            { icon: '🏠', value: '02', label: 'Casas' },
            { icon: '🐟', value: '03', label: 'Tanques de Peixe' }
          ],
          columns: 3
        },
        styles: { padding: '60px 20px', backgroundColor: '#ffffff', marginTop: '-100px', position: 'relative', zIndex: 10, borderRadius: '20px 20px 0 0', maxWidth: '1200px', margin: '-100px auto 0' },
        containerWidth: 'xl'
      },
      {
        type: BlockType.TEXT,
        order: 3,
        visible: true,
        config: {
          content: `<p style="font-size: 1.25rem; line-height: 1.8; text-align: center; max-width: 800px; margin: 0 auto;">Imagine acordar todos os dias com o canto dos pássaros e adormecer com o som do silêncio. Esta chácara em Morretes, PR, é o seu refúgio particular, onde você pode viver o sonho rural.</p>
                    <p style="font-size: 1.25rem; line-height: 1.8; text-align: center; max-width: 800px; margin: 20px auto;">A propriedade conta com 6.110m² de área total, 02 casas, 03 tanques de peixe e muito mais. É o local perfeito para você e sua família se conectar com a natureza e viver momentos inesquecíveis.</p>
                    <p style="font-size: 1.25rem; line-height: 1.8; text-align: center; max-width: 800px; margin: 20px auto;">Não perca a oportunidade de fazer deste sonho uma realidade. Agende uma visita presencial e descubra o que esta chácara pode oferecer para você.</p>`,
          fontSize: 18,
          fontWeight: 400,
          color: '#374151',
          alignment: 'center'
        },
        styles: { padding: '80px 20px' },
        containerWidth: 'md'
      },
      {
        type: BlockType.PROPERTY_CAROUSEL,
        order: 4,
        visible: true,
        config: {
          images: [],
          autoplay: true,
          autoplayDelay: 4000,
          showThumbnails: true,
          showDots: true
        },
        styles: { padding: '0' },
        containerWidth: 'full'
      },
      {
        type: BlockType.TIMELINE,
        order: 5,
        visible: true,
        config: {
          title: 'Conheça a Propriedade',
          items: [
            { title: 'Entrada Privativa', description: 'Porteira fechada com acesso exclusivo e seguro.', time: 'Chegada' },
            { title: 'Casa Principal', description: 'Ampla varanda, 3 quartos e sala integrada.', time: 'Conforto' },
            { title: 'Área de Lazer', description: 'Churrasqueira, piscina natural e pomar.', time: 'Diversão' },
            { title: 'Tanques de Peixe', description: '3 lagos prontos para piscicultura ou lazer.', time: 'Natureza' }
          ]
        },
        styles: { padding: '80px 20px', backgroundColor: '#f9fafb' },
        containerWidth: 'lg'
      },
      {
        type: BlockType.MAP,
        order: 6,
        visible: true,
        config: {
          address: 'Morretes, Paraná, Brasil',
          title: 'Localização Privilegiada',
          description: 'Fácil acesso, próximo à natureza e à cidade.',
          zoom: 13,
          height: 450,
          showCard: true
        },
        styles: { padding: '0' },
        containerWidth: 'full'
      },
      {
        type: BlockType.CTA,
        order: 7,
        visible: true,
        config: {
          title: 'Seu Sonho Começa Aqui',
          description: 'Entre em contato agora mesmo e agende sua visita.',
          buttonText: 'Chamar no WhatsApp',
          buttonLink: 'https://wa.me/5544997223030',
          backgroundColor: '#2d5016',
          textColor: '#ffffff'
        },
        styles: { padding: '100px 20px' },
        containerWidth: 'full'
      },
      {
        type: BlockType.FOOTER,
        order: 8,
        visible: true,
        config: {
          companyName: 'Fazendas Brasil',
          description: 'Especialistas em realizar sonhos rurais.',
          phone: '(44) 3030-3030',
          whatsapp: '5544997223030',
          email: 'contato@fazendasbrasil.com.br',
          address: 'Av. Brasil, 1234 - Maringá, PR',
          copyrightText: '© 2024 Fazendas Brasil. Todos os direitos reservados.'
        },
        styles: { padding: '0' },
        containerWidth: 'full'
      }
    ]
  },

  // ============================================
  // TEMPLATE 6: LUXO NO CAMPO (NOVO)
  // ============================================
  {
    id: 'luxo-no-campo',
    name: 'Luxo no Campo',
    description: 'Design sofisticado com cores escuras e toques dourados para propriedades de alto padrão',
    thumbnail: '✨',
    category: 'Fazendas',
    themeConfig: {
      primaryColor: '#c9a961',
      secondaryColor: '#1a1a1a',
      backgroundColor: '#111111',
      textColor: '#f3f4f6',
      fontFamily: 'Playfair Display',
      borderRadius: '0px',
      spacing: { xs: '1.5rem', sm: '2.5rem', md: '3.5rem', lg: '5rem', xl: '6rem' },
      fontSize: { base: '1.1rem', heading1: '4rem', heading2: '3rem', heading3: '2.5rem' }
    },
    blocks: [
      {
        type: BlockType.HEADER,
        order: 0,
        visible: true,
        config: {
          brandName: 'IMPERIAL REALTY',
          showWhatsApp: false,
          sticky: true,
          transparent: true,
          textColor: '#ffffff'
        },
        styles: { padding: '0', borderBottom: '1px solid rgba(255,255,255,0.1)' },
        containerWidth: 'full'
      },
      {
        type: BlockType.HERO,
        order: 1,
        visible: true,
        config: {
          title: 'Exclusividade e Natureza',
          subtitle: 'Uma propriedade única para quem exige o extraordinário.',
          backgroundImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
          overlayOpacity: 0.5,
          ctaText: 'Solicitar Dossiê Privado',
          ctaLink: '#contato',
          height: 900,
          alignment: 'center',
          textColor: '#ffffff'
        },
        styles: { padding: '0' },
        containerWidth: 'full'
      },
      {
        type: BlockType.TEXT,
        order: 2,
        visible: true,
        config: {
          content: `<h2 style="text-align: center; color: #c9a961; margin-bottom: 40px; text-transform: uppercase; letter-spacing: 3px; font-size: 1.5rem;">A Propriedade</h2>
                    <p style="font-size: 1.5rem; line-height: 1.8; text-align: center; max-width: 900px; margin: 0 auto; color: #d1d5db;">Localizada no coração de uma região preservada, esta fazenda representa o ápice do luxo rural. Cada detalhe foi pensado para oferecer uma experiência de vida inigualável, unindo o conforto moderno à serenidade do campo.</p>`,
          fontSize: 24,
          fontWeight: 300,
          color: '#d1d5db',
          alignment: 'center'
        },
        styles: { padding: '120px 20px', backgroundColor: '#111111' },
        containerWidth: 'lg'
      },
      {
        type: BlockType.STATS,
        order: 3,
        visible: true,
        config: {
          stats: [
            { icon: '💎', value: '1.200ha', label: 'Área Total' },
            { icon: '🚁', value: 'Heliporto', label: 'Privativo' },
            { icon: '🍷', value: 'Adega', label: 'Subterrânea' },
            { icon: '🏇', value: 'Haras', label: 'Completo' }
          ],
          columns: 4
        },
        styles: { padding: '80px 20px', backgroundColor: '#1a1a1a', borderTop: '1px solid #333', borderBottom: '1px solid #333' },
        containerWidth: 'xl'
      },
      {
        type: BlockType.PROPERTY_CAROUSEL,
        order: 4,
        visible: true,
        config: {
          images: [],
          autoplay: false,
          showThumbnails: true,
          showDots: false
        },
        styles: { padding: '120px 0', backgroundColor: '#111111' },
        containerWidth: 'full'
      },
      {
        type: BlockType.TIMELINE,
        order: 5,
        visible: true,
        config: {
          title: 'História e Legado',
          color: '#c9a961',
          items: [
            { title: 'Fundação', description: 'Estabelecida em 1950, mantendo a arquitetura colonial original.', time: '1950' },
            { title: 'Restauração', description: 'Restauro completo da casa sede premiado internacionalmente.', time: '2018' },
            { title: 'Modernização', description: 'Implementação de sistemas sustentáveis e automação.', time: '2022' }
          ]
        },
        styles: { padding: '100px 20px', backgroundColor: '#1a1a1a' },
        containerWidth: 'lg'
      },
      {
        type: BlockType.CTA,
        order: 6,
        visible: true,
        config: {
          title: 'Atendimento Personalizado',
          description: 'Nossa equipe de concierge está à disposição para agendar sua visita.',
          buttonText: 'Contatar Concierge',
          buttonLink: 'https://wa.me/5544997223030',
          backgroundColor: '#c9a961',
          textColor: '#000000'
        },
        styles: { padding: '120px 20px', backgroundColor: '#111111' },
        containerWidth: 'md'
      },
      {
        type: BlockType.FOOTER,
        order: 7,
        visible: true,
        config: {
          companyName: 'IMPERIAL REALTY',
          description: 'Curadoria de propriedades extraordinárias.',
          phone: '+55 (44) 3030-3030',
          email: 'private@imperial.com',
          copyrightText: '© 2024 Imperial Realty. Exclusive Rights.',
          backgroundColor: '#000000',
          textColor: '#6b7280'
        },
        styles: { padding: '0' },
        containerWidth: 'full'
      }
    ]
  },

  // ============================================
  // TEMPLATE 7: VIDA RURAL AUTÊNTICA (NOVO)
  // ============================================
  {
    id: 'vida-rural',
    name: 'Vida Rural Autêntica',
    description: 'Estilo editorial tipo blog/revista para contar a história da propriedade',
    thumbnail: '🏡',
    category: 'Sítios',
    themeConfig: {
      primaryColor: '#8b4513',
      secondaryColor: '#6b8e23',
      backgroundColor: '#fffbeb',
      textColor: '#4b5563',
      fontFamily: 'Merriweather',
      borderRadius: '8px',
      spacing: { xs: '1rem', sm: '1.5rem', md: '2rem', lg: '3rem', xl: '4rem' },
      fontSize: { base: '1.125rem', heading1: '3rem', heading2: '2.25rem', heading3: '1.5rem' }
    },
    blocks: [
      {
        type: BlockType.HEADER,
        order: 0,
        visible: true,
        config: {
          brandName: 'Vida no Campo',
          sticky: false,
          backgroundColor: '#fffbeb',
          textColor: '#4b5563'
        },
        styles: { padding: '0', borderBottom: '1px solid #e5e7eb' },
        containerWidth: 'full'
      },
      {
        type: BlockType.HERO,
        order: 1,
        visible: true,
        config: {
          title: 'Onde o Tempo Passa Mais Devagar',
          subtitle: 'Uma jornada para reencontrar suas raízes e viver com propósito',
          backgroundImage: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
          overlayOpacity: 0.2,
          ctaText: 'Ler a História',
          ctaLink: '#historia',
          height: 600,
          alignment: 'center',
          textColor: '#ffffff'
        },
        styles: { padding: '0' },
        containerWidth: 'full'
      },
      {
        type: BlockType.TEXT,
        order: 2,
        visible: true,
        config: {
          content: `<p style="font-family: Merriweather; font-size: 1.25rem; line-height: 2; margin-bottom: 2rem;">Era uma manhã de neblina quando visitamos este lugar pela primeira vez. O ar fresco da serra, o cheiro de terra molhada e o silêncio quebrado apenas pelo canto dos pássaros nos conquistaram imediatamente.</p>
                    <p style="font-family: Merriweather; font-size: 1.25rem; line-height: 2; margin-bottom: 2rem;">Esta propriedade não é apenas um pedaço de terra; é um convite para desacelerar. Aqui, os dias são marcados pelo nascer e pôr do sol, não pelo relógio. As árvores frutíferas contam histórias de estações passadas, e o riacho que corta o terreno traz a melodia constante da natureza.</p>
                    <blockquote style="border-left: 4px solid #8b4513; padding-left: 20px; font-style: italic; color: #8b4513; margin: 40px 0; font-size: 1.5rem;">"Viver aqui é redescobrir o que realmente importa na vida."</blockquote>`,
          fontSize: 20,
          fontWeight: 400,
          color: '#4b5563',
          alignment: 'left'
        },
        styles: { padding: '80px 20px', maxWidth: '800px', margin: '0 auto' },
        containerWidth: 'md'
      },
      {
        type: BlockType.PROPERTY_CAROUSEL,
        order: 3,
        visible: true,
        config: {
          images: [],
          autoplay: false,
          showThumbnails: false,
          showDots: true
        },
        styles: { padding: '40px 0' },
        containerWidth: 'lg'
      },
      {
        type: BlockType.TIMELINE,
        order: 4,
        visible: true,
        config: {
          title: 'Um Dia no Sítio',
          color: '#6b8e23',
          items: [
            { title: '06:00 - O Despertar', description: 'Café da manhã na varanda vendo o nascer do sol.', time: 'Manhã' },
            { title: '09:00 - Horta e Jardim', description: 'Colheita de vegetais frescos para o almoço.', time: 'Manhã' },
            { title: '14:00 - Pesca e Leitura', description: 'Tarde tranquila à beira do lago.', time: 'Tarde' },
            { title: '19:00 - Fogueira', description: 'Fim de dia reunido ao redor do fogo sob as estrelas.', time: 'Noite' }
          ]
        },
        styles: { padding: '80px 20px', backgroundColor: '#f3f4f6' },
        containerWidth: 'lg'
      },
      {
        type: BlockType.MAP,
        order: 5,
        visible: true,
        config: {
          address: 'Serra da Mantiqueira, Brasil',
          title: 'Escondido nas Montanhas',
          zoom: 12,
          height: 500
        },
        styles: { padding: '60px 0' },
        containerWidth: 'full'
      },
      {
        type: BlockType.FORM,
        order: 6,
        visible: true,
        config: {
          title: 'Escreva um Novo Capítulo',
          submitText: 'Enviar Mensagem',
          successMessage: 'Mensagem enviada com carinho!',
          fields: [
            { name: 'name', type: 'text', label: 'Nome', required: true, placeholder: '' },
            { name: 'message', type: 'textarea', label: 'Mensagem', required: true, placeholder: 'Conte-nos o que você busca...' }
          ]
        },
        styles: { padding: '80px 20px', backgroundColor: '#fffbeb' },
        containerWidth: 'sm'
      },
      {
        type: BlockType.FOOTER,
        order: 7,
        visible: true,
        config: {
          companyName: 'Vida no Campo Imóveis',
          copyrightText: '© 2024. Feito com amor.',
          backgroundColor: '#8b4513',
          textColor: '#ffffff'
        },
        styles: { padding: '0' },
        containerWidth: 'full'
      }
    ]
  },

  // ============================================
  // TEMPLATE 8: INVESTIMENTO GARANTIDO (NOVO)
  // ============================================
  {
    id: 'investimento-garantido',
    name: 'Investimento Garantido',
    description: 'Focado em dados, ROI e segurança para investidores do agronegócio',
    thumbnail: '💰',
    category: 'Investimento',
    themeConfig: {
      primaryColor: '#1e3a8a',
      secondaryColor: '#64748b',
      backgroundColor: '#f8fafc',
      textColor: '#0f172a',
      fontFamily: 'Inter',
      borderRadius: '4px',
      spacing: { xs: '1rem', sm: '2rem', md: '3rem', lg: '4rem', xl: '5rem' },
      fontSize: { base: '1rem', heading1: '3rem', heading2: '2.25rem', heading3: '1.5rem' }
    },
    blocks: [
      {
        type: BlockType.HEADER,
        order: 0,
        visible: true,
        config: {
          brandName: 'AGRO INVEST',
          showPhone: true,
          phoneNumber: '0800 123 4567',
          sticky: true,
          backgroundColor: '#1e3a8a',
          textColor: '#ffffff'
        },
        styles: { padding: '0' },
        containerWidth: 'full'
      },
      {
        type: BlockType.HERO,
        order: 1,
        visible: true,
        config: {
          title: 'Oportunidade de Alto Retorno',
          subtitle: 'Fazenda Produtiva com ROI Estimado de 12% a.a.',
          backgroundImage: 'https://images.unsplash.com/photo-1625246333195-58197b3c4895?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
          overlayOpacity: 0.6,
          ctaText: 'Baixar Prospecto',
          ctaLink: '#download',
          height: 600,
          alignment: 'left',
          textColor: '#ffffff'
        },
        styles: { padding: '0' },
        containerWidth: 'full'
      },
      {
        type: BlockType.STATS,
        order: 2,
        visible: true,
        config: {
          stats: [
            { icon: '📈', value: '12%', label: 'Retorno Anual' },
            { icon: '💰', value: 'R$ 15M', label: 'Valor de Mercado' },
            { icon: '🚜', value: '100%', label: 'Maquinário Incluso' },
            { icon: '📜', value: '100%', label: 'Documentação OK' }
          ],
          columns: 4
        },
        styles: { padding: '60px 20px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
        containerWidth: 'xl'
      },
      {
        type: BlockType.TEXT,
        order: 3,
        visible: true,
        config: {
          content: `<h2 style="color: #1e3a8a; font-weight: 700; margin-bottom: 2rem;">Análise de Viabilidade</h2>
                    <p>Esta propriedade está situada no eixo logístico estratégico da região, facilitando o escoamento da safra. Com solo corrigido e altos índices de produtividade nos últimos 5 anos, representa uma aquisição segura e rentável.</p>
                    <ul>
                      <li>✔ Análise de solo recente disponível</li>
                      <li>✔ Histórico de produtividade auditado</li>
                      <li>✔ Sem passivos ambientais ou trabalhistas</li>
                    </ul>`,
          fontSize: 18,
          fontWeight: 400,
          color: '#334155',
          alignment: 'left'
        },
        styles: { padding: '80px 20px' },
        containerWidth: 'lg'
      },
      {
        type: BlockType.PROPERTY_GRID,
        order: 4,
        visible: true,
        config: {
          columns: 2,
          gap: 24,
          showFilters: false,
          maxItems: 4,
          sortBy: 'price',
          cardStyle: 'modern'
        },
        styles: { padding: '60px 20px', backgroundColor: '#f1f5f9' },
        containerWidth: 'xl'
      },
      {
        type: BlockType.CTA,
        order: 5,
        visible: true,
        config: {
          title: 'Receba o Valuation Completo',
          description: 'Acesse o relatório detalhado com fluxo de caixa projetado e análise de mercado.',
          buttonText: 'Solicitar Acesso',
          buttonLink: '#cadastro',
          backgroundColor: '#1e3a8a',
          textColor: '#ffffff'
        },
        styles: { padding: '100px 20px' },
        containerWidth: 'md'
      },
      {
        type: BlockType.FOOTER,
        order: 6,
        visible: true,
        config: {
          companyName: 'Agro Invest Capital',
          copyrightText: '© 2024 Agro Invest. Todos os direitos reservados.',
          backgroundColor: '#0f172a',
          textColor: '#94a3b8'
        },
        styles: { padding: '0' },
        containerWidth: 'full'
      }
    ]
  }
];

// Helper para buscar template por ID
export const getTemplateById = (id: string): LandingPageTemplate | undefined => {
  return LANDING_PAGE_TEMPLATES.find(t => t.id === id);
};

// Helper para filtrar templates por categoria
export const getTemplatesByCategory = (category: string): LandingPageTemplate[] => {
  if (category === 'all') return LANDING_PAGE_TEMPLATES;
  return LANDING_PAGE_TEMPLATES.filter(t => t.category === category);
};
