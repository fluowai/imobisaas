
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  MapPin, 
  Home, 
  Info, 
  Image as ImageIcon, 
  Sparkles, 
  Trash2, 
  Plus,
  Loader2,
  FileText,
  Check,
  X,
  History,
  Copy
} from 'lucide-react';
import { MOCK_PROPERTIES } from '../constants';
import { Property, PropertyType, PropertyStatus, PropertyPurpose, PropertyAptitude } from '../types';
import { generateSmartDescription } from '../services/geminiService';
import { uploadFile } from '../services/storage';
import { propertyService } from '../services/properties';
import { propertyAnalysisService } from '../services/propertyAnalysisService';
import { PropertyAnalysisCard } from '../components/PropertyAnalysisCard';

const PropertyEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    price: 0,
    type: PropertyType.FAZENDA,
    purpose: PropertyPurpose.SALE,
    aptitude: [],
    status: PropertyStatus.AVAILABLE,
    description: '',
    descriptionDraft: '',
    location: { city: '', neighborhood: '', state: '', address: '' },
    features: { 
      areaHectares: 0,
      areaAlqueires: 0,
      casaSede: false,
      caseiros: 0,
      galpoes: 0,
      currais: false,
      tipoSolo: 'Misto',
      usoAtual: [],
      temGado: false,
      capacidadeCabecas: 0,
      fontesAgua: [],
      percentualMata: 0
    },
    images: []
  });

  useEffect(() => {
    const loadProperty = async () => {
       if (!isNew && id) {
         try {
           setLoading(true);
           const data = await propertyService.getById(id);
           setFormData(data);
         } catch (error) {
           console.error("Erro ao carregar imóvel", error);
           navigate('/admin/properties');
         } finally {
            setLoading(false);
         }
       }
    };
    loadProperty();
  }, [id, isNew, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
       if (isNew) {
         await propertyService.create(formData);
         alert('Imóvel criado com sucesso!');
       } else if (id) {
         await propertyService.update(id, formData);
         alert('Imóvel atualizado com sucesso!');
       }
       navigate('/admin/properties');
    } catch (error) {
       console.error("Erro ao salvar", error);
       alert('Erro ao salvar imóvel. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAiDescription = async () => {
    if (!formData.title || formData.price === 0) {
      alert('Por favor, preencha as características básicas antes de gerar a descrição.');
      return;
    }
    setAiGenerating(true);
    const desc = await generateSmartDescription(formData);
    if (desc) {
      setFormData(prev => ({ ...prev, descriptionDraft: desc }));
    }
    setAiGenerating(false);
  };

  const handleAnalyzeProperty = async () => {
    if (!formData.location?.city || !formData.location?.state || !formData.features?.areaHectares) {
       alert('Preencha pelo menos a Cidade, Estado e Área total (Hectares) para realizar a análise.');
       return;
    }
    
    try {
       setAnalyzing(true);
       const analysis = await propertyAnalysisService.analyzeProperty(
          formData.location.city,
          formData.location.state,
          formData.features.areaHectares,
          formData.features.tipoSolo || 'Misto'
       );
       
       setFormData(prev => ({ ...prev, analysis }));
    } catch (error) {
       console.error("Erro na análise", error);
       alert('Erro ao realizar análise. Verifique se a cidade e estado estão corretos.');
    } finally {
       setAnalyzing(false);
    }
  };

  const applyDraft = () => {
    setFormData(prev => ({ 
      ...prev, 
      description: prev.descriptionDraft || prev.description,
      descriptionDraft: '' 
    }));
  };

  const discardDraft = () => {
    setFormData(prev => ({ ...prev, descriptionDraft: '' }));
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/properties')}
            className="p-2 hover:bg-white rounded-full transition-colors text-slate-500"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isNew ? 'Novo Imóvel' : 'Editar Imóvel'}
            </h1>
            <p className="text-slate-500 text-sm">Preencha os detalhes para publicar no portal.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            type="button"
            onClick={() => navigate('/admin/properties')}
            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-white transition-colors text-center"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Salvar Alterações
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Seção 1: Informações Básicas */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6 text-indigo-600">
            <Info size={20} />
            <h2 className="font-bold uppercase tracking-wider text-sm">Informações Básicas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Título do Anúncio</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Ex: Apartamento Moderno com Vista para o Mar"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Preço (R$)</label>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Finalidade</label>
                <select 
                  value={formData.purpose}
                  onChange={e => setFormData({...formData, purpose: e.target.value as PropertyPurpose})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {Object.values(PropertyPurpose).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as PropertyType})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {Object.values(PropertyType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as PropertyStatus})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {Object.values(PropertyStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 2: Localização */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6 text-indigo-600">
            <MapPin size={20} />
            <h2 className="font-bold uppercase tracking-wider text-sm">Localização</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Endereço Completo</label>
              <input 
                type="text" 
                value={formData.location?.address}
                onChange={e => setFormData({...formData, location: {...formData.location!, address: e.target.value}})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Bairro</label>
              <input 
                type="text" 
                value={formData.location?.neighborhood}
                onChange={e => setFormData({...formData, location: {...formData.location!, neighborhood: e.target.value}})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Cidade</label>
              <input 
                type="text" 
                value={formData.location?.city}
                onChange={e => setFormData({...formData, location: {...formData.location!, city: e.target.value}})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Estado</label>
              <input 
                type="text" 
                value={formData.location?.state}
                onChange={e => setFormData({...formData, location: {...formData.location!, state: e.target.value}})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Seção 3: Características Rurais */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6 text-indigo-600">
            <Home size={20} />
            <h2 className="font-bold uppercase tracking-wider text-sm">Características Rurais</h2>
          </div>
          
          {/* Aptidão */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wide">Aptidão e Vocação</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.values(PropertyAptitude).map((apt) => (
                <label key={apt} className={`
                  flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all
                  ${formData.aptitude?.includes(apt) 
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' 
                    : 'bg-slate-50 border-slate-200 hover:border-indigo-300 text-slate-600'}
                `}>
                  <input 
                    type="checkbox"
                    className="hidden"
                    checked={formData.aptitude?.includes(apt)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, aptitude: [...(prev.aptitude || []), apt] }));
                      } else {
                        setFormData(prev => ({ ...prev, aptitude: prev.aptitude?.filter(a => a !== apt) || [] }));
                      }
                    }}
                  />
                  <span className="text-sm font-semibold">{apt}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Área */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wide">Área da Propriedade</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Hectares *</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={formData.features?.areaHectares}
                  onChange={e => setFormData({...formData, features: {...formData.features!, areaHectares: Number(e.target.value)}})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: 50.5"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Alqueires (opcional)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={formData.features?.areaAlqueires || ''}
                  onChange={e => setFormData({...formData, features: {...formData.features!, areaAlqueires: e.target.value ? Number(e.target.value) : undefined}})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: 20.8"
                />
              </div>
            </div>
          </div>

          {/* Infraestrutura */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wide">Infraestrutura</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.features?.casaSede}
                    onChange={e => setFormData({...formData, features: {...formData.features!, casaSede: e.target.checked}})}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-semibold text-slate-700">Casa Sede</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.features?.currais}
                    onChange={e => setFormData({...formData, features: {...formData.features!, currais: e.target.checked}})}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-semibold text-slate-700">Currais</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Caseiros</label>
                <input 
                  type="number" 
                  value={formData.features?.caseiros}
                  onChange={e => setFormData({...formData, features: {...formData.features!, caseiros: Number(e.target.value)}})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Galpões</label>
                <input 
                  type="number" 
                  value={formData.features?.galpoes}
                  onChange={e => setFormData({...formData, features: {...formData.features!, galpoes: Number(e.target.value)}})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Solo e Uso */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wide">Solo e Uso da Terra</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de Solo</label>
                <select 
                  value={formData.features?.tipoSolo}
                  onChange={e => setFormData({...formData, features: {...formData.features!, tipoSolo: e.target.value}})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Argiloso">Argiloso</option>
                  <option value="Arenoso">Arenoso</option>
                  <option value="Misto">Misto</option>
                  <option value="Massapê">Massapê</option>
                  <option value="Terra Roxa">Terra Roxa</option>
                  <option value="Latossolo">Latossolo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Uso Atual (múltipla escolha)</label>
                <select 
                  multiple
                  value={formData.features?.usoAtual || []}
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
                    setFormData({...formData, features: {...formData.features!, usoAtual: selected}});
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  size={4}
                >
                  <option value="Pasto">Pasto</option>
                  <option value="Agricultura">Agricultura</option>
                  <option value="Reflorestamento">Reflorestamento</option>
                  <option value="Silvicultura">Silvicultura</option>
                  <option value="Fruticultura">Fruticultura</option>
                  <option value="Preservação">Preservação</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pecuária */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wide">Pecuária</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.features?.temGado}
                    onChange={e => setFormData({...formData, features: {...formData.features!, temGado: e.target.checked}})}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-semibold text-slate-700">Possui Gado</span>
                </label>
              </div>
              {formData.features?.temGado && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Capacidade (cabeças)</label>
                  <input 
                    type="number" 
                    value={formData.features?.capacidadeCabecas || ''}
                    onChange={e => setFormData({...formData, features: {...formData.features!, capacidadeCabecas: e.target.value ? Number(e.target.value) : undefined}})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: 500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Recursos Naturais */}
          <div>
            <h3 className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wide">Recursos Naturais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Fontes de Água (múltipla escolha)</label>
                <select 
                  multiple
                  value={formData.features?.fontesAgua || []}
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
                    setFormData({...formData, features: {...formData.features!, fontesAgua: selected}});
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  size={4}
                >
                  <option value="Rio">Rio</option>
                  <option value="Nascente">Nascente</option>
                  <option value="Represa">Represa</option>
                  <option value="Açude">Açude</option>
                  <option value="Poço Artesiano">Poço Artesiano</option>
                  <option value="Córrego">Córrego</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">% Mata Nativa/Preservação</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={formData.features?.percentualMata || ''}
                  onChange={e => setFormData({...formData, features: {...formData.features!, percentualMata: e.target.value ? Number(e.target.value) : undefined}})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: 20"
                />
                <p className="text-xs text-slate-500 mt-1">Percentual de área preservada (0-100%)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 4: Descrição & IA */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-indigo-600">
              <Sparkles size={20} />
              <h2 className="font-bold uppercase tracking-wider text-sm">Descrição do Anúncio</h2>
            </div>
            <button 
              type="button"
              onClick={handleAiDescription}
              disabled={aiGenerating}
              className="flex items-center gap-2 text-xs font-bold bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              {aiGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              GERAR COM IA
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Campo Principal */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Conteúdo Publicado</label>
              <textarea 
                rows={8}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all"
                placeholder="Descreva os diferenciais deste imóvel..."
              />
            </div>

            {/* Campo de Rascunho (Visível apenas se houver rascunho) */}
            {formData.descriptionDraft && (
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-widest">
                    <FileText size={16} />
                    Sugestão Gerada pela IA
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={applyDraft}
                      className="flex items-center gap-1.5 bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors"
                    >
                      <Check size={14} /> Aplicar Rascunho
                    </button>
                    <button 
                      type="button"
                      onClick={discardDraft}
                      className="flex items-center gap-1.5 bg-white text-amber-600 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-50 transition-colors"
                    >
                      <Trash2 size={14} /> Descartar
                    </button>
                  </div>
                </div>
                <textarea 
                  rows={6}
                  value={formData.descriptionDraft}
                  onChange={e => setFormData({...formData, descriptionDraft: e.target.value})}
                  className="w-full px-4 py-3 bg-white/50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none resize-none italic text-slate-700"
                />
                <p className="mt-2 text-[10px] text-amber-600 font-medium italic">
                  * Você pode editar esta sugestão antes de aplicar ou simplesmente clicar em "Aplicar" para substituir a descrição atual.
                </p>
              </div>
            )}
          </div>
        </div>


        {/* Seção 5: Análise Inteligente */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-2 text-indigo-600">
                <Sparkles size={20} />
                <h2 className="font-bold uppercase tracking-wider text-sm">Análise Inteligente (IA)</h2>
             </div>
             <button 
               type="button"
               onClick={handleAnalyzeProperty}
               disabled={analyzing}
               className="flex items-center gap-2 text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-100"
             >
               {analyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
               ANALISAR PROPRIEDADE
             </button>
          </div>

          {!formData.analysis && (
             <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Sparkles className="mx-auto text-slate-300 mb-3" size={32} />
                <h3 className="text-slate-900 font-bold mb-1">Descubra o potencial desta propriedade</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                   Nossa IA analisa dados climáticos e de solo para gerar insights sobre aptidão agrícola e pecuária.
                </p>
             </div>
          )}

          {formData.analysis && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PropertyAnalysisCard analysis={formData.analysis} />
             </div>
          )}
        </div>

        {/* Seção 6: Mídia */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6 text-indigo-600">
            <ImageIcon size={20} />
            <h2 className="font-bold uppercase tracking-wider text-sm">Fotos e Vídeos</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {formData.images?.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-100">
                <img src={img} className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== idx) }))}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <label className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-all bg-slate-50 cursor-pointer relative">
               {loading ? ( // Reusing loading state for simplicity, or create specific uploading state
                 <Loader2 className="animate-spin" />
               ) : (
                 <>
                    <Plus size={32} />
                    <span className="text-xs font-bold mt-2 uppercase tracking-tighter">Add Fotos</span>
                 </>
               )}
               <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      // Simples upload sequencial
                      // Idealmente mostrar loader específico
                      for (let i = 0; i < files.length; i++) {
                         const publicUrl = await uploadFile(files[i], 'property-images');
                         if (publicUrl) {
                           setFormData(prev => ({ ...prev, images: [...(prev.images || []), publicUrl] }));
                         }
                      }
                    }
                  }}
               />
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PropertyEditor;
