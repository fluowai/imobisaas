/**
 * API ENDPOINT - GET CURRENT TENANT
 * Retorna informações do tenant baseado nos headers da requisição
 * Usado pelo TenantContext no site público
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Pegar informações do tenant dos headers (setados pelo middleware)
  const tenantId = req.headers['x-tenant-id'];
  const tenantName = req.headers['x-tenant-name'];
  const tenantSubdomain = req.headers['x-tenant-subdomain'];
  const tenantType = req.headers['x-tenant-type'];
  
  // Se for admin, retornar erro
  if (tenantType === 'admin') {
    return res.status(400).json({ error: 'Admin panel não tem tenant' });
  }
  
  // Se não tem tenant ID, tentar resolver pelo host
  if (!tenantId) {
    const host = req.headers.host || req.headers['x-forwarded-host'];
    
    if (!host) {
      return res.status(400).json({ error: 'Não foi possível identificar o domínio' });
    }
    
    // Redirecionar para o endpoint de resolução
    const { subdomain, domain } = extractDomainInfo(host);
    
    try {
      const tenant = await resolveTenant(subdomain, domain);
      return res.status(200).json(tenant);
    } catch (error) {
      return res.status(404).json({ error: 'Site não encontrado' });
    }
  }
  
  // Retornar informações do tenant dos headers
  try {
    const { data: organization } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', tenantId)
      .single();
    
    const { data: settings } = await supabase
      .from('site_settings')
      .select('*')
      .eq('organization_id', tenantId)
      .single();
    
    return res.status(200).json({
      id: organization.id,
      name: organization.name || tenantName,
      subdomain: organization.subdomain || tenantSubdomain,
      settings: settings || {},
      plan: organization.plan || 'free',
    });
  } catch (error) {
    console.error('Erro ao buscar tenant:', error);
    return res.status(500).json({ error: 'Erro ao carregar informações do site' });
  }
}

function extractDomainInfo(host: string) {
  const BASE_DOMAIN = 'imobisaas.com';
  let subdomain = null;
  let domain = host;
  
  // Remover porta se houver
  domain = domain.split(':')[0];
  
  // Verificar se é subdomínio do sistema
  if (domain.endsWith(BASE_DOMAIN) && domain !== BASE_DOMAIN) {
    subdomain = domain.replace(`.${BASE_DOMAIN}`, '');
  }
  
  return { subdomain, domain };
}

async function resolveTenant(subdomain: string | null, domain: string) {
  let organization;
  
  // Buscar por domínio customizado primeiro
  if (!subdomain) {
    const { data: domainData } = await supabase
      .from('domains')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('domain', domain)
      .eq('status', 'active')
      .single();
    
    if (domainData) {
      organization = domainData.organization;
    }
  }
  
  // Buscar por subdomain
  if (!organization && subdomain) {
    const { data: orgData } = await supabase
      .from('organizations')
      .select('*')
      .eq('subdomain', subdomain)
      .single();
    
    organization = orgData;
  }
  
  if (!organization) {
    throw new Error('Organization not found');
  }
  
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .eq('organization_id', organization.id)
    .single();
  
  return {
    id: organization.id,
    name: organization.name,
    subdomain: organization.subdomain,
    customDomain: !subdomain ? domain : null,
    settings: settings || {},
    plan: organization.plan || 'free',
  };
}
