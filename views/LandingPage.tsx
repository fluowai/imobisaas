
import React, { useState } from 'react';
import { Search, MapPin, Maximize, ChevronRight, Home, Globe, Phone, Info, Mail, Instagram, Facebook, MessageCircle, Clock, Menu, X, CheckCircle2, DollarSign, Terminal, Layers, Sparkles, Plus, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { MOCK_PROPERTIES } from '../constants';
import { Link, useNavigate } from 'react-router-dom';
import { Property, PropertyType } from '../types';
import { useSettings } from '../context/SettingsContext';
import { propertyService } from '../services/properties';
import { leadService } from '../services/leads';
import { uploadFile } from '../services/storage';

// Helper to determine text color based on background luminance
const getContrastColor = (hexcolor: string | undefined) => {
  if (!hexcolor) return 'white';
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
};

const DotGrid: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`absolute pointer-events-none opacity-[0.15] ${className}`} style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
);

const LandingPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchPurpose, setSearchPurpose] = useState<'Comprar' | 'Alugar'>('Comprar');
  const [searchType, setSearchType] = useState('Todos os Tipos');
  const [searchNeighborhood, setSearchNeighborhood] = useState('Todos os Bairros');
  const [searchCity, setSearchCity] = useState('');
  const [searchMaxPrice, setSearchMaxPrice] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [searchMode, setSearchMode] = useState<'smart' | 'advanced' | 'code'>('smart');
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Lead Capture State
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', email: '', subject: 'Interesse Geral' });
  const [leadSuccess, setLeadSuccess] = useState(false);
  
  // Property Submission State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmittingProperty, setIsSubmittingProperty] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [propertyForm, setPropertyForm] = useState<Partial<Property>>({
    title: '',
    price: 0,
    type: PropertyType.HOUSE,
    location: { city: '', neighborhood: '', state: '', address: '' },
    features: { bedrooms: 0, bathrooms: 0, area: 0, garages: 0 },
    images: [],
    ownerInfo: { name: '', email: '', phone: '' }
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProperty(true);
    try {
      await propertyService.submit(propertyForm);
      setSubmitSuccess(true);
      setTimeout(() => {
        setIsSubmitModalOpen(false);
        setSubmitSuccess(false);
        setPropertyForm({
          title: '', price: 0, type: PropertyType.HOUSE,
          location: { city: '', neighborhood: '', state: '', address: '' },
          features: { bedrooms: 0, bathrooms: 0, area: 0, garages: 0 },
          images: [],
          ownerInfo: { name: '', email: '', phone: '' }
        });
      }, 4000);
    } catch (error) {
      console.error('Erro ao submeter imóvel', error);
      alert('Houve um erro ao enviar seu imóvel. Por favor, tente novamente.');
    } finally {
      setIsSubmittingProperty(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadingImage(true);
      try {
        const uploadPromises = Array.from(files).map(file => uploadFile(file, 'property-images'));
        const urls = await Promise.all(uploadPromises);
        const validUrls = urls.filter((url): url is string => url !== null);
        setPropertyForm(prev => ({ ...prev, images: [...(prev.images || []), ...validUrls] }));
      } catch (error) {
        console.error('Erro no upload', error);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLead(true);
    try {
      await leadService.create({
        name: leadForm.name,
        phone: leadForm.phone,
        email: leadForm.email,
        source: `Site - ${leadForm.subject}`
      });
      setLeadSuccess(true);
      setLeadForm({ name: '', phone: '', email: '', subject: 'Interesse Geral' });
      setTimeout(() => {
        setIsLeadModalOpen(false);
        setLeadSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Erro ao enviar lead', error);
      alert('Houve um erro ao enviar seus dados. Por favor, tente novamente.');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  React.useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        // Em um sistema real, você filtraria por "highlighted" ou paginação
        const data = await propertyService.list();
        setProperties(data.slice(0, 6)); // Pegando os 6 mais recentes
      } catch (error) {
        console.error("Erro ao carregar imóveis da home", error);
      } finally {
        setLoading(false);
      }
    };
    loadProperties();
  }, []);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden" style={{ fontFamily: '"Poppins", sans-serif', fontSize: '16px' }}>
      {/* Decorative Background Elements */}
      <DotGrid className="top-0 left-0 w-1/3 h-[1000px] text-black" />
      <DotGrid className="top-[800px] right-0 w-1/4 h-[1200px] text-black" />
      <div className="absolute top-[1200px] -left-20 w-96 h-96 rounded-full blur-[120px] opacity-[0.15] pointer-events-none" style={{ backgroundColor: settings.primaryColor }}></div>
      <div className="absolute top-[2500px] -right-20 w-96 h-96 rounded-full blur-[120px] opacity-[0.15] pointer-events-none" style={{ backgroundColor: settings.primaryColor }}></div>
      
      {/* Side Decorative Text */}
      <div className="fixed left-6 bottom-32 origin-bottom-left -rotate-90 pointer-events-none hidden xl:block">
        <span className="text-[11px] font-black uppercase tracking-[1.2em] opacity-60 whitespace-nowrap" style={{ color: settings.secondaryColor }}>Exclusividade & Tradição</span>
      </div>
      <div className="fixed right-6 top-1/2 -translate-y-1/2 origin-top-right rotate-90 pointer-events-none hidden xl:block">
        <span className="text-[11px] font-black uppercase tracking-[1.2em] opacity-60 whitespace-nowrap" style={{ color: settings.secondaryColor }}>Fazendas Brasil Select</span>
      </div>
      {/* Navigation - Enhanced spacing and logo size */}
      <nav className="sticky top-0 z-50 border-b shadow-xl transition-all" style={{ backgroundColor: settings.headerColor || settings.secondaryColor, borderColor: `${settings.primaryColor}30`, color: getContrastColor(settings.headerColor || settings.secondaryColor) }}>
        <div className="max-w-7xl mx-auto px-6 min-h-[128px] py-4 h-auto flex items-center justify-between">
          <div className="flex items-center gap-16">
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => navigate('/')}
            >
              {settings.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt={settings.agencyName} 
                  className="transition-transform group-hover:scale-105"
                  style={{ height: `${settings.logoHeight || 80}px`, width: 'auto', objectFit: 'contain' }}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-2xl shadow-lg" style={{ backgroundColor: settings.primaryColor }}>
                    <Home size={32} className="text-white" />
                  </div>
                  <span className="text-3xl font-black tracking-tighter uppercase italic">ImobSaaS</span>
                </div>
              )}
            </div>
            
            <div className="hidden lg:flex gap-10 items-center">
              <button onClick={() => navigate('/')} className="text-base font-black uppercase tracking-[0.2em] opacity-80 hover:opacity-100 transition-opacity border-b-2 border-transparent hover:border-current py-1 whitespace-nowrap">Todos os Imóveis</button>
              <button onClick={() => setIsSubmitModalOpen(true)} className="text-base font-black uppercase tracking-[0.2em] opacity-80 hover:opacity-100 transition-opacity border-b-2 border-transparent hover:border-current py-1 whitespace-nowrap">Anunciar Imóvel</button>
              <button onClick={() => { setLeadForm({ ...leadForm, subject: 'Sobre Nós' }); setIsLeadModalOpen(true); }} className="text-base font-black uppercase tracking-[0.2em] opacity-80 hover:opacity-100 transition-opacity border-b-2 border-transparent hover:border-current py-1 whitespace-nowrap">Sobre Nós</button>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <button 
              onClick={() => { setLeadForm({ ...leadForm, subject: 'Contato Geral' }); setIsLeadModalOpen(true); }}
              className="px-10 py-5 rounded-full font-black uppercase text-[11px] tracking-[0.3em] bg-white transition-all shadow-xl hover:scale-105 active:scale-95 border border-slate-100 flex items-center gap-3"
              style={{ color: 'black' }}
            >
              <MessageCircle size={18} style={{ color: settings.primaryColor }} /> Fale Conosco
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Inovare Style Overhaul */}
      <section className="relative h-[850px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80" 
            alt="Hero Rural" 
            className="w-full h-full object-cover brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl w-full px-6 flex flex-col items-center">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 transform hover:scale-105 transition-all cursor-default">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: settings.primaryColor }}></span>
              <span className="text-[11px] font-black uppercase text-white/80 tracking-[0.3em]">{settings.homeContent?.heroSubtitle || 'Líder em Negócios Rurais e Alto Padrão'}</span>
            </div>
            <h1 
              className="font-black text-white mb-8 leading-[0.9] uppercase italic tracking-tighter" 
              style={{ 
                fontSize: `${settings.homeContent?.heroFontSize || 72}px`,
                textShadow: '0 20px 50px rgba(0,0,0,0.5)' 
              }}
            >
              {settings.homeContent?.heroTitle?.split(' ')[0] || 'Terras'} que <br/>
              <span className="px-4" style={{ color: settings.primaryColor, filter: 'brightness(1.2)' }}>{settings.homeContent?.heroTitle?.split(' ').slice(1).join(' ') || 'Prosperam'}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto font-medium leading-relaxed italic">
              Encontre o seu legado no campo com a curadoria mais exclusiva do Brasil.
            </p>
          </div>

          {/* Glassmorphism Search Panel - Tabbed RE-DESIGN */}
          <div className="w-full max-w-[1600px] flex flex-col gap-0 group/panel">
            {/* Upper Tabs (Smart, Advanced, Code) */}
            <div className="flex gap-1 ml-8 relative z-10">
              <button 
                onClick={() => setSearchMode('smart')}
                className={`px-8 py-4 rounded-t-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 border-t border-l border-r ${searchMode === 'smart' ? 'bg-white/[0.1] backdrop-blur-3xl text-white border-white/30' : 'bg-black/40 text-white/30 border-transparent hover:text-white/60'}`}
              >
                <Sparkles size={14} style={{ color: searchMode === 'smart' ? settings.primaryColor : 'inherit' }} />
                Busca Inteligente
              </button>
              <button 
                onClick={() => setSearchMode('advanced')}
                className={`px-8 py-4 rounded-t-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 border-t border-l border-r ${searchMode === 'advanced' ? 'bg-white/[0.1] backdrop-blur-3xl text-white border-white/30' : 'bg-black/40 text-white/30 border-transparent hover:text-white/60'}`}
              >
                <Layers size={14} style={{ color: searchMode === 'advanced' ? settings.primaryColor : 'inherit' }} />
                Busca Avançada
              </button>
              <button 
                onClick={() => setSearchMode('code')}
                className={`px-8 py-4 rounded-t-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 border-t border-l border-r ${searchMode === 'code' ? 'bg-white/[0.1] backdrop-blur-3xl text-white border-white/30' : 'bg-black/40 text-white/30 border-transparent hover:text-white/60'}`}
              >
                <Terminal size={14} style={{ color: searchMode === 'code' ? settings.primaryColor : 'inherit' }} />
                Por Código
              </button>
            </div>

            {/* Main Panel Content */}
            <div className="bg-white/[0.1] backdrop-blur-3xl border border-white/40 rounded-[4rem] rounded-tl-none p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7),0_0_50px_-12px_rgba(255,255,255,0.1)] relative overflow-hidden transition-all duration-500">
              {/* Glow effect back */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none"></div>

              <div className="relative z-10 flex flex-col gap-8">
                {/* Finalidade Toggle (Inside the panel now for better context) */}
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div className="flex gap-2 p-1 bg-black/40 rounded-full border border-white/5">
                    <button 
                      onClick={() => setSearchPurpose('Comprar')}
                      className={`px-8 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] transition-all ${searchPurpose === 'Comprar' ? 'bg-white shadow-xl scale-105' : 'text-white/30 hover:text-white/60'}`}
                      style={{ color: searchPurpose === 'Comprar' ? 'black' : 'white' }}
                    >
                      Comprar
                    </button>
                    <button 
                      onClick={() => setSearchPurpose('Alugar')}
                      className={`px-8 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] transition-all ${searchPurpose === 'Alugar' ? 'bg-white shadow-xl scale-105' : 'text-white/30 hover:text-white/60'}`}
                      style={{ color: searchPurpose === 'Alugar' ? 'black' : 'white' }}
                    >
                      Alugar
                    </button>
                  </div>
                  <div className="hidden md:flex gap-4 items-center opacity-40 text-[9px] font-bold uppercase tracking-widest text-white italic">
                    <span>Curadoria Exclusiva</span>
                    <div className="w-1 h-1 rounded-full bg-white"></div>
                    <span>Ativos Selecionados</span>
                  </div>
                </div>

                {/* Conditional Rendering Based on Mode */}
                {searchMode === 'smart' && (
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full relative group/field bg-white/[0.03] hover:bg-white/[0.08] transition-all duration-300 rounded-[2.5rem] p-6 px-10 border border-white/5 focus-within:border-white/20 shadow-inner">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <Sparkles size={12} style={{ color: settings.primaryColor }} /> O que você está procurando?
                      </p>
                      <input 
                        type="text"
                        placeholder="Ex: Fazenda de soja em Sorriso com mais de 2000 hectares..."
                        className="bg-transparent text-white text-base font-medium w-full outline-none placeholder:text-white/20 tracking-wide"
                        value={searchCity}
                        onChange={(e) => setSearchCity(e.target.value)}
                      />
                    </div>
                    <button 
                      className="w-full md:w-auto bg-white hover:brightness-90 transition-all duration-500 rounded-[2.5rem] px-12 py-6 flex items-center justify-center gap-4 group/btn shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] hover:-translate-y-1 active:scale-95"
                      onClick={() => navigate('/properties')}
                    >
                      <Search size={24} className="text-black group-hover/btn:scale-110 transition-transform" />
                      <span className="text-black font-black text-[12px] uppercase tracking-[0.2em]">Buscar Agora</span>
                    </button>
                  </div>
                )}

                {searchMode === 'advanced' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="relative group/field bg-white/[0.03] hover:bg-white/[0.08] transition-all duration-300 rounded-[2.5rem] p-5 px-8 border border-white/5">
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <MapPin size={11} style={{ color: settings.primaryColor }} /> Cidade
                      </p>
                      <input 
                        type="text"
                        placeholder="Qual cidade?"
                        className="bg-transparent text-white text-xs font-black w-full outline-none placeholder:text-white/20 uppercase tracking-widest"
                        value={searchCity}
                        onChange={(e) => setSearchCity(e.target.value)}
                      />
                    </div>
                    <div className="relative group/field bg-white/[0.03] hover:bg-white/[0.08] transition-all duration-300 rounded-[2.5rem] p-5 px-8 border border-white/5">
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <Home size={11} style={{ color: settings.primaryColor }} /> Tipo
                      </p>
                      <select 
                        className="bg-transparent text-white text-xs font-black w-full outline-none appearance-none cursor-pointer uppercase tracking-widest"
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                      >
                        <option className="bg-slate-900" value="Todos">Todos os Tipos</option>
                        <option className="bg-slate-900" value="Fazenda">Fazendas</option>
                        <option className="bg-slate-900" value="Sítio">Sítios</option>
                      </select>
                    </div>
                    <div className="relative group/field bg-white/[0.03] hover:bg-white/[0.08] transition-all duration-300 rounded-[2.5rem] p-5 px-8 border border-white/5">
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <DollarSign size={11} style={{ color: settings.primaryColor }} /> Valor Máximo
                      </p>
                      <select 
                        className="bg-transparent text-white text-xs font-black w-full outline-none appearance-none cursor-pointer uppercase tracking-widest"
                        value={searchMaxPrice}
                        onChange={(e) => setSearchMaxPrice(e.target.value)}
                      >
                        <option className="bg-slate-900" value="">Qualquer Valor</option>
                        <option className="bg-slate-900" value="5000000">Até R$ 5 Mi</option>
                        <option className="bg-slate-900" value="10000000">Até R$ 10 Mi</option>
                      </select>
                    </div>
                    <button 
                      className="bg-white hover:brightness-95 transition-all duration-500 rounded-[2.5rem] p-5 flex items-center justify-center gap-3 group/btn shadow-xl hover:-translate-y-0.5 active:scale-95"
                      onClick={() => navigate('/properties')}
                    >
                      <Search size={20} className="text-black" />
                      <span className="text-black font-black text-[10px] uppercase tracking-[0.2em]">Filtrar</span>
                    </button>
                  </div>
                )}

                {searchMode === 'code' && (
                  <div className="flex gap-4 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex-1 relative group/field bg-white/[0.03] hover:bg-white/[0.08] transition-all duration-300 rounded-[2.5rem] p-6 px-10 border border-white/5 focus-within:border-white/20 shadow-inner">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <Terminal size={12} style={{ color: settings.primaryColor }} /> Código do Imóvel
                      </p>
                      <input 
                        type="text"
                        placeholder="Ex: FZ-1234"
                        className="bg-transparent text-white text-xl font-mono font-bold w-full outline-none placeholder:text-white/20 uppercase tracking-[0.3em]"
                        value={searchCode}
                        onChange={(e) => setSearchCode(e.target.value)}
                      />
                    </div>
                    <button 
                      className="bg-white hover:brightness-95 transition-all duration-500 rounded-[2.5rem] px-12 py-6 flex items-center justify-center gap-4 group/btn shadow-xl active:scale-95"
                      onClick={() => navigate('/properties')}
                    >
                      <ChevronRight size={24} className="text-black group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 flex gap-12 text-white/40 font-black text-[9px] uppercase tracking-[0.3em]">
            <span className="flex items-center gap-2 italic"><span className="w-1 h-1 bg-white/40 rounded-full"></span> Suporte 24/7</span>
            <span className="flex items-center gap-2 italic"><span className="w-1 h-1 bg-white/40 rounded-full"></span> Mais de 10 mil Hect. Vendidos</span>
            <span className="flex items-center gap-2 italic"><span className="w-1 h-1 bg-white/40 rounded-full"></span> Escritura Imediata</span>
          </div>
        </div>
      </section>

      {/* Social Proof Bar - Full Width Impact */}
      <section className="relative z-20 py-12 px-6">
        <div className="max-w-7xl mx-auto bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] p-12 md:p-16 flex flex-col md:flex-row items-center justify-around gap-12 border-4" style={{ borderColor: `${settings.primaryColor}15`, backdropFilter: 'blur(20px)' }}>
           <div className="text-center group cursor-default">
              <span className="block text-5xl font-black mb-2 italic tracking-tighter transition-transform group-hover:scale-110" style={{ color: settings.secondaryColor }}>+1.5k</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/60">Imóveis Vendidos</span>
           </div>
           <div className="w-px h-16 bg-slate-100 hidden md:block"></div>
           <div className="text-center group cursor-default">
              <span className="block text-5xl font-black mb-2 italic tracking-tighter transition-transform group-hover:scale-110" style={{ color: settings.primaryColor }}>R$ 2Bi</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/60">Valor em Ativos</span>
           </div>
           <div className="w-px h-16 bg-slate-100 hidden md:block"></div>
           <div className="text-center group cursor-default">
              <span className="block text-5xl font-black mb-2 italic tracking-tighter transition-transform group-hover:scale-110" style={{ color: settings.secondaryColor }}>15 Anos</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/60">De Tradição Rural</span>
           </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="relative max-w-[1600px] mx-auto px-6 py-32">
        {/* Floating Decorative Badge */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full shadow-2xl border border-slate-50 flex flex-col items-center justify-center p-6 text-center rotate-12 group hover:rotate-0 transition-transform hidden xl:flex">
           <div className="w-12 h-12 rounded-full mb-2 flex items-center justify-center" style={{ backgroundColor: settings.primaryColor }}>
             <Home className="text-white" size={24} />
           </div>
           <span className="text-[8px] font-black uppercase tracking-widest leading-none">{settings.homeContent?.badgeText || 'Curadoria Especializada 2024'}</span>
        </div>

        <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
          <div className="max-w-3xl">
            <div className="flex gap-4 mb-6">
              <button 
                onClick={() => setSearchPurpose('Comprar')}
                className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all border ${searchPurpose === 'Comprar' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-transparent border-slate-200 text-slate-400 hover:border-slate-400'}`}
              >
                Imóveis para Comprar
              </button>
              <button 
                onClick={() => setSearchPurpose('Alugar')}
                className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all border ${searchPurpose === 'Alugar' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-transparent border-slate-200 text-slate-400 hover:border-slate-400'}`}
              >
                Imóveis para Alugar
              </button>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 block" style={{ color: settings.primaryColor }}>Oportunidades de Ouro</span>
            <h2 className="font-black mb-8 uppercase italic leading-none" style={{ color: settings.secondaryColor, fontSize: `${(settings.headingFontSize || 48) * 0.8}px` }}>
              {settings.homeContent?.featuredTitle ? (
                <>
                  {settings.homeContent.featuredTitle.split(' ')[0]} <br/>{settings.homeContent.featuredTitle.split(' ').slice(1).join(' ') || ''}
                </>
              ) : (
                <>Propriedades <br/>de Elite</>
              )}
            </h2>
            <div className="w-32 h-3 mb-8 rounded-full" style={{ backgroundColor: settings.primaryColor }}></div>
            <p className="text-black/60 text-xl font-medium leading-relaxed italic">"{settings.homeContent?.featuredDescription || 'Nossa curadoria foca em produtividade, localização estratégica e potencial de valorização exponencial.'}"</p>
          </div>
          <button className="flex items-center gap-4 text-sm font-black uppercase tracking-widest group px-8 py-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all shadow-sm" style={{ color: settings.secondaryColor }}>
            Ver Todos <ChevronRight className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {loading ? (
             <div className="col-span-3 text-center py-20">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: settings.primaryColor }}></div>
               <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Buscando Propriedades...</span>
             </div>
          ) : properties.length === 0 ? (
             <div className="col-span-3 text-center py-20 text-black/60 bg-slate-50 rounded-3xl border border-dashed">Nenhum imóvel em destaque no momento.</div>
          ) : (
            properties.map((property) => (
            <div 
              key={property.id} 
              onClick={() => navigate(`/property/${property.id}`)}
              className="group bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] transition-all border border-slate-100 flex flex-col h-full transform hover:-translate-y-4 duration-500 cursor-pointer"
            >
              <div className="relative h-72 overflow-hidden">
                <img 
                  src={property.images?.[0] || 'https://via.placeholder.com/400x300?text=Sem+Foto'} 
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[20%] group-hover:grayscale-0"
                />
                <div className="absolute top-6 left-6 text-white text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md" style={{ backgroundColor: `${settings.secondaryColor}CC` }}>
                  {property.type === PropertyType.LAND ? 'Agronegócio' : 'Premium'}
                </div>
                <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-xl px-5 py-3 rounded-[1.5rem] flex items-center gap-2 shadow-2xl border border-white/20 transform group-hover:scale-105 transition-transform">
                  <Maximize size={18} style={{ color: settings.primaryColor }} />
                  <span className="text-sm font-black uppercase tracking-tighter" style={{ color: settings.secondaryColor }}>
                    {property.features.area > 100000 
                      ? `${(property.features.area / 10000).toFixed(0)} Hect` 
                      : `${property.features.area}m²`}
                  </span>
                </div>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-2xl transform scale-0 group-hover:scale-100 transition-transform delay-100">
                    <ChevronRight size={28} style={{ color: settings.primaryColor }} />
                  </div>
                </div>
              </div>
              <div className="p-10 flex-1 flex flex-col">
                <div className="mb-6">
                  <p className="font-black text-[10px] uppercase tracking-[0.3em] mb-3 flex items-center gap-2" style={{ color: settings.primaryColor }}>
                    <div className="w-3 h-0.5" style={{ backgroundColor: settings.primaryColor }}></div>
                    {property.location.neighborhood}, {property.location.state}
                  </p>
                  <h3 className="text-2xl font-black text-black line-clamp-2 uppercase leading-[1.1] italic tracking-tighter transition-colors group-hover:text-indigo-950">{property.title}</h3>
                </div>
                <p className="text-black/60 text-sm line-clamp-3 mb-8 leading-relaxed font-medium italic opacity-80">"{property.description}"</p>
                <div className="mt-auto pt-8 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Investimento</span>
                    <span className="text-2xl font-black italic tracking-tighter" style={{ color: settings.secondaryColor }}>
                      {property.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:shadow-xl" style={{ backgroundColor: `${settings.secondaryColor}10`, color: settings.secondaryColor }}>
                    <Search size={20} />
                  </div>
                </div>
              </div>
            </div>
          )))}
        </div>
      </section>

      {/* Service Blocks Section - Inovare Inspired */}
      <section className="py-32 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 block" style={{ color: settings.primaryColor }}>Soluções Exclusivas</span>
            <h2 className="text-4xl md:text-5xl font-black text-black uppercase italic tracking-tighter">Como podemos ajudar?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Block 1: Compra */}
            <div className="group relative overflow-hidden bg-black rounded-[3rem] p-16 flex flex-col items-center text-center text-white transition-all hover:scale-[1.02] shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/10 transition-colors"></div>
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-8 border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                <Search size={40} style={{ color: settings.primaryColor }} />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-4 opacity-60">Serviço Premium</h3>
              <h4 className="text-3xl font-black mb-6 uppercase italic tracking-tighter">Compre seu Imóvel</h4>
              <p className="text-white/40 text-sm font-medium leading-relaxed mb-10 max-w-xs">
                Acesse nossa curadoria exclusiva de fazendas e ativos de luxo com total segurança.
              </p>
              <button className="px-10 py-5 rounded-full font-black uppercase text-[10px] tracking-[0.2em] transition-all bg-white text-black hover:scale-105 active:scale-95">
                Ver Oportunidades
              </button>
            </div>

            {/* Block 2: Anuncie */}
            <div className="group relative overflow-hidden bg-white rounded-[3rem] p-16 flex flex-col items-center text-center transition-all hover:scale-[1.02] shadow-2xl border border-slate-100">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-50 rounded-full -ml-20 -mb-20 blur-3xl group-hover:bg-slate-100 transition-colors"></div>
              <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-8 border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                <Home size={40} style={{ color: settings.primaryColor }} />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-4 opacity-40">Gestão Rural</h3>
              <h4 className="text-3xl font-black mb-6 uppercase italic tracking-tighter" style={{ color: settings.secondaryColor }}>Anuncie seu Imóvel</h4>
              <p className="text-black/60 text-sm font-medium leading-relaxed mb-10 max-w-xs">
                Venda sua propriedade através da maior rede de investidores do agronegócio nacional.
              </p>
              <button 
                className="px-10 py-5 rounded-full font-black uppercase text-[10px] tracking-[0.2em] transition-all text-white shadow-xl hover:scale-105 active:scale-95"
                style={{ backgroundColor: settings.primaryColor }}
              >
                Entrar em Contato
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section - Modern Blob Style */}
      <section className="py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24">
          <div className="flex-1 relative group">
            {/* Background Glow */}
            <div 
              className="absolute -top-10 -left-10 w-96 h-96 rounded-full blur-[120px] opacity-30"
              style={{ backgroundColor: settings.primaryColor }}
            ></div>
            
            {/* European Style Broker Card */}
            <div className="relative z-10 w-full h-[650px] bg-white rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-white transition-all duration-700 hover:shadow-[0_80px_150px_-30px_rgba(0,0,0,0.4)]">
              {/* Profile Image */}
              <div className="absolute inset-0">
                <img 
                  src={settings.homeContent?.broker?.photoUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"} 
                  alt={settings.homeContent?.broker?.name || "Renato Vilmar Piovesana"}
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
              </div>

              {/* Card Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
                <div className="mb-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 block text-white/60">Broker Exclusive</span>
                  <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-2">
                    {settings.homeContent?.broker?.name ? (
                      <>
                        {settings.homeContent.broker.name.split(' ').slice(0, -1).join(' ')} <br/> 
                        <span style={{ color: settings.primaryColor }}>{settings.homeContent.broker.name.split(' ').slice(-1)}</span>
                      </>
                    ) : (
                      <>Renato Vilmar <br/> <span style={{ color: settings.primaryColor }}>Piovesana</span></>
                    )}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                    CRECI {settings.homeContent?.broker?.creci || '10544F'} • Especialista em Ativos de Luxo
                  </p>
                </div>

                <div className="flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-200 translate-y-4 group-hover:translate-y-0">
                   <div className="flex gap-4">
                      <button 
                        onClick={() => window.open(`https://wa.me/${(settings.homeContent?.broker?.phone || '5544998433030').replace(/\D/g, '')}`, '_blank')}
                        className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                      >
                        <MessageCircle size={20} fill="currentColor" />
                      </button>
                      <button className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                        <Instagram size={20} />
                      </button>
                   </div>
                   <div className="h-px flex-1 bg-white/10"></div>
                   <button 
                    onClick={() => navigate('/properties')}
                    className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                  >
                     Ver Carteira <ChevronRight size={14} />
                   </button>
                </div>
              </div>

              {/* Floating Euro Badge */}
              <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white/40 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                 <div className="text-[8px] font-black uppercase tracking-widest text-center leading-tight">
                    Premium<br/>Selection
                 </div>
              </div>
            </div>

            {/* Background floating element */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-slate-900 rounded-[3rem] -z-10 group-hover:translate-x-5 group-hover:translate-y-5 transition-transform duration-1000"></div>
          </div>
          
          <div className="flex-1">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] mb-6 block" style={{ color: settings.primaryColor }}>Nossa História</span>
            <h2 className="text-5xl md:text-6xl font-black mb-10 leading-[0.95] uppercase italic tracking-tighter" style={{ color: settings.secondaryColor }}>
              A Especialista em <br/> <span style={{ color: settings.primaryColor }}>Ativos Rurais</span>
            </h2>
            <div className="space-y-8">
              <p className="text-black/60 text-lg leading-relaxed font-medium italic">
                "Nosso compromisso vai além da intermediação. Somos parceiros estratégicos na expansão do seu patrimônio rural, trazendo tecnologia e segurança jurídica para cada hectare negociado."
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                  <Clock size={24} className="mb-4" style={{ color: settings.primaryColor }} />
                  <h4 className="font-black uppercase text-xs tracking-widest mb-2">Agilidade</h4>
                  <p className="text-[11px] text-slate-400 font-bold leading-relaxed uppercase">Processos otimizados e seguros.</p>
                </div>
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                  <Search size={24} className="mb-4" style={{ color: settings.primaryColor }} />
                  <h4 className="font-black uppercase text-xs tracking-widest mb-2">Curadoria</h4>
                  <p className="text-[11px] text-slate-400 font-bold leading-relaxed uppercase">Seleção rigorosa de ativos.</p>
                </div>
              </div>
              <button className="w-full py-6 rounded-full font-black uppercase text-xs tracking-[0.3em] bg-slate-900 text-white transition-all shadow-xl hover:scale-105 active:scale-95">
                Saiba Mais sobre a {settings.agencyName}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Bridge */}
      <div className="fixed bottom-10 right-10 z-[100] group flex items-center gap-4">
        <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 pointer-events-none">
          <span className="text-[10px] font-black uppercase tracking-widest text-black">Fale com um corretor agora</span>
        </div>
        <button 
          onClick={() => window.open(`https://wa.me/${settings.contactPhone?.replace(/\D/g, '')}`, '_blank')}
          className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center shadow-[0_20px_50px_rgba(34,197,94,0.4)] hover:scale-110 active:scale-95 transition-all animate-bounce"
        >
          <MessageCircle size={36} fill="white" />
        </button>
      </div>

      {/* Footer */}
      <footer className="py-32 px-6 border-t border-white/5" style={{ backgroundColor: settings.secondaryColor, color: getContrastColor(settings.secondaryColor) }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="col-span-1 md:col-span-1">
            <div className="mb-10">
               {settings.logoUrl ? (
                 <img src={settings.logoUrl} alt="Logo Footer" className="w-auto object-contain opacity-90" style={{ height: `${(settings.logoHeight || 80) * 1.0}px`, maxHeight: '150px' }} />
               ) : (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-2xl" style={{ backgroundColor: settings.primaryColor }}>
                    <Home className="text-white" size={32} />
                  </div>
                  <span className="text-3xl font-black uppercase italic tracking-tighter">ImobSaaS</span>
                </div>
               )}
            </div>
            <p className="opacity-70 text-base leading-relaxed font-medium">
              {settings.footerText || "Especialistas em intermediação de ativos imobiliários de alto valor. Inteligência de mercado e assessoria completa."}
            </p>
          </div>
          <div>
            <h4 className="font-black mb-10 uppercase text-xs tracking-[0.4em]" style={{ color: settings.primaryColor }}>Serviços</h4>
            <ul className="space-y-5 text-sm font-bold opacity-70">
              <li><a href="#" className="hover:opacity-100 transition-colors" style={{ color: 'inherit' }}>Venda de Fazendas</a></li>
              <li><a href="#" className="hover:opacity-100 transition-colors" style={{ color: 'inherit' }}>Avaliação Patrimonial</a></li>
              <li><a href="#" className="hover:opacity-100 transition-colors" style={{ color: 'inherit' }}>Consultoria Jurídica</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black mb-10 uppercase text-xs tracking-[0.4em]" style={{ color: settings.primaryColor }}>Fale Conosco</h4>
            <ul className="space-y-5 opacity-70 text-sm font-bold">
              <li className="flex items-center gap-3"><Phone size={16} /> (61) 99999-0000</li>
              <li className="flex items-center gap-3"><Globe size={16} /> www.imobisaas.com</li>
            </ul>
          </div>
          <div>
             <h4 className="font-black mb-10 uppercase text-xs tracking-[0.4em]" style={{ color: settings.primaryColor }}>Redes Sociais</h4>
             <div className="flex gap-6">
               <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white hover:text-black cursor-pointer transition-all"><Globe size={24} /></div>
               <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white hover:text-black cursor-pointer transition-all"><Phone size={24} /></div>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-50">
          <div className="text-[10px] font-black uppercase tracking-[0.5em]">
            © 2024 Fazendas Brasil Select - Desenvolvido para ImobSaaS
          </div>
          <Link to="/admin" className="text-[10px] font-black uppercase tracking-[0.5em] hover:opacity-100 transition-opacity flex items-center gap-2">
            <Terminal size={12} /> Acesso Administrativo
          </Link>
        </div>
      </footer>

      {/* Lead Capture Modal */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsLeadModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setIsLeadModalOpen(false)}
              className="absolute top-8 right-8 w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-black transition-colors"
            >
              <X size={24} />
            </button>
            <div className="p-12 md:p-16">
              <div className="mb-10 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 block" style={{ color: settings.primaryColor }}>Atendimento Select</span>
                <h2 className="text-3xl md:text-4xl font-black text-black uppercase italic tracking-tighter leading-none mb-4">
                  Como podemos <br/><span style={{ color: settings.primaryColor }}>Ajudar você?</span>
                </h2>
                <p className="text-black/60 font-medium italic">Preencha os dados abaixo e um consultor entrará em contato em instantes.</p>
              </div>

              {leadSuccess ? (
                <div className="text-center py-10 animate-bounce">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-black text-black uppercase italic">Mensagem Enviada!</h3>
                  <p className="text-black/60">Obrigado pela confiança.</p>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Seu Nome Completo</p>
                    <input 
                      required
                      type="text"
                      className="w-full px-8 py-5 rounded-full bg-slate-50 border border-slate-100 focus:border-slate-300 focus:bg-white transition-all outline-none font-bold text-slate-700" 
                      placeholder="Ex: João da Silva"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">WhatsApp</p>
                      <input 
                        required
                        type="tel"
                        className="w-full px-8 py-5 rounded-full bg-slate-50 border border-slate-100 focus:border-slate-300 focus:bg-white transition-all outline-none font-bold text-slate-700" 
                        placeholder="(00) 00000-0000"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">E-mail (Opcional)</p>
                      <input 
                        type="email"
                        className="w-full px-8 py-5 rounded-full bg-slate-50 border border-slate-100 focus:border-slate-300 focus:bg-white transition-all outline-none font-bold text-slate-700" 
                        placeholder="contato@email.com"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({...leadForm, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <button 
                      disabled={isSubmittingLead}
                      type="submit"
                      className="w-full py-6 rounded-full font-black uppercase text-xs tracking-[0.3em] text-white transition-all shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      {isSubmittingLead ? 'Enviando...' : 'Solicitar Atendimento Exclusivo'}
                    </button>
                  </div>
                </form>
              )}
            </div>
            <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sua privacidade é nossa prioridade absoluta.</p>
            </div>
          </div>
        </div>
      )}
      {/* LUXURY Property Submission Modal - RE-DESIGNED */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 backdrop-blur-md animate-in fade-in duration-500" style={{ backgroundColor: settings.secondaryColor + 'cc' }}>
          <div className="bg-white w-full max-w-6xl h-full max-h-[850px] rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            
            {/* Sidebar - Progressive Tracker */}
            <div className="w-full md:w-80 p-10 flex flex-col justify-between relative overflow-hidden shrink-0" style={{ backgroundColor: settings.secondaryColor }}>
               {/* Background Glow */}
               <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle at 0% 0%, ${settings.primaryColor}, transparent 70%)` }}></div>
               
               <div className="relative z-10">
                 <div className="mb-12">
                   <h2 className="text-white text-2xl font-black italic tracking-tighter uppercase leading-tight">Venda seu<br/><span style={{ color: settings.primaryColor }}>Imóvel Elite</span></h2>
                   <p className="text-lg font-medium tracking-tight opacity-70">Curadoria de Luxo</p>
                 </div>

                 <div className="space-y-10">
                   {[
                     { step: 1, label: 'Proprietário', icon: Info },
                     { step: 2, label: 'O Imóvel', icon: Home },
                     { step: 3, label: 'Localização', icon: MapPin },
                     { step: 4, label: 'Mídias', icon: ImageIcon },
                   ].map((item) => (
                     <div key={item.step} className="flex items-center gap-5 group cursor-default">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                          activeStep === item.step 
                            ? 'bg-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                            : activeStep > item.step ? 'text-white' : 'bg-white/5 text-white/30'
                        }`} style={{ backgroundColor: activeStep > item.step ? settings.primaryColor : undefined, color: activeStep === item.step ? settings.secondaryColor : undefined }}>
                          {activeStep > item.step ? <CheckCircle2 size={18} /> : <item.icon size={18} />}
                        </div>
                        <div className="flex flex-col">
                           <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${activeStep === item.step ? 'text-white' : 'text-white/20'}`}>Passo 0{item.step}</span>
                           <span className={`text-sm font-bold transition-colors ${activeStep === item.step ? 'text-white' : 'text-white/40'}`}>{item.label}</span>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="relative z-10 mt-12 pt-10 border-t border-white/10 hidden md:block">
                  <p className="text-[10px] text-white/30 font-medium leading-relaxed uppercase tracking-tighter">
                    Ao submeter, você concorda que nossa equipe fará uma análise técnica detalhada antes da publicação final.
                  </p>
               </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full bg-slate-50/30">
              {/* Top Bar */}
              <div className="p-8 md:p-10 flex items-center justify-end">
                <button 
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="w-12 h-12 flex items-center justify-center bg-white text-slate-400 hover:text-red-500 rounded-full shadow-lg transition-all hover:rotate-90"
                >
                  <X size={20} />
                </button>
              </div>

              {submitSuccess ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="relative mb-10 group">
                    <div className="absolute inset-0 blur-3xl rounded-full opacity-20 group-hover:blur-[60px] transition-all duration-1000" style={{ backgroundColor: settings.primaryColor }}></div>
                    <div className="w-28 h-28 text-white rounded-[2rem] flex items-center justify-center relative z-10 shadow-2xl animate-in zoom-in duration-500 rotate-3 group-hover:rotate-0 transition-transform" style={{ backgroundColor: settings.primaryColor }}>
                      <CheckCircle2 size={48} strokeWidth={3} />
                    </div>
                  </div>
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-4" style={{ color: settings.secondaryColor }}>Proposta Recebida!</h3>
                  <p className="text-black/60 max-w-sm mx-auto leading-relaxed font-medium">
                    Excelente escolha. Nossa equipe de elite já foi notificada e entrará em contato em breve para os próximos passos.
                  </p>
                  <button 
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="mt-12 px-12 py-5 text-white rounded-full font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    style={{ backgroundColor: settings.secondaryColor }}
                  >
                    Voltar para Home
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-8 md:px-20 pb-10 custom-scrollbar flex flex-col">
                  {/* Steps Content */}
                  <div className="flex-1">
                    {activeStep === 1 && (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-10">
                         <div>
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2" style={{ color: settings.secondaryColor }}>Quem é o proprietário?</h3>
                            <p className="text-black/60 font-medium">Inicie com as informações básicas de contato.</p>
                         </div>
                         <div className="grid grid-cols-1 gap-8">
                            <div className="group">
                              <label className="text-[10px] font-black uppercase text-slate-400 block mb-3 tracking-widest ml-1 transition-colors group-focus-within:text-black">Nome Completo</label>
                              <input 
                                required type="text" 
                                value={propertyForm.ownerInfo?.name}
                                onChange={e => setPropertyForm({...propertyForm, ownerInfo: {...propertyForm.ownerInfo!, name: e.target.value}})}
                                className="w-full px-8 py-6 bg-white border border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:ring-4 outline-none transition-all shadow-sm"
                                style={{ '--tw-ring-color': settings.primaryColor + '15', borderColor: 'var(--focus-border-color)' } as any}
                                onFocus={(e) => e.target.style.borderColor = settings.primaryColor}
                                onBlur={(e) => e.target.style.borderColor = ''}
                                placeholder="Ex: Rodrigo Albuquerque"
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="group">
                                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-3 tracking-widest ml-1">E-mail Corporativo</label>
                                  <input 
                                    required type="email" 
                                    value={propertyForm.ownerInfo?.email}
                                    onChange={e => setPropertyForm({...propertyForm, ownerInfo: {...propertyForm.ownerInfo!, email: e.target.value}})}
                                    className="w-full px-8 py-6 bg-white border border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:ring-4 outline-none transition-all shadow-sm"
                                    onFocus={(e) => e.target.style.borderColor = settings.primaryColor}
                                    onBlur={(e) => e.target.style.borderColor = ''}
                                    placeholder="rodrigo@email.com"
                                  />
                                </div>
                                <div className="group">
                                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-3 tracking-widest ml-1">WhatsApp Direto</label>
                                  <input 
                                    required type="tel" 
                                    value={propertyForm.ownerInfo?.phone}
                                    onChange={e => setPropertyForm({...propertyForm, ownerInfo: {...propertyForm.ownerInfo!, phone: e.target.value}})}
                                    className="w-full px-8 py-6 bg-white border border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:ring-4 outline-none transition-all shadow-sm"
                                    onFocus={(e) => e.target.style.borderColor = settings.primaryColor}
                                    onBlur={(e) => e.target.style.borderColor = ''}
                                    placeholder="(00) 00000-0000"
                                  />
                                </div>
                            </div>
                         </div>
                      </div>
                    )}

                    {activeStep === 2 && (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-10">
                         <div>
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2" style={{ color: settings.secondaryColor }}>Detalhes do Imóvel</h3>
                            <p className="text-black/60 font-medium">O que torna sua propriedade única?</p>
                         </div>
                         <div className="space-y-8">
                            <div className="group">
                               <label className="text-[10px] font-black uppercase text-slate-400 block mb-3 tracking-widest ml-1">Título de Impacto</label>
                               <input 
                                required type="text" 
                                value={propertyForm.title}
                                onChange={e => setPropertyForm({...propertyForm, title: e.target.value})}
                                className="w-full px-8 py-6 bg-white border border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:ring-4 outline-none transition-all shadow-sm"
                                onFocus={(e) => e.target.style.borderColor = settings.primaryColor}
                                onBlur={(e) => e.target.style.borderColor = ''}
                                placeholder="Ex: Mansão suspensa com vista definitiva para o mar"
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="group">
                                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-3 tracking-widest ml-1">Tipo de Imóvel</label>
                                  <div className="relative">
                                    <select 
                                      className="w-full px-8 py-6 bg-white border border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:ring-4 outline-none appearance-none cursor-pointer shadow-sm transition-all"
                                      value={propertyForm.type}
                                      onChange={e => setPropertyForm({...propertyForm, type: e.target.value as any})}
                                      onFocus={(e) => e.target.style.borderColor = settings.primaryColor}
                                      onBlur={(e) => e.target.style.borderColor = ''}
                                    >
                                      <option value="Apartamento">Apartamento de Alto Padrão</option>
                                      <option value="Casa">Casa / Villa de Luxo</option>
                                      <option value="Terreno">Fazenda / Haras / Rural</option>
                                      <option value="Comercial">Corporativo / Industrial</option>
                                    </select>
                                    <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                                  </div>
                                </div>
                                <div className="group">
                                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-3 tracking-widest ml-1">Preço Sugerido (R$)</label>
                                  <input 
                                    type="number" 
                                    value={propertyForm.price}
                                    onChange={e => setPropertyForm({...propertyForm, price: Number(e.target.value)})}
                                    className="w-full px-8 py-6 bg-white border border-slate-100 rounded-3xl text-sm font-black outline-none transition-all shadow-sm"
                                    style={{ color: settings.primaryColor }}
                                    onFocus={(e) => e.target.style.borderColor = settings.primaryColor}
                                    onBlur={(e) => e.target.style.borderColor = ''}
                                  />
                                </div>
                            </div>
                            <div className="group w-1/2">
                              <label className="text-[10px] font-black uppercase text-slate-400 block mb-3 tracking-widest ml-1">Área Privativa (m²)</label>
                              <input 
                                type="number" 
                                value={propertyForm.features?.area}
                                onChange={e => setPropertyForm({...propertyForm, features: {...propertyForm.features!, area: Number(e.target.value)}})}
                                className="w-full px-8 py-6 bg-white border border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:ring-4 outline-none transition-all shadow-sm"
                                onFocus={(e) => e.target.style.borderColor = settings.primaryColor}
                                onBlur={(e) => e.target.style.borderColor = ''}
                              />
                            </div>
                         </div>
                      </div>
                    )}

                    {activeStep === 3 && (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-10">
                         <div>
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2" style={{ color: settings.secondaryColor }}>Onde fica?</h3>
                            <p className="text-black/60 font-medium">Sua localização deve ser precisa para valorizar o m².</p>
                         </div>
                         <div className="space-y-8">
                            <div className="group">
                               <label className="text-[10px] font-black uppercase text-slate-400 block mb-3 tracking-widest ml-1">Endereço Completo</label>
                               <input 
                                required type="text" 
                                value={propertyForm.location?.address}
                                onChange={e => setPropertyForm({...propertyForm, location: {...propertyForm.location!, address: e.target.value}})}
                                className="w-full px-8 py-6 bg-white border border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:ring-4 outline-none transition-all shadow-sm"
                                onFocus={(e) => e.target.style.borderColor = settings.primaryColor}
                                onBlur={(e) => e.target.style.borderColor = ''}
                                placeholder="Rua, número e CEP"
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="group">
                                   <label className="text-[10px] font-black uppercase text-slate-400 block mb-3 tracking-widest ml-1">Cidade / Munícipio</label>
                                   <input 
                                    required type="text" 
                                    value={propertyForm.location?.city}
                                    onChange={e => setPropertyForm({...propertyForm, location: {...propertyForm.location!, city: e.target.value}})}
                                    className="w-full px-8 py-6 bg-white border border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:ring-4 outline-none transition-all shadow-sm"
                                    onFocus={(e) => e.target.style.borderColor = settings.primaryColor}
                                    onBlur={(e) => e.target.style.borderColor = ''}
                                    placeholder="Ex: Ribeirão Preto"
                                  />
                                </div>
                                <div className="group">
                                   <label className="text-[10px] font-black uppercase text-slate-400 block mb-3 tracking-widest ml-1">Bairro / Região</label>
                                   <input 
                                    required type="text" 
                                    value={propertyForm.location?.neighborhood}
                                    onChange={e => setPropertyForm({...propertyForm, location: {...propertyForm.location!, neighborhood: e.target.value}})}
                                    className="w-full px-8 py-6 bg-white border border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:ring-4 outline-none transition-all shadow-sm"
                                    onFocus={(e) => e.target.style.borderColor = settings.primaryColor}
                                    onBlur={(e) => e.target.style.borderColor = ''}
                                    placeholder="Ex: Jardim Botânico"
                                  />
                                </div>
                            </div>
                         </div>
                      </div>
                    )}

                    {activeStep === 4 && (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-10">
                         <div>
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2" style={{ color: settings.secondaryColor }}>Visuais & Galeria</h3>
                            <p className="text-black/60 font-medium">Bons visuais aumentam a conversão em até 80%.</p>
                         </div>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {propertyForm.images?.map((img, idx) => (
                              <div key={idx} className="relative aspect-[4/5] rounded-[2rem] overflow-hidden group border-2 border-white shadow-xl hover:scale-[1.02] transition-all">
                                <img src={img} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-red-500/90 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer" onClick={() => setPropertyForm(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== idx) }))}>
                                  <Trash2 size={24} />
                                </div>
                              </div>
                            ))}
                            <label className="aspect-[4/5] border-3 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 hover:border-slate-950 transition-all bg-white cursor-pointer group shadow-sm" style={{ borderColor: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = settings.secondaryColor} onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}>
                              {uploadingImage ? <Loader2 className="animate-spin" size={32} style={{ color: settings.secondaryColor }} /> : (
                                <>
                                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 group-hover:text-white transition-all" style={{ backgroundColor: 'var(--hover-bg, #f8fafc)' } as any} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = settings.secondaryColor} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}>
                                    <Plus size={24} />
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-center px-4">Adicionar<br/>Fotografias</span>
                                </>
                              )}
                              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                         </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-sm -mx-8 md:-mx-20 px-8 md:px-20 pb-10 sticky bottom-0">
                     <button 
                       type="button"
                       onClick={() => activeStep > 1 && setActiveStep(activeStep - 1)}
                       disabled={activeStep === 1}
                       className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-black disabled:opacity-0 transition-all flex items-center gap-2"
                     >
                       <ChevronRight className="rotate-180" size={16} /> Voltar
                     </button>
                     
                     {activeStep < 4 ? (
                       <button 
                        type="button"
                        onClick={() => setActiveStep(activeStep + 1)}
                        className="px-12 py-5 text-white rounded-full font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
                        style={{ backgroundColor: settings.primaryColor, color: getContrastColor(settings.primaryColor) }}
                       >
                         Continuar para Passo 0{activeStep + 1}
                         <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                       </button>
                     ) : (
                        <button 
                        type="button"
                        onClick={handleSubmitProperty}
                        disabled={isSubmittingProperty}
                        className="px-16 py-5 text-white rounded-full font-black uppercase text-[11px] tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group disabled:opacity-50"
                        style={{ backgroundColor: settings.primaryColor, color: getContrastColor(settings.primaryColor) }}
                       >
                         {isSubmittingProperty ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                         Finalizar Submissão
                       </button>
                     )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
