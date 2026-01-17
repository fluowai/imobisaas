/**
 * API ENDPOINT - GET PUBLIC PROPERTIES
 * Retorna propriedades filtradas por tenant para o site público
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  const tenantId = req.headers['x-tenant-id'];
  
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant não identificado' });
  }
  
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('organization_id', tenantId)
      .eq('status', 'published') // Apenas propriedades publicadas
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return res.status(200).json({ data, count: data?.length || 0 });
  } catch (error) {
    console.error('Erro ao buscar propriedades:', error);
    return res.status(500).json({ error: 'Erro ao carregar propriedades' });
  }
}
