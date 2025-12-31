
export enum PropertyStatus {
  AVAILABLE = 'Disponível',
  RENTED = 'Alugado',
  SOLD = 'Vendido',
  RESERVED = 'Reservado',
  PENDING = 'Pendente'
}

export enum PropertyType {
  APARTMENT = 'Apartamento',
  HOUSE = 'Casa',
  CONDO = 'Condomínio',
  LAND = 'Terreno',
  COMMERCIAL = 'Comercial'
}

export interface Property {
  id: string;
  title: string;
  description: string;
  descriptionDraft?: string;
  price: number;
  type: PropertyType;
  status: PropertyStatus;
  location: {
    city: string;
    neighborhood: string;
    state: string;
    address: string;
  };
  features: {
    bedrooms: number;
    bathrooms: number;
    area: number;
    garages: number;
  };
  images: string[];
  highlighted?: boolean;
  ownerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  brokerId: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'Novo' | 'Em Atendimento' | 'Proposta' | 'Fechado' | 'Perdido';
  budget: number;
  preferences: {
    type?: PropertyType;
    neighborhood?: string;
  };
  createdAt: string;
  propertyId?: string;
  notes?: string;
  property?: {
    title: string;
    price: number;
    image: string;
  };
}

export interface User {
  id: string;
  name: string;
  role: 'ADMIN' | 'BROKER';
  agencyName: string;
  avatar: string;
}

export interface SiteSettings {
  id?: string; // Add optional ID for database persistence
  agencyName: string; // Add agency name
  templateId: 'modern' | 'classic' | 'minimal';
  primaryColor: string;
  secondaryColor: string;
  headerColor?: string; // Add specific header color
  logoUrl: string;
  logoHeight?: number; // Tamanho da logo em pixels
  fontFamily?: string; // Fonte principal
  baseFontSize?: number; // Tamanho base do texto
  headingFontSize?: number; // Tamanho dos títulos
  contactPhone: string;
  contactEmail: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
  footerText: string;
  homeContent?: {
    heroTitle?: string;
    heroSubtitle?: string;
    featuredTitle?: string;
    featuredSubtitle?: string;
    featuredDescription?: string;
    badgeText?: string;
    heroFontSize?: number;
    broker?: {
      name?: string;
      photoUrl?: string;
      creci?: string;
      specialty?: string;
      phone?: string;
      instagram?: string;
    };
  };
  integrations?: {
    evolutionApi?: {
      baseUrl: string;
      token: string;
      instanceName: string;
      enabled: boolean;
    };
  };
}
