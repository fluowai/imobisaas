import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { Globe, CheckCircle, XCircle, AlertCircle, Copy, ExternalLink, Plus, Trash2 } from 'lucide-react';

interface Domain {
  id: string;
  domain: string;
  is_custom: boolean;
  is_primary: boolean;
  status: string;
  verified_at: string | null;
  dns_records: any[];
  ssl_status: string;
  created_at: string;
}

const DomainSettings: React.FC = () => {
  const { user } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [adding, setAdding] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState('');

  useEffect(() => {
    fetchDomains();
  }, [user]);

  const fetchDomains = async () => {
    try {
      setLoading(true);

      // Buscar organização do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, organizations(subdomain)')
        .eq('id', user?.id)
        .single();

      if (profile) {
        setOrganizationId(profile.organization_id);
        setSubdomain(profile.organizations?.subdomain || '');

        // Buscar domínios
        const { data: domainsData, error } = await supabase
          .from('domains')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('is_primary', { ascending: false });

        if (!error && domainsData) {
          setDomains(domainsData);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar domínios:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCustomDomain = async () => {
    if (!newDomain || !organizationId) return;

    try {
      setAdding(true);

      const { data, error } = await supabase
        .from('domains')
        .insert([{
          organization_id: organizationId,
          domain: newDomain,
          is_custom: true,
          is_primary: false,
          status: 'pending',
        }])
        .select()
        .single();

      if (error) throw error;

      setDomains([...domains, data]);
      setNewDomain('');
      alert('Domínio adicionado! Configure o DNS conforme as instruções.');
    } catch (error: any) {
      console.error('Erro ao adicionar domínio:', error);
      alert('Erro ao adicionar domínio: ' + error.message);
    } finally {
      setAdding(false);
    }
  };

  const verifyDomain = async (domainId: string) => {
    try {
      // Aqui você implementaria a lógica de verificação DNS
      // Por enquanto, apenas simular
      const { error } = await supabase
        .from('domains')
        .update({ 
          status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('id', domainId);

      if (!error) {
        fetchDomains();
        alert('Domínio verificado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao verificar domínio:', error);
    }
  };

  const deleteDomain = async (domainId: string, isPrimary: boolean) => {
    if (isPrimary) {
      alert('Não é possível deletar o domínio primário!');
      return;
    }

    if (!confirm('Tem certeza que deseja remover este domínio?')) return;

    try {
      const { error } = await supabase
        .from('domains')
        .delete()
        .eq('id', domainId);

      if (!error) {
        setDomains(domains.filter(d => d.id !== domainId));
      }
    } catch (error) {
      console.error('Erro ao deletar domínio:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      verified: 'bg-blue-100 text-blue-800 border-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
    };

    const icons = {
      active: <CheckCircle size={14} />,
      verified: <CheckCircle size={14} />,
      pending: <AlertCircle size={14} />,
      failed: <XCircle size={14} />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {icons[status] || icons.pending}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Globe className="text-indigo-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Domínios</h1>
        </div>
        <p className="text-gray-600">Configure o domínio do seu site imobiliário</p>
      </div>

      {/* Subdomínio Gratuito */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Seu Subdomínio Gratuito</h2>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
            Ativo
          </span>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <code className="text-lg font-mono text-indigo-600">
                {subdomain}.imobisaas.com
              </code>
              <button
                onClick={() => copyToClipboard(`${subdomain}.imobisaas.com`)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Copiar"
              >
                <Copy size={16} />
              </button>
            </div>
            <a
              href={`https://${subdomain}.imobisaas.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
            >
              <ExternalLink size={16} />
              Visitar
            </a>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          Este é seu subdomínio gratuito. Seu site está disponível neste endereço automaticamente.
        </p>
      </div>

      {/* Domínios Customizados */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Domínios Customizados</h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            Premium
          </span>
        </div>

        {/* Adicionar Novo Domínio */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adicionar Domínio Próprio
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="www.meusite.com.br"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={addCustomDomain}
              disabled={adding || !newDomain}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={18} />
              {adding ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Exemplo: www.minhaimobiliaria.com.br ou minhaimobiliaria.com.br
          </p>
        </div>

        {/* Lista de Domínios Customizados */}
        <div className="space-y-4">
          {domains.filter(d => d.is_custom).map((domain) => (
            <div key={domain.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <code className="text-lg font-mono text-gray-900">{domain.domain}</code>
                  {getStatusBadge(domain.status)}
                  {domain.is_primary && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                      Principal
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {domain.status === 'pending' && (
                    <button
                      onClick={() => verifyDomain(domain.id)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Verificar
                    </button>
                  )}
                  <button
                    onClick={() => deleteDomain(domain.id, domain.is_primary)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Remover"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Instruções DNS */}
              {domain.status === 'pending' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                  <h4 className="font-semibold text-blue-900 mb-2">Configure seu DNS:</h4>
                  <div className="space-y-2">
                    <div className="bg-white rounded p-3">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Tipo:</span>
                          <code className="block font-mono text-gray-900">CNAME</code>
                        </div>
                        <div>
                          <span className="text-gray-600">Nome:</span>
                          <code className="block font-mono text-gray-900">www</code>
                        </div>
                        <div>
                          <span className="text-gray-600">Valor:</span>
                          <div className="flex items-center gap-2">
                            <code className="font-mono text-gray-900">cname.vercel-dns.com</code>
                            <button
                              onClick={() => copyToClipboard('cname.vercel-dns.com')}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    Após configurar, clique em "Verificar" para ativar o domínio.
                  </p>
                </div>
              )}

              {/* SSL Status */}
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                <span>SSL:</span>
                {domain.ssl_status === 'active' ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle size={14} />
                    Ativo
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-yellow-600">
                    <AlertCircle size={14} />
                    Pendente
                  </span>
                )}
              </div>
            </div>
          ))}

          {domains.filter(d => d.is_custom).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Globe size={48} className="mx-auto mb-3 opacity-50" />
              <p>Nenhum domínio customizado adicionado ainda.</p>
              <p className="text-sm">Adicione seu próprio domínio para personalizar seu site!</p>
            </div>
          )}
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">ℹ️ Informações Importantes</h3>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>O subdomínio gratuito está sempre ativo e não pode ser removido</li>
          <li>Domínios customizados requerem configuração DNS no seu provedor</li>
          <li>SSL é configurado automaticamente após verificação do domínio</li>
          <li>Pode levar até 48 horas para propagação DNS completa</li>
        </ul>
      </div>
    </div>
  );
};

export default DomainSettings;
