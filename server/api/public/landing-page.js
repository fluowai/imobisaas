/**
 * API ENDPOINT - GET PUBLIC LANDING PAGE
 * Retorna landing page específica do tenant
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  const { slug } = req.query;
  const tenantId = req.headers['x-tenant-id'];
  
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant não identificado' });
  }
  
  if (!slug) {
    return res.status(400).json({ error: 'Slug é obrigatório' });
  }
  
  try {
    const { data, error } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('organization_id', tenantId)
      .eq('slug', slug)
      .eq('published', true)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Landing page não encontrada' });
    }
    
    // Incrementar contador de visualizações
    await supabase.rpc('increment_landing_page_views', { page_id: data.id });
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar landing page:', error);
    return res.status(500).json({ error: 'Erro ao carregar página' });
  }
}
