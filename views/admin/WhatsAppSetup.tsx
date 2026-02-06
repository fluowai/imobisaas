
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
    const { user, profile } = useAuth();
    const [instances, setInstances] = useState<Instance[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newInstanceName, setNewInstanceName] = useState('');
    const [organizationId, setOrganizationId] = useState<string | null>(null);


    // Fetch Organization ID and Slug
    useEffect(() => {
        const fetchOrg = async () => {
            if (!user || !profile) return;
            
            let orgId = profile.organization_id;
            let slug = 'instance';

            // If we have an override (impersonation), AuthContext already put it in profile.organization_id
            // But if it's still null (Super Admin default view), try to find a fallback
            if (!orgId && profile.role === 'superadmin') {
                 console.log("Super Admin sem contexto: Buscando organização padrão...");
                 const { data: firstOrg } = await supabase.from('organizations').select('id, slug').limit(1).single();
                 if (firstOrg) {
                     orgId = firstOrg.id;
                     slug = firstOrg.slug;
                 }
            } else if (orgId) {
                 // Just get the slug for the current ID
                 const { data: orgData } = await supabase.from('organizations').select('slug').eq('id', orgId).single();
                 if (orgData) slug = orgData.slug;
            }

            if (orgId) {
                setOrganizationId(orgId);
                setBaseSlug(slug); 
            } else {
                console.warn('Organization ID not found for user');
                setLoading(false);
            }
        };
        fetchOrg();
    }, [user, profile]);

    // Trigger fetch when organizationId is set
    useEffect(() => {
        if (organizationId) {
            fetchInstances();
        } else {
             // Only stop loading if we are sure there is no org (handled in the other effect)
        }
    }, [organizationId]);

    const fetchInstances = async () => {
        if (!organizationId) return; // Don't fetch if no org
        try {
            setLoading(true);
            const { data } = await axios.get('/api/evolution/instances?organizationId=' + organizationId);
            if (data.success) {
                setInstances(data.instances);
            }
        } catch (error) {
            console.error('Erro ao buscar instâncias:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper state
    const [baseSlug, setBaseSlug] = useState('');
    const [qrCodeData, setQrCodeData] = useState<any>(null);
    const [showQrModal, setShowQrModal] = useState(false);
    const [connectingInstance, setConnectingInstance] = useState<string | null>(null);

    const generateNextName = () => {
        if (!baseSlug) return `instancia_${Date.now()}`;
        
        // Sanitize slug just in case
        const safeSlug = baseSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Check existing names
        const existingNames = instances.map(i => i.name);
        
        // Try base slug first
        if (!existingNames.includes(safeSlug)) return safeSlug;
        
        // Try with counters
        let counter = 1;
        while (existingNames.includes(`${safeSlug}${counter}`)) {
            counter++;
        }
        return `${safeSlug}${counter}`;
    };

    const handleConnect = async (instanceName: string) => {
        if (!organizationId) return;
        
        try {
            setConnectingInstance(instanceName);
            const res = await axios.get(`/api/evolution/instances/${instanceName}/connect?organizationId=${organizationId}`);
            
            if (res.data.success) {
                const evoData = res.data.data;
                const evoInstance = evoData.instance || evoData;
                const state = evoInstance.state;
                
                if (state === 'open') {
                    alert('Instância já conectada!');
                    fetchInstances();
                } else if (evoData.qrcode) {
                    // Show QRCode
                    setQrCodeData({
                        base64: evoData.qrcode.base64,
                        pairingCode: evoData.qrcode.pairingCode,
                        instanceName: instanceName
                    });
                    setShowQrModal(true);
                } else if (evoData.base64) {
                     // Formato v2 direto
                     setQrCodeData({
                        base64: evoData.base64,
                        code: evoData.code,
                        instanceName: instanceName
                    });
                    setShowQrModal(true);
                } else {
                    alert('Nenhum QRCode retornado. Tente novamente em instantes.');
                }
            }
        } catch (error: any) {
            console.error('Erro ao conectar:', error);
            alert(`Erro ao tentar conectar: ${error.response?.data?.error || error.message}`);
        } finally {
            setConnectingInstance(null);
        }
    };

    const handleCreate = async () => {
        if (!organizationId) return;

        try {
            setCreating(true);
            
            const autoName = generateNextName();
            const confirmMsg = `Será criada uma nova instância: "${autoName}". Confirmar?`;
            
            if (!confirm(confirmMsg)) {
                setCreating(false);
                return;
            }

            const response = await axios.post('/api/evolution/instances', {
                instanceName: autoName,
                organizationId: organizationId
            });

            if (response.data.success) {
                alert(`Instância "${autoName}" criada com sucesso! Tentando conectar...`);
                await fetchInstances();
                // Auto connect
                handleConnect(autoName);
            }
        } catch (error: any) {
            console.error('Erro ao criar (Detalhado):', error);
            if (error.response) {
                console.error('Dados da resposta:', error.response.data);
                console.error('Status:', error.response.status);
            }
            alert(`Erro: ${JSON.stringify(error.response?.data || error.message)}`);
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

    const handleLogout = async (instanceName: string) => {
        if (!confirm(`Tem certeza que deseja desconectar "${instanceName}"?`)) return;
        try {
            await axios.post(`/api/evolution/instances/${instanceName}/logout`, { organizationId });
            alert('Desconectado com sucesso!');
            fetchInstances();
        } catch (error) {
            console.error('Erro ao desconectar:', error);
            alert('Erro ao desconectar');
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
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Nova Conexão</h2>
                        <p className="text-sm text-gray-500 mt-1">O nome da instância será gerado automaticamente (ex: {baseSlug || 'imobiliaria'}).</p>
                    </div>
                    <button 
                        onClick={handleCreate}
                        disabled={creating || !organizationId}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-[42px]"
                    >
                        {creating ? <RefreshCw className="animate-spin" size={20} /> : <Plus size={20} />}
                        {creating ? 'Criando...' : 'Criar Nova Instância'}
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
                                {instance.status === 'open' ? (
                                     <button 
                                        onClick={() => handleLogout(instance.name)}
                                        className="flex-1 py-1.5 text-xs font-medium text-center bg-red-50 hover:bg-red-100 rounded text-red-700 border border-red-200"
                                     >
                                        Desconectar
                                    </button>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => handleConnect(instance.name)}
                                            disabled={connectingInstance === instance.name}
                                            className="flex-1 py-1.5 text-xs font-medium text-center bg-blue-50 hover:bg-blue-100 rounded text-blue-700 border border-blue-200 flex justify-center items-center gap-2"
                                        >
                                            {connectingInstance === instance.name ? <RefreshCw className="animate-spin" size={14}/> : null}
                                            Ver QR Code
                                        </button>
                                        <button 
                                            onClick={() => handleConnect(instance.name)} // Same functionality for now, retry connection
                                            className="flex-1 py-1.5 text-xs font-medium text-center bg-gray-50 hover:bg-gray-100 rounded text-gray-700 border border-gray-200"
                                        >
                                            Reconectar
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* QR Code Modal */}
            {showQrModal && qrCodeData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-200">
                         <h3 className="text-xl font-bold text-gray-900 mb-2">Escaneie o QR Code</h3>
                         <p className="text-sm text-gray-500 mb-4">Abra o WhatsApp no seu celular &gt; Configurações &gt; Aparelhos conectados &gt; Conectar aparelho</p>
                         
                         <div className="bg-white p-2 border border-gray-200 rounded-lg inline-block mb-4">
                            {qrCodeData.base64 ? (
                                <img src={qrCodeData.base64} alt="QR Code WhatsApp" className="w-64 h-64 object-contain" />
                            ) : (
                                <div className="w-64 h-64 flex items-center justify-center bg-gray-100 text-gray-500">
                                    Sem Imagem
                                </div>
                            )}
                         </div>

                         {qrCodeData.pairingCode && (
                             <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                                 <p className="text-xs text-gray-500 mb-1">Código de Pareamento (Alternativo)</p>
                                 <p className="text-lg font-mono font-bold tracking-widest">{qrCodeData.pairingCode}</p>
                             </div>
                         )}

                         <div className="flex gap-2 justify-center">
                             <button
                                onClick={() => {
                                    setShowQrModal(false);
                                    setQrCodeData(null);
                                    fetchInstances(); // Refresh status check
                                }}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                             >
                                Fechar
                             </button>
                             <button
                                onClick={() => {
                                    handleConnect(qrCodeData.instanceName); // Refresh QR Code
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                             >
                                Atualizar QR
                             </button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WhatsAppSetup;
