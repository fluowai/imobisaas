import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  try {
    // Both current.js and resolve.js had the same implementation in single-tenant mode
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .limit(1)
      .single();

    if (orgError || !organization) {
      return res.status(404).json({ error: 'Organização não encontrada' });
    }

    const { data: settings } = await supabase
      .from('site_settings')
      .select('*')
      .eq('organization_id', organization.id)
      .single();

    return res.status(200).json({
      id: organization.id,
      name: organization.name,
      subdomain: organization.subdomain,
      settings: settings || {},
      plan: 'enterprise',
    });

  } catch (error) {
    console.error('Error fetching/resolving tenant:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
