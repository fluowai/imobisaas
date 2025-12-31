
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
import { Property, PropertyType, PropertyStatus } from '../types';
import { generateSmartDescription } from '../services/geminiService';
import { uploadFile } from '../services/storage';
import { propertyService } from '../services/properties';

const PropertyEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    price: 0,
    type: PropertyType.APARTMENT,
    status: PropertyStatus.AVAILABLE,
    description: '',
    descriptionDraft: '',
    location: { city: '', neighborhood: '', state: '', address: '' },
    features: { bedrooms: 0, bathrooms: 0, area: 0, garages: 0 },
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
      <div className="flex items-center justify-between mb-8">
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
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => navigate('/admin/properties')}
            className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-white transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
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
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Preço (R$)</label>
              <input 
                type="number" 
                value={formData.price}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-600"
              />
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

        {/* Seção 3: Características */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6 text-indigo-600">
            <Home size={20} />
            <h2 className="font-bold uppercase tracking-wider text-sm">Características</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Quartos</label>
              <input 
                type="number" 
                value={formData.features?.bedrooms}
                onChange={e => setFormData({...formData, features: {...formData.features!, bedrooms: Number(e.target.value)}})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Banheiros</label>
              <input 
                type="number" 
                value={formData.features?.bathrooms}
                onChange={e => setFormData({...formData, features: {...formData.features!, bathrooms: Number(e.target.value)}})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Vagas</label>
              <input 
                type="number" 
                value={formData.features?.garages}
                onChange={e => setFormData({...formData, features: {...formData.features!, garages: Number(e.target.value)}})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Área (m²)</label>
              <input 
                type="number" 
                value={formData.features?.area}
                onChange={e => setFormData({...formData, features: {...formData.features!, area: Number(e.target.value)}})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
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

        {/* Seção 5: Mídia */}
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
