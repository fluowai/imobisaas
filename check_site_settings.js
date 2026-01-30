
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const slug = 'imobiliaria-fazendas-brasil';
    console.log(`Checking Site Settings for: ${slug}`);

    const { data: org } = await supabase.from('organizations').select('id').eq('slug', slug).single();
    
    const { data: settings } = await supabase
        .from('site_settings')
        .select('*')
        .eq('organization_id', org.id);

    console.log("Settings:", JSON.stringify(settings, null, 2));
}

check();
