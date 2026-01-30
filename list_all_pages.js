
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
    console.log(`Listing Pages for Org: ${slug}`);

    // 1. Get Org
    const { data: org } = await supabase.from('organizations').select('id').eq('slug', slug).single();
    if (!org) return console.log("Org not found");

    // 2. Get All Pages
    const { data: pages } = await supabase
        .from('landing_pages')
        .select('id, title, slug, status, created_at, updated_at')
        .eq('organization_id', org.id)
        .order('created_at', { ascending: false });

    console.log(JSON.stringify(pages, null, 2));
}

check();
