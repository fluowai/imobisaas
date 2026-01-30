import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('🌱 Iniciando seed de textos...');
        
        const { count } = await supabase
            .from('site_texts')
            .select('*', { count: 'exact', head: true });
        
        if (count > 0) {
            return res.status(400).json({ 
                error: 'Textos já existem no banco. Use /api/texts/bulk para atualizar.' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Execute o arquivo seed_site_texts.sql no Supabase SQL Editor' 
        });
        
    } catch (error) {
        console.error('❌ Erro ao processar seed:', error);
        res.status(500).json({ error: 'Erro ao processar seed' });
    }
}
