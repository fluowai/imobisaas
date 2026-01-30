
import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Key, Save, CheckCircle, AlertTriangle } from 'lucide-react';

const GlobalSettings: React.FC = () => {
    const [settings, setSettings] = useState({
        global_evolution_api_key: '',
        global_evolution_url: '',
        global_openai_key: '',
        global_gemini_key: '',
        maintenance_mode: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('saas_settings')
                .select('*')
                .single();

            if (data) setSettings(data);
        } catch (error) {
            console.error('Error fetching global settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('saas_settings')
                .upsert({ id: 1, ...settings });

            if (error) throw error;
            alert('Configurações salvas com sucesso!');
        } catch (error) {
            alert('Erro ao salvar configurações.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Key className="text-red-600" />
                Configurações Globais (Master API Keys)
            </h1>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                <div className="flex">
                    <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
                    <div>
                        <p className="text-sm text-yellow-700">
                            Estas chaves servem como <strong>fallback</strong>. Se uma imobiliária não configurar suas próprias chaves, o sistema usará estas.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
                
                {/* Evolution API */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Evolution API (WhatsApp)</h3>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL da API (Master Instance)</label>
                            <input 
                                type="url" 
                                value={settings.global_evolution_url || ''}
                                onChange={e => setSettings({...settings, global_evolution_url: e.target.value})}
                                placeholder="https://api.evolution.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Global API Key</label>
                            <input 
                                type="password" 
                                value={settings.global_evolution_api_key || ''}
                                onChange={e => setSettings({...settings, global_evolution_api_key: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* AI Services */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 mt-4">Inteligência Artificial</h3>
                    <div className="grid gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">OpenAI API Key (GPT-4)</label>
                            <input 
                                type="password" 
                                value={settings.global_openai_key || ''}
                                onChange={e => setSettings({...settings, global_openai_key: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Google Gemini API Key</label>
                            <input 
                                type="password" 
                                value={settings.global_gemini_key || ''}
                                onChange={e => setSettings({...settings, global_gemini_key: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Maintenance */}
                <div className="pt-4 border-t border-gray-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                            type="checkbox"
                            checked={settings.maintenance_mode}
                            onChange={e => setSettings({...settings, maintenance_mode: e.target.checked})}
                            className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                        />
                        <span className="text-gray-700 font-medium">Modo Manutenção (Bloqueia acesso de todos os tenants)</span>
                    </label>
                </div>

                <div className="pt-6 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                    >
                        {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save size={20} />}
                        Salvar Configurações Globais
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GlobalSettings;
