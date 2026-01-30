import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { category, section } = req.query;
        
        let query = supabase.from('site_texts').select('*');
        
        if (category) {
            query = query.eq('category', category);
        }
        
        if (section) {
            query = query.eq('section', section);
        }
        
        const { data, error } = await query.order('section', { ascending: true });
        
        if (error) {
            console.error('❌ Erro ao buscar textos:', error);
            return res.status(500).json({ error: 'Erro ao buscar textos' });
        }
        
        // Transformar array em objeto chave-valor
        const textsMap = {};
        data.forEach(text => {
            textsMap[text.key] = text.value;
        });
        
        res.json({ 
            success: true, 
            texts: textsMap,
            raw: data 
        });
        
    } catch (error) {
        console.error('❌ Erro ao processar textos:', error);
        res.status(500).json({ error: 'Erro ao processar textos' });
    }
}
