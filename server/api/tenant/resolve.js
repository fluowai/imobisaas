/**
 * API ROUTE - TENANT RESOLVER
 * Endpoint para resolver informações do tenant baseado em domínio ou subdomain
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  const { subdomain, domain } = req.query;
  
  if (!subdomain && !domain) {
    return res.status(400).json({ error: 'Subdomain ou domain é obrigatório' });
  }
  
  try {
    let organization;
    
    // 1. Buscar por domínio customizado primeiro
    if (domain) {
      const { data: domainData, error: domainError } = await supabase
        .from('domains')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('domain', domain)
        .eq('status', 'active')
        .single();
      
      if (domainData && !domainError) {
        organization = domainData.organization;
      }
    }
    
    // 2. Se não encontrou, buscar por subdomain
    if (!organization && subdomain) {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('subdomain', subdomain)
        .single();
      
      if (orgData && !orgError) {
        organization = orgData;
      }
    }
    
    // 3. Verificar se encontrou
    if (!organization) {
      return res.status(404).json({ error: 'Organização não encontrada' });
    }
    
    // 4. Buscar configurações adicionais
    const { data: settings } = await supabase
      .from('site_settings')
      .select('*')
      .eq('organization_id', organization.id)
      .single();
    
    // 5. Retornar dados do tenant
    return res.status(200).json({
      id: organization.id,
      name: organization.name,
      subdomain: organization.subdomain,
      customDomain: domain || null,
      settings: settings || {},
      plan: organization.plan || 'free',
    });
    
  } catch (error) {
    console.error('Erro ao resolver tenant:', error);
    return res.status(500).json({ error: 'Erro ao buscar organização' });
  }
}
