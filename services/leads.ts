
import { supabase } from './supabase';
import { Lead } from '../types';

export const leadService = {
  // Create a new lead
  async create(lead: Partial<Lead>) {
    // Basic validation
    if (!lead.name || !lead.phone) {
      throw new Error('Nome e Telefone são obrigatórios');
    }

    const { data, error } = await supabase
      .from('crm_leads')
      .insert({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        property_id: lead.propertyId, // Map propertyId to property_id (snake_case)
        status: 'Novo',
        source: lead.source || 'Site'
      })
      .select()
      .single();

    if (error) throw error;
    
    // --- TRIGGER WHATSAPP AUTOMATION (Async / Fire & Forget) ---
    fetch('http://localhost:3002/api/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: lead.name,
            phone: lead.phone,
            propertyTitle: lead.property?.title || 'Imóvel'
        })
    }).catch(err => console.error('Failed to trigger WhatsApp webhook:', err));

    return mapToModel(data);
  },

  // List leads for Kanban
  async list() {
    const { data, error } = await supabase
      .from('crm_leads')
      .select(`
        *,
        properties (
          title,
          price,
          images
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapToModel);
  },

  // Update lead status (drag and drop)
  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('crm_leads')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapToModel(data);
  }
};

const mapToModel = (dbItem: any): Lead => ({
  id: dbItem.id,
  name: dbItem.name,
  email: dbItem.email,
  phone: dbItem.phone,
  source: dbItem.source,
  status: dbItem.status,
  budget: 0, // Not captured yet
  preferences: {},
  createdAt: dbItem.created_at,
  propertyId: dbItem.property_id,
  property: dbItem.properties ? {
    title: dbItem.properties.title,
    price: dbItem.properties.price,
    image: dbItem.properties.images?.[0]
  } : undefined
});
