
import React, { useState } from 'react';
import { Globe, Plus, Trash2, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';

// Mock data for now - in real implementation this would fetch from Vercel API or DB
interface Domain {
    id: string;
    domain: string;
    organization: string;
    status: 'active' | 'pending' | 'error';
    dns_configured: boolean;
}

const DomainManager: React.FC = () => {
    const [domains, setDomains] = useState<Domain[]>([
        { id: '1', domain: 'imobiliariaexemplo.com.br', organization: 'Imobiliária Exemplo', status: 'active', dns_configured: true },
        { id: '2', domain: 'casasdeluxo.com', organization: 'Casas de Luxo', status: 'pending', dns_configured: false },
    ]);
    const [newDomain, setNewDomain] = useState('');
    const [adding, setAdding] = useState(false);

    const handleAddDomain = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDomain) return;

        setAdding(true);
        // Simulate API call to Vercel
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setDomains(prev => [...prev, {
            id: Math.random().toString(),
            domain: newDomain,
            organization: 'Nova Organização', // In real app, would select org
            status: 'pending',
            dns_configured: false
        }]);
        setNewDomain('');
        setAdding(false);
        alert('Domínio adicionado! Configure o DNS CNAME para cname.vercel-dns.com');
    };

    const handleDelete = (id: string) => {
        if (confirm('Remover este domínio?')) {
            setDomains(prev => prev.filter(d => d.id !== id));
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Globe className="text-blue-600" />
                        Gerenciamento de Domínios
                    </h1>
                    <p className="text-gray-500 mt-1">Gerencie os domínios personalizados dos seus clientes na Vercel.</p>
                </div>
            </div>

            {/* Add Domain */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Adicionar Novo Domínio</h2>
                <form onSubmit={handleAddDomain} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Domínio (sem https://)</label>
                        <input 
                            type="text" 
                            placeholder="ex: imobiliaria.com.br"
                            value={newDomain}
                            onChange={e => setNewDomain(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={adding || !newDomain}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 h-[42px]"
                    >
                        {adding ? 'Adicionando...' : <><Plus size={20} /> Adicionar na Vercel</>}
                    </button>
                </form>
                <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5" />
                    <p>
                        Após adicionar, instrua o cliente a criar um registro <strong>CNAME</strong> apontando para <code>cname.vercel-dns.com</code> (ou o target do seu projeto).
                    </p>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Domínio</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Organização</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status DNS</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {domains.map(domain => (
                            <tr key={domain.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2 font-medium text-gray-900">
                                        <Globe size={16} className="text-gray-400" />
                                        <a href={`https://${domain.domain}`} target="_blank" rel="noreferrer" className="hover:underline">
                                            {domain.domain}
                                        </a>
                                        <ExternalLink size={12} className="text-gray-400" />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {domain.organization}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {domain.dns_configured ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <CheckCircle size={12} /> Configurado
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            <AlertCircle size={12} /> Pendente
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button 
                                        onClick={() => handleDelete(domain.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remover"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DomainManager;
