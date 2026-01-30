
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log("Searching for 'Terra Produtiva'...");

    // Search by title or description
    const { data: pages } = await supabase
        .from('landing_pages')
        .select('id, title, slug, status, created_at')
        .or('title.ilike.%Terra%,title.ilike.%Produtiva%')
        .order('created_at', { ascending: true });

    console.log("Found:", JSON.stringify(pages, null, 2));
}

check();
