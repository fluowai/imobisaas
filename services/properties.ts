import { supabase } from './supabase';
import { Property, PropertyType, PropertyStatus, PropertyPurpose, PropertyAptitude } from '../types';

export const propertyService = {
  // Listar Imóveis
  async list() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapToModel);
  },

  // Obter um Imóvel por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return mapToModel(data);
  },

  // Criar Imóvel
  async create(property: Partial<Property>) {
    const payload = mapToDatabase(property);
    const { data, error } = await supabase
      .from('properties')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return mapToModel(data);
  },

  // Atualizar Imóvel
  async update(id: string, property: Partial<Property>) {
    const payload = mapToDatabase(property);
    const { data, error } = await supabase
      .from('properties')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapToModel(data);
  },

  // Excluir Imóvel
  async delete(id: string) {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Submeter Imóvel (Público)
  async submit(property: Partial<Property>) {
    const payload = mapToDatabase(property);
    payload.status = 'Pendente'; // Força status pendente para submissões públicas
    
    const { data, error } = await supabase
      .from('properties')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return mapToModel(data);
  }
};

// Mappers para converter entre Banco de Dados (snake_case/flat) e Modelo da Aplicação (CamelCase/Nested)
const mapToModel = (dbItem: any): Property => ({
  id: dbItem.id,
  title: dbItem.title,
  description: dbItem.description,
  price: dbItem.price,
  type: dbItem.type as PropertyType,
  purpose: (dbItem.purpose as PropertyPurpose) || PropertyPurpose.SALE,
  aptitude: (dbItem.aptitude as PropertyAptitude[]) || [],
  status: dbItem.status as PropertyStatus,
  location: {
    city: dbItem.city,
    neighborhood: dbItem.neighborhood,
    state: dbItem.state,
    address: dbItem.address
  },
  features: dbItem.features || { bedrooms: 0, bathrooms: 0, area: 0, garages: 0 },
  images: dbItem.images || [],
  highlighted: dbItem.highlighted,
  ownerInfo: dbItem.owner_info,
  brokerId: dbItem.broker_id || '',
  createdAt: dbItem.created_at,
  analysis: dbItem.analysis
});

const mapToDatabase = (model: Partial<Property>): any => ({
  title: model.title,
  description: model.description,
  price: model.price,
  type: model.type,
  purpose: model.purpose,
  aptitude: model.aptitude,
  status: model.status,
  // Flat location fields
  city: model.location?.city,
  neighborhood: model.location?.neighborhood,
  state: model.location?.state,
  address: model.location?.address,
  // JSONB features
  features: model.features,
  images: model.images,
  highlighted: model.highlighted,
  owner_info: model.ownerInfo,
  analysis: model.analysis
});
