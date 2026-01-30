
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext'; // Assuming this provides organization_id via user logic or we fetch from profile
import { Plus, Trash2, RefreshCw, Smartphone, Globe, CheckCircle, SmartphoneNfc } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface Instance {
    id: string;
    name: string;
    status: string;
    server_url: string;
    created_at: string;
}

const WhatsAppSetup: React.FC = () => {
    const { user } = useAuth();
    const [instances, setInstances] = useState<Instance[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newInstanceName, setNewInstanceName] = useState('');
    const [organizationId, setOrganizationId] = useState<string | null>(null);

    // Fetch Organization ID first (assuming auth context doesn't have it directly exposed easily)
    useEffect(() => {
        const fetchOrg = async () => {
            if (!user) return;
            const { data } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
            if (data) setOrganizationId(data.organization_id);
        };
        fetchOrg();
    }, [user]);

    const fetchInstances = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/evolution/instances');
            if (data.success) {
                setInstances(data.instances);
            }
        } catch (error) {
            console.error('Erro ao buscar instâncias:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (organizationId) fetchInstances();
    }, [organizationId]);

    const handleCreate = async () => {
        if (!newInstanceName.trim() || !organizationId) return;

        try {
            setCreating(true);
            const response = await axios.post('/api/evolution/instances', {
                instanceName: newInstanceName.toLowerCase().replace(/\s+/g, '_'), // Normalize name
                organizationId: organizationId
            });

            if (response.data.success) {
                alert('Instância criada e webhook configurado com sucesso! ✅');
                setNewInstanceName('');
                fetchInstances();
            }
        } catch (error: any) {
            console.error('Erro ao criar:', error);
            alert(`Erro: ${error.response?.data?.error || error.message}`);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja apagar a instância "${name}"? Isso irá desconectar o WhatsApp.`)) return;

        try {
            await axios.delete(`/api/evolution/instances/${id}`);
            setInstances(prev => prev.filter(i => i.id !== id));
        } catch (error) {
            console.error('Erro ao deletar:', error);
            alert('Erro ao deletar instância');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <SmartphoneNfc className="text-green-600" size={32} />
                    <h1 className="text-3xl font-bold text-gray-900">Conexões WhatsApp</h1>
                </div>
                <p className="text-gray-600">Gerencie suas conexões com a Evolution API. O Webhook é configurado automaticamente ao criar.</p>
            </div>

            {/* Create New */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Nova Conexão</h2>
                <div className="flex gap-3 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Instância</label>
                        <input 
                            type="text" 
                            value={newInstanceName}
                            onChange={(e) => setNewInstanceName(e.target.value)}
                            placeholder="Ex: atendimento_vendas" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                         <p className="text-xs text-gray-500 mt-1">Será usado na URL do webhook (letras minúsculas e sem espaços).</p>
                    </div>
                    <button 
                        onClick={handleCreate}
                        disabled={creating || !newInstanceName}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-[42px]"
                    >
                        {creating ? <RefreshCw className="animate-spin" size={20} /> : <Plus size={20} />}
                        {creating ? 'Criando...' : 'Criar Instância'}
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                    <div className="col-span-2 text-center py-8 text-gray-500">Carregando...</div>
                ) : instances.length === 0 ? (
                    <div className="col-span-2 text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <Smartphone className="mx-auto text-gray-400 mb-3" size={48} />
                        <p className="text-gray-500">Nenhuma conexão ativa.</p>
                    </div>
                ) : (
                    instances.map(instance => (
                        <div key={instance.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 relative group">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{instance.name}</h3>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                                        instance.status === 'open' ? 'bg-green-100 text-green-800' : 
                                        instance.status === 'connecting' ? 'bg-yellow-100 text-yellow-800' : 
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {instance.status.toUpperCase()}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => handleDelete(instance.id, instance.name)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Deletar Conexão"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Globe size={14} className="text-gray-400" />
                                    <span className="truncate max-w-[250px]">{instance.server_url}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={14} className="text-green-500" />
                                    <span>Webhook Configurado</span>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                                <button className="flex-1 py-1.5 text-xs font-medium text-center bg-gray-50 hover:bg-gray-100 rounded text-gray-700 border border-gray-200">
                                    Ver QR Code
                                </button>
                                <button className="flex-1 py-1.5 text-xs font-medium text-center bg-gray-50 hover:bg-gray-100 rounded text-gray-700 border border-gray-200">
                                    Testar Conexão
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WhatsAppSetup;
