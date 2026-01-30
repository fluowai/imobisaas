import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { updates } = req.body; // Array de { key, value }
        
        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({ error: 'Updates deve ser um array não vazio' });
        }
        
        console.log(`📝 Atualizando ${updates.length} textos em massa...`);
        
        const results = [];
        const errors = [];
        
        for (const update of updates) {
            try {
                const { data, error } = await supabase
                    .from('site_texts')
                    .update({ value: update.value, updated_at: new Date().toISOString() })
                    .eq('key', update.key)
                    .select()
                    .single();
                
                if (error) {
                    errors.push({ key: update.key, error: error.message });
                } else {
                    results.push(data);
                }
            } catch (err) {
                errors.push({ key: update.key, error: err.message });
            }
        }
        
        res.json({ 
            success: true, 
            updated: results.length,
            errors: errors.length,
            results,
            errorDetails: errors
        });
        
    } catch (error) {
        console.error('❌ Erro ao processar atualização em massa:', error);
        res.status(500).json({ error: 'Erro ao processar atualização em massa' });
    }
}
