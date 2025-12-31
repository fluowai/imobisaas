
import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette, 
  Layout as LayoutIcon, 
  Image as ImageIcon, 
  Globe, 
  Save, 
  RefreshCw,
  Instagram,
  Facebook,
  Phone,
  Mail,
  Check,
  Eye,
  Plus,
  Trash2,
  Type,
  Link as LinkIcon,
  MessageCircle,
  Maximize,
  UserCircle
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { SiteSettings } from '../types';
import { uploadFile } from '../services/storage';

const getContrastColor = (hexcolor: string | undefined) => {
  if (!hexcolor) return 'white';
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
};

const DotGrid: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`absolute pointer-events-none opacity-[0.15] ${className}`} style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
);

const TemplateCustomizer: React.FC = () => {
  const { settings: globalSettings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState<SiteSettings>(globalSettings);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const brokerPhotoRef = useRef<HTMLInputElement>(null);

  // Sincroniza estado local se o global mudar externamente
  useEffect(() => {
    setLocalSettings(globalSettings);
  }, [globalSettings]);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      updateSettings(localSettings);
      setSaving(false);
      alert('Alterações publicadas com sucesso em todo o sistema!');
    }, 800);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setSaving(true); // Re-use saving state or create uploading state
        const publicUrl = await uploadFile(file, 'agency-assets');
        if (publicUrl) {
           setLocalSettings({ ...localSettings, logoUrl: publicUrl });
        }
      } catch (error) {
        alert('Erro ao fazer upload da logo.');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleBrokerPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setSaving(true);
        const publicUrl = await uploadFile(file, 'agency-assets');
        if (publicUrl) {
           setLocalSettings({ 
             ...localSettings, 
             homeContent: { 
               ...localSettings.homeContent, 
               broker: { ...localSettings.homeContent?.broker, photoUrl: publicUrl }
             } 
           });
        }
      } catch (error) {
        alert('Erro ao fazer upload da foto.');
      } finally {
        setSaving(false);
      }
    }
  };

  const removeLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalSettings({ ...localSettings, logoUrl: '' });
  };

  const templates = [
    { id: 'modern', name: 'Moderno', desc: 'Layout focado em fotos grandes e impacto visual.' },
    { id: 'classic', name: 'Clássico', desc: 'Design tradicional, focado em clareza e filtros de busca.' },
    { id: 'minimal', name: 'Minimalista', desc: 'Extremamente limpo, ideal para agências de luxo.' },
  ];

  return (
    <div className="flex h-[calc(100vh-120px)] gap-8">
      {/* Editor Sidebar */}
      <div className="w-80 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            <Globe className="text-indigo-600" size={20} />
            Configurações & Site
          </h2>
          <p className="text-sm text-black/60">Gerencie integrações e aparência.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Layout Selection */}
          <section className="space-y-4">
            <label className="text-xs font-bold text-black/40 uppercase tracking-widest flex items-center gap-2">
              <LayoutIcon size={14} /> Template do Portal
            </label>
            <div className="space-y-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setLocalSettings({ ...localSettings, templateId: tpl.id as any })}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    localSettings.templateId === tpl.id 
                    ? 'border-indigo-600 bg-indigo-50' 
                    : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <p className="text-sm font-bold text-black">{tpl.name}</p>
                  <p className="text-[10px] text-black/60 leading-tight">{tpl.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Colors */}
          <section className="space-y-4">
            <label className="text-xs font-bold text-black/40 uppercase tracking-widest flex items-center gap-2">
              <Palette size={14} /> Cores da Marca
            </label>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-black/60 mb-1.5 uppercase">Principal (Portal / Botões)</p>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={localSettings.primaryColor}
                    onChange={(e) => setLocalSettings({ ...localSettings, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border-none p-0 overflow-hidden shadow-sm"
                  />
                  <input 
                    type="text" 
                    value={localSettings.primaryColor}
                    onChange={(e) => setLocalSettings({ ...localSettings, primaryColor: e.target.value })}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-black/60 mb-1.5 uppercase">Secundária (Header / Rodapé)</p>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={localSettings.secondaryColor}
                    onChange={(e) => setLocalSettings({ ...localSettings, secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border-none p-0 overflow-hidden shadow-sm"
                  />
                  <input 
                    type="text" 
                    value={localSettings.secondaryColor}
                    onChange={(e) => setLocalSettings({ ...localSettings, secondaryColor: e.target.value })}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Logo Management */}
          <section className="space-y-4">
            <label className="text-xs font-bold text-black/40 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon size={14} /> Logotipo da Agência
            </label>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-black/60 mb-1.5 uppercase flex items-center gap-1">
                  <LinkIcon size={10} /> Link da Imagem (URL)
                </p>
                <input 
                  type="text" 
                  placeholder="Cole aqui a URL da sua logo..."
                  value={localSettings.logoUrl}
                  onChange={(e) => setLocalSettings({ ...localSettings, logoUrl: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleLogoUpload}
                />
                {localSettings.logoUrl ? (
                  <div className="relative aspect-video bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center p-4">
                    <img src={localSettings.logoUrl} alt="Logo Preview" className="max-w-full object-contain" style={{ maxHeight: `${localSettings.logoHeight || 80}px` }} />
                    <button 
                      onClick={removeLogo}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer bg-slate-50 group"
                  >
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm group-hover:scale-110 transition-transform">
                      <Plus size={20} className="text-black/40 group-hover:text-indigo-600" />
                    </div>
                    <p className="text-[10px] font-bold text-black/60 uppercase">Subir Arquivo</p>
                  </div>
                )}
              </div>

              {/* Slider de Tamanho */}
              <div>
                  <div className="flex items-center justify-between mb-2">
                     <p className="text-[10px] font-bold text-black/60 uppercase flex items-center gap-1">
                        <Maximize size={10} /> Tamanho (Altura)
                     </p>
                     <span className="text-[10px] font-bold text-black/40 bg-slate-100 px-2 py-0.5 rounded-full">
                        {localSettings.logoHeight || 80}px
                     </span>
                  </div>
                  <input 
                    type="range"
                    min="40"
                    max="200"
                    step="5"
                    value={localSettings.logoHeight || 80}
                    onChange={(e) => setLocalSettings({ ...localSettings, logoHeight: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
              </div>

            </div>
          </section>

          {/* Typography */}
          <section className="space-y-4">
            <label className="text-xs font-bold text-black/40 uppercase tracking-widest flex items-center gap-2">
              <Type size={14} /> Tipografia
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <div>
                  <p className="text-[10px] font-bold text-black/60 mb-2 uppercase">Tipo de Fonte</p>
                  <select 
                    value={localSettings.fontFamily || 'Inter, sans-serif'}
                    onChange={(e) => setLocalSettings({ ...localSettings, fontFamily: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs appearance-none cursor-pointer focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="'Inter', sans-serif">Moderno (Inter)</option>
                    <option value="'Outfit', sans-serif">Clean (Outfit)</option>
                    <option value="'Roboto', sans-serif">Padrao (Roboto)</option>
                    <option value="'Playfair Display', serif">Elegante (Serif)</option>
                    <option value="'JetBrains Mono', monospace">Tecnico (Mono)</option>
                  </select>
              </div>

              <div>
                  <div className="flex items-center justify-between mb-2">
                     <p className="text-[10px] font-bold text-black/60 uppercase">Texto Base</p>
                     <span className="text-[10px] font-bold text-black/40 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                        {localSettings.baseFontSize || 16}px
                     </span>
                  </div>
                  <input 
                    type="range"
                    min="12"
                    max="22"
                    step="1"
                    value={localSettings.baseFontSize || 16}
                    onChange={(e) => setLocalSettings({ ...localSettings, baseFontSize: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
              </div>

              <div>
                  <div className="flex items-center justify-between mb-2">
                     <p className="text-[10px] font-bold text-black/60 uppercase">Tamanho Titulo</p>
                     <span className="text-[10px] font-bold text-black/40 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                        {localSettings.headingFontSize || 48}px
                     </span>
                  </div>
                  <input 
                    type="range"
                    min="24"
                    max="100"
                    step="2"
                    value={localSettings.headingFontSize || 48}
                    onChange={(e) => setLocalSettings({ ...localSettings, headingFontSize: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
              </div>
            </div>
          </section>

          {/* Home Content */}
          <section className="space-y-4">
            <label className="text-xs font-bold text-black/40 uppercase tracking-widest flex items-center gap-2">
              <Type size={14} /> Conteúdo da Home
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <div className="flex gap-4">
                <div className="flex-[2]">
                    <p className="text-[10px] font-bold text-black/60 mb-1.5 uppercase">Título Hero (Fundo Escuro)</p>
                    <input 
                      type="text" 
                      value={localSettings.homeContent?.heroTitle || 'Terras que Prosperam'}
                      onChange={(e) => setLocalSettings({ 
                        ...localSettings, 
                        homeContent: { ...localSettings.homeContent, heroTitle: e.target.value } 
                      })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
                <div className="flex-1">
                    <p className="text-[10px] font-bold text-black/60 mb-1.5 uppercase">Tam. Fonte</p>
                    <input 
                      type="number" 
                      value={localSettings.homeContent?.heroFontSize || 72}
                      onChange={(e) => setLocalSettings({ 
                        ...localSettings, 
                        homeContent: { ...localSettings.homeContent, heroFontSize: parseInt(e.target.value) } 
                      })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                </div>
              </div>
              <div>
                  <p className="text-[10px] font-bold text-black/60 mb-1.5 uppercase">Título Seção Destaques</p>
                  <input 
                    type="text" 
                    value={localSettings.homeContent?.featuredTitle || 'Propriedades de Elite'}
                    onChange={(e) => setLocalSettings({ 
                      ...localSettings, 
                      homeContent: { ...localSettings.homeContent, featuredTitle: e.target.value } 
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-black/60 mb-1.5 uppercase">Citação / Descrição</p>
                  <textarea 
                    rows={2}
                    value={localSettings.homeContent?.featuredDescription || 'Nossa curadoria foca em produtividade, localização estratégica e potencial de valorização exponencial.'}
                    onChange={(e) => setLocalSettings({ 
                      ...localSettings, 
                      homeContent: { ...localSettings.homeContent, featuredDescription: e.target.value } 
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-black/60 mb-1.5 uppercase">Texto do Selo Flutuante</p>
                  <input 
                    type="text" 
                    value={localSettings.homeContent?.badgeText || 'Curadoria Especializada 2024'}
                    onChange={(e) => setLocalSettings({ 
                      ...localSettings, 
                      homeContent: { ...localSettings.homeContent, badgeText: e.target.value } 
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
              </div>
            </div>
          </section>

          {/* Broker Data */}
          <section className="space-y-4">
            <label className="text-xs font-bold text-black/40 uppercase tracking-widest flex items-center gap-2">
              <UserCircle size={14} /> Dados do Corretor (Elite)
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
               <div>
                  <p className="text-[10px] font-bold text-black/60 mb-1.5 uppercase">Nome do Corretor</p>
                  <input 
                    type="text" 
                    placeholder="Ex: Renato Vilmar Piovesana"
                    value={localSettings.homeContent?.broker?.name || ''}
                    onChange={(e) => setLocalSettings({ 
                      ...localSettings, 
                      homeContent: { 
                        ...localSettings.homeContent, 
                        broker: { ...localSettings.homeContent?.broker, name: e.target.value }
                      } 
                    })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
               </div>

               <div>
                <p className="text-[10px] font-bold text-black/60 mb-1.5 uppercase">CRECI</p>
                <input 
                  type="text" 
                  placeholder="Ex: 10544F"
                  value={localSettings.homeContent?.broker?.creci || ''}
                  onChange={(e) => setLocalSettings({ 
                    ...localSettings, 
                    homeContent: { 
                      ...localSettings.homeContent, 
                      broker: { ...localSettings.homeContent?.broker, creci: e.target.value }
                    } 
                  })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                />
               </div>

               <div className="relative">
                <p className="text-[10px] font-bold text-black/60 mb-1.5 uppercase">Foto do Corretor</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={brokerPhotoRef} 
                  onChange={handleBrokerPhotoUpload}
                />
                {localSettings.homeContent?.broker?.photoUrl ? (
                  <div className="relative aspect-square w-32 mx-auto bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
                    <img src={localSettings.homeContent.broker.photoUrl} alt="Broker Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setLocalSettings({
                        ...localSettings,
                        homeContent: {
                          ...localSettings.homeContent,
                          broker: { ...localSettings.homeContent?.broker, photoUrl: '' }
                        }
                      })}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md shadow-sm"
                    >
                      <Trash2 size={10} />
                    </button>
                    <div 
                      onClick={() => brokerPhotoRef.current?.click()}
                      className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] font-black uppercase text-center py-1 cursor-pointer"
                    >
                      Alterar
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => brokerPhotoRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-400 transition-all cursor-pointer bg-white"
                  >
                    <Plus size={16} className="text-black/40 mx-auto mb-1" />
                    <p className="text-[8px] font-black text-black/60 uppercase">Subir Foto</p>
                  </div>
                )}
               </div>

               <div>
                <p className="text-[10px] font-bold text-black/60 mb-1.5 uppercase">WhatsApp Direto</p>
                <input 
                  type="text" 
                  placeholder="Ex: 5544998433030"
                  value={localSettings.homeContent?.broker?.phone || ''}
                  onChange={(e) => setLocalSettings({ 
                    ...localSettings, 
                    homeContent: { 
                      ...localSettings.homeContent, 
                      broker: { ...localSettings.homeContent?.broker, phone: e.target.value }
                    } 
                  })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                />
               </div>
            </div>
          </section>

          {/* Social Links */}
          <section className="space-y-4">
            <label className="text-xs font-bold text-black/40 uppercase tracking-widest flex items-center gap-2">
              Redes Sociais
            </label>
            <div className="space-y-3">
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={14} />
                <input 
                  type="text" 
                  placeholder="URL Instagram"
                  value={localSettings.socialLinks.instagram || ''}
                  onChange={(e) => setLocalSettings({ 
                    ...localSettings, 
                    socialLinks: { ...localSettings.socialLinks, instagram: e.target.value } 
                  })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="relative">
                <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={14} />
                <input 
                  type="text" 
                  placeholder="URL Facebook"
                  value={localSettings.socialLinks.facebook || ''}
                  onChange={(e) => setLocalSettings({ 
                    ...localSettings, 
                    socialLinks: { ...localSettings.socialLinks, facebook: e.target.value } 
                  })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={14} />
                <input 
                  type="text" 
                  placeholder="WhatsApp"
                  value={localSettings.socialLinks.whatsapp || ''}
                  onChange={(e) => setLocalSettings({ 
                    ...localSettings, 
                    socialLinks: { ...localSettings.socialLinks, whatsapp: e.target.value } 
                  })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </section>

          {/* WhatsApp API Integration */}
          <section className="space-y-4">
            <label className="text-xs font-bold text-black/40 uppercase tracking-widest flex items-center gap-2">
              <MessageCircle size={14} /> Automação WhatsApp (Evolution API)
            </label>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">Ativar Envios Automáticos</span>
                  <input 
                    type="checkbox"
                    checked={localSettings.integrations?.evolutionApi?.enabled || false}
                    onChange={(e) => setLocalSettings({
                        ...localSettings,
                        integrations: {
                            ...localSettings.integrations,
                            evolutionApi: {
                                ...localSettings.integrations?.evolutionApi,
                                enabled: e.target.checked
                            } as any
                        }
                    })}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
               </div>

               {localSettings.integrations?.evolutionApi?.enabled && (
                 <>
                    <div>
                        <label className="text-[10px] font-bold text-black/60 uppercase block mb-1">URL da API</label>
                        <input 
                            type="text" 
                            placeholder="https://api.exemplo.com"
                            value={localSettings.integrations?.evolutionApi?.baseUrl || ''}
                            onChange={(e) => setLocalSettings({
                                ...localSettings,
                                integrations: {
                                    ...localSettings.integrations,
                                    evolutionApi: { ...localSettings.integrations?.evolutionApi, baseUrl: e.target.value } as any
                                }
                            })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-black/60 uppercase block mb-1">Token (API Key)</label>
                        <input 
                            type="password" 
                            placeholder="Seu token de acesso"
                            value={localSettings.integrations?.evolutionApi?.token || ''}
                            onChange={(e) => setLocalSettings({
                                ...localSettings,
                                integrations: {
                                    ...localSettings.integrations,
                                    evolutionApi: { ...localSettings.integrations?.evolutionApi, token: e.target.value } as any
                                }
                            })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-black/60 uppercase block mb-1">Nome da Instância</label>
                        <input 
                            type="text" 
                            placeholder="Ex: MinhaImobiliaria"
                            value={localSettings.integrations?.evolutionApi?.instanceName || ''}
                            onChange={(e) => setLocalSettings({
                                ...localSettings,
                                integrations: {
                                    ...localSettings.integrations,
                                    evolutionApi: { ...localSettings.integrations?.evolutionApi, instanceName: e.target.value } as any
                                }
                            })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                    </div>

                    <button
                      onClick={async () => {
                          const config = localSettings.integrations?.evolutionApi;
                          if (!config?.baseUrl || !config?.token || !config?.instanceName) {
                              alert('Preencha todos os campos antes de testar.');
                              return;
                          }
                          try {
                              // Use relative path for Vercel Serverless Function
                              const res = await fetch('/api/test-connection', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(config)
                              });
                              const data = await res.json();
                              if (data.status === 'success') alert('✅ ' + data.message);
                              else if (data.status === 'warning') alert('⚠️ ' + data.message);
                              else alert('❌ ' + (data.error || 'Erro desconhecido'));
                          } catch (e) {
                              console.error(e);
                              alert('❌ Falha ao contactar servidor de integração.');
                          }
                      }}
                      className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        <RefreshCw size={12} /> Testar Conexão
                    </button>
                 </>
               )}
            </div>
          </section>

          {/* Footer Text */}
          <section className="space-y-4">
            <label className="text-xs font-bold text-black/40 uppercase tracking-widest flex items-center gap-2">
              <Type size={14} /> Texto do Rodapé
            </label>
            <textarea 
              rows={3}
              value={localSettings.footerText}
              onChange={(e) => setLocalSettings({ ...localSettings, footerText: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
              placeholder="Ex: Sua imobiliária de confiança."
            />
          </section>
        </div>

        <div className="p-6 border-t border-slate-50">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
          >
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            Publicar Alterações
          </button>
        </div>
      </div>

      {/* Live Preview Window */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            </div>
            <span className="text-xs text-black/40 font-mono ml-2">preview.imobisaas.com.br</span>
          </div>
        </div>

        {/* The Preview Frame */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden relative group" style={{ fontFamily: localSettings.fontFamily || 'inherit', fontSize: `${(localSettings.baseFontSize || 16) * 0.6}px` }}>
          {/* Decorative Background Elements */}
          <DotGrid className="top-0 left-0 w-1/3 h-[400px] text-black" />
          <DotGrid className="top-[300px] right-0 w-1/4 h-[500px] text-black" />
          <div className="absolute top-[400px] -right-10 w-40 h-40 rounded-full blur-3xl opacity-[0.15] pointer-events-none" style={{ backgroundColor: localSettings.primaryColor }}></div>
          
          <div className="absolute inset-0 overflow-y-auto scrollbar-hide pointer-events-none origin-top transition-all">
            {/* Nav Mock */}
            <nav className="min-h-16 py-2 border-b border-slate-100 flex items-center justify-between px-8" style={{ backgroundColor: localSettings.headerColor || localSettings.secondaryColor, color: getContrastColor(localSettings.headerColor || localSettings.secondaryColor) }}>
              <div className="flex items-center gap-2">
                {localSettings.logoUrl ? (
                  <img src={localSettings.logoUrl} className="w-auto object-contain" alt="Logo" style={{ height: `${(localSettings.logoHeight || 80) * 0.6}px`, maxHeight: '60px' }} />
                ) : (
                  <>
                    <div style={{ backgroundColor: localSettings.primaryColor }} className="p-1.5 rounded text-white shadow-sm">
                      <ImageIcon size={18} />
                    </div>
                    <span className="font-extrabold text-black tracking-tight">Agência Imobiliária</span>
                  </>
                )}
              </div>
              <div className="flex gap-5">
                <div className="h-1.5 w-10 bg-slate-200 rounded-full"></div>
                <div className="h-1.5 w-10 bg-slate-200 rounded-full"></div>
              </div>
            </nav>

            {/* Hero Mock */}
            <div className="h-64 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden" style={{ backgroundColor: localSettings.secondaryColor }}>
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              <div className="relative z-10">
                <div className="h-7 w-64 bg-white/20 rounded-full mx-auto mb-4 blur-[1px]"></div>
                <div className="h-12 w-96 bg-white rounded-2xl shadow-xl flex items-center px-4">
                  <div className="w-full h-2 bg-slate-100 rounded-full"></div>
                  <div className="w-10 h-8 ml-4 rounded-xl shadow-sm" style={{ backgroundColor: localSettings.primaryColor }}></div>
                </div>
              </div>
            </div>

            {/* Social Proof Mock */}
            <div className="mx-8 mt-2 bg-white rounded-2xl shadow-lg border-2 p-4 flex justify-around items-center relative z-10" style={{ borderColor: `${localSettings.primaryColor}15` }}>
               <div className="text-center">
                  <div className="h-4 w-12 rounded-full mb-1" style={{ backgroundColor: `${localSettings.secondaryColor}20` }}></div>
                  <div className="h-1.5 w-16 bg-slate-100 rounded-full"></div>
               </div>
               <div className="h-8 w-px bg-slate-100"></div>
               <div className="text-center">
                  <div className="h-4 w-12 rounded-full mb-1" style={{ backgroundColor: `${localSettings.primaryColor}20` }}></div>
                   <div className="h-1.5 w-16 bg-slate-100 rounded-full"></div>
               </div>
               <div className="h-8 w-px bg-slate-100"></div>
               <div className="text-center">
                  <div className="h-4 w-12 rounded-full mb-1" style={{ backgroundColor: `${localSettings.secondaryColor}20` }}></div>
                   <div className="h-1.5 w-16 bg-slate-100 rounded-full"></div>
               </div>
            </div>

            {/* Cards Mock */}
            <div className="p-8 relative">
               {/* Floating Decorative Badge Mock */}
               <div className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full shadow-lg border border-slate-50 flex items-center justify-center rotate-12">
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: localSettings.primaryColor }}></div>
               </div>

              <div className="grid grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-3xl border border-slate-100 overflow-hidden shadow-sm bg-white">
                    <div className="h-40 bg-slate-100"></div>
                    <div className="p-5 space-y-4">
                      <div className="space-y-2">
                        <div className="h-3 w-full bg-slate-100 rounded-full"></div>
                        <div className="h-2.5 w-1/2 bg-slate-50 rounded-full"></div>
                      </div>
                      <div className="h-4 w-20 rounded-full" style={{ backgroundColor: `${localSettings.primaryColor}15`, color: localSettings.primaryColor }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none z-50">
            <span className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-full text-xs font-extrabold text-black shadow-2xl border border-white flex items-center gap-2">
              PRÉ-VISUALIZAÇÃO EM TEMPO REAL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateCustomizer;
