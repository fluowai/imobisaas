import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { propertyService } from '../services/properties';
import { Property, PropertyType } from '../types';
import { 
  ArrowLeft, 
  MapPin, 
  Share2, 
  Heart, 
  CheckCircle2, 
  Calendar,
  Maximize,
  Home,
  Phone,
  MessageCircle,
  Mail,
  Printer,
  Terminal
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import LeadCaptureModal from '../components/LeadCaptureModal';

const getContrastColor = (hexcolor: string | undefined) => {
  if (!hexcolor) return 'white';
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
};

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      try {
        const data = await propertyService.getById(id); // Use full ID from URL
        setProperty(data);
      } catch (e) {
        console.error('Erro ao carregar imóvel', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: settings.primaryColor }}></div>
      </div>
    );
  }

  if (!property) return null;

  const images = property.images?.length > 0 ? property.images : ['https://via.placeholder.com/1200x800?text=Sem+Imagem'];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '"Poppins", sans-serif', fontSize: '16px' }}>
      {/* Header (Simplified for Detail Page) */}
      <header className="border-b border-slate-200 sticky top-0 z-50 shadow-sm" style={{ backgroundColor: settings.headerColor || settings.secondaryColor, color: getContrastColor(settings.headerColor || settings.secondaryColor) }}>
        <div className="max-w-7xl mx-auto px-6 min-h-24 py-4 flex items-center justify-between">
           <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/site')}>
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-auto object-contain" style={{ height: `${(settings.logoHeight || 80) * 0.6}px`, maxHeight: '100px' }} />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: settings.primaryColor }}>
                    <Home size={20} className="text-white" />
                  </div>
                  <span className="text-xl font-bold text-black tracking-tight">ImobSaaS</span>
                </div>
              )}
           </div>
           
           <div className="flex items-center gap-4">
             <button onClick={() => navigate('/site')} className="flex items-center gap-2 hover:opacity-80 font-medium text-sm" style={{ color: 'inherit' }}>
                <ArrowLeft size={16} /> Voltar para a lista
             </button>
             <button 
               onClick={() => setIsLeadModalOpen(true)}
               className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
               style={{ backgroundColor: '#25D366' }}
             >
               <MessageCircle size={18} />
               Falar no WhatsApp
             </button>
           </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-black/40 uppercase tracking-wider mb-4">
            <span>Home</span> / <span>{property.type}</span> / <span style={{ color: settings.primaryColor }}>{property.id.slice(0, 8)}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <h1 className="font-black text-black leading-tight max-w-4xl uppercase italic" style={{ fontSize: `${(settings.headingFontSize || 48) * 0.7}px` }}>
              {property.title}
            </h1>
            <div className="flex flex-col items-end">
               <span className="text-sm font-bold text-black/40 uppercase tracking-widest mb-1">Valor de Venda</span>
               <div className="text-3xl font-black" style={{ color: settings.primaryColor }}>
                 {property.price > 0 ? property.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Sob Consulta'}
               </div>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-4 text-black/60 text-sm font-medium border-b border-slate-200 pb-8">
            <div className="flex items-center gap-2">
              <MapPin size={18} style={{ color: settings.primaryColor }} />
              {property.location.neighborhood}, {property.location.city} - {property.location.state}
            </div>
            <div className="flex items-center gap-2">
               <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${property.status === 'Disponível' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                 {property.status}
               </span>
            </div>
            <div className="flex-1 flex justify-end gap-3">
               <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-xs font-bold uppercase tracking-wider">
                 <Share2 size={14} /> Compartilhar
               </button>
               <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-xs font-bold uppercase tracking-wider">
                 <Printer size={14} /> Imprimir
               </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Gallery & Description */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Gallery */}
            <div className="space-y-4">
              <div className="aspect-video w-full bg-slate-100 rounded-3xl overflow-hidden shadow-sm relative group">
                <img 
                  src={images[activeImage]} 
                  alt={property.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  Foto {activeImage + 1} de {images.length}
                </div>
              </div>
              <div className="grid grid-cols-5 md:grid-cols-6 gap-3">
                {images.map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${activeImage === idx ? 'border-indigo-600 opacity-100 scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    style={{ borderColor: activeImage === idx ? settings.primaryColor : 'transparent' }}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-black uppercase tracking-wider text-black mb-6 flex items-center gap-3">
                <div className="w-8 h-1 rounded-full" style={{ backgroundColor: settings.primaryColor }}></div>
                Sobre o Imóvel
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </div>
            </div>

            {/* Features Grid (Ficha Técnica Inspired) */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
               <h3 className="text-lg font-black uppercase tracking-wider text-slate-800 mb-8 border-b pb-4">Ficha Técnica</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
                  <div>
                    <span className="block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">Tipo</span>
                    <span className="font-bold text-slate-800">{property.type}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">Área Total</span>
                    <span className="font-bold text-slate-800">{(property.features.areaHectares || 0).toLocaleString('pt-BR')} hectares</span>
                  </div>
                  {property.features.areaAlqueires && (
                    <div>
                      <span className="block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">Alqueires</span>
                      <span className="font-bold text-slate-800">{property.features.areaAlqueires.toLocaleString('pt-BR')}</span>
                    </div>
                  )}
                  <div>
                    <span className="block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">Casa Sede</span>
                    <span className="font-bold text-slate-800">{property.features.casaSede ? 'Sim' : 'Não'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">Tipo de Solo</span>
                    <span className="font-bold text-slate-800">{property.features.tipoSolo}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">Estado</span>
                    <span className="font-bold text-slate-800">{property.location.state}</span>
                  </div>
                   <div>
                    <span className="block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">Cidade</span>
                    <span className="font-bold text-slate-800">{property.location.city}</span>
                  </div>
                  {property.features.temGado && (
                    <div>
                      <span className="block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">Pecuária</span>
                      <span className="font-bold text-slate-800">
                        {property.features.capacidadeCabecas ? `${property.features.capacidadeCabecas} cabeças` : 'Sim'}
                      </span>
                    </div>
                  )}
                  {property.features.fontesAgua && property.features.fontesAgua.length > 0 && (
                    <div className="md:col-span-2">
                      <span className="block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">Fontes de Água</span>
                      <span className="font-bold text-slate-800">{property.features.fontesAgua.join(', ')}</span>
                    </div>
                  )}
                  {property.features.usoAtual && property.features.usoAtual.length > 0 && (
                    <div className="md:col-span-3">
                      <span className="block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">Uso Atual</span>
                      <span className="font-bold text-slate-800">{property.features.usoAtual.join(', ')}</span>
                    </div>
                  )}
                  <div>
                    <span className="block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">Código</span>
                    <span className="font-bold text-slate-800">#{property.id.slice(0,6)}</span>
                  </div>
               </div>
            </div>

          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Contact Card */}
            <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] border border-slate-100 sticky top-24">
               <div className="text-center mb-8">
                 <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
                    {/* Placeholder Avatar or Company Logo */}
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} className="w-full h-full object-contain p-2" />
                    ) : ( 
                      <div className="w-full h-full flex items-center justify-center bg-slate-200">
                         <Home size={32} className="text-black/40" />
                      </div>
                    )}
                 </div>
                 <h3 className="font-black text-lg text-black">{settings.agencyName}</h3>
                 <p className="text-xs font-bold text-black/40 uppercase tracking-widest">Consultor Especialista</p>
               </div>

               <div className="space-y-4">
                 <button 
                   onClick={() => setIsLeadModalOpen(true)}
                   className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider text-sm"
                   style={{ backgroundColor: '#25D366' }}
                 >
                   <MessageCircle size={20} />
                   WhatsApp
                 </button>
                  <button 
                   className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider text-sm"
                   style={{ backgroundColor: settings.primaryColor }}
                 >
                   <Phone size={20} />
                   Ligar Agora
                 </button>
                  <button 
                   className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 active:scale-95 transition-all uppercase tracking-wider text-sm"
                 >
                   <Mail size={20} />
                   Enviar E-mail
                 </button>
               </div>
               
               <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                 <p className="text-xs text-black/40 mb-2">Gostou deste imóvel?</p>
                 <button className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-2">
                    <Heart size={14} /> Adicionar aos Favoritos
                 </button>
               </div>
            </div>

            {/* Related/Map placeholder could go here */}
             <div className="bg-slate-100 rounded-3xl p-8 border border-slate-200 text-center h-64 flex flex-col items-center justify-center">
                 <MapPin size={32} className="text-slate-300 mb-2" />
                 <span className="text-sm font-bold text-black/40">Mapa de Localização</span>
                 <p className="text-xs text-black/40 mt-1 max-w-[200px]">A localização exata é fornecida mediante agendamento.</p>
             </div>

          </div>

        </div>
      </main>
      
      {/* Footer similar to Landing Page */}
      <footer className="mt-20 py-32 px-6 border-t border-white/5" style={{ backgroundColor: settings.secondaryColor, color: getContrastColor(settings.secondaryColor) }}>
         <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo Footer" className="w-auto object-contain opacity-90" style={{ height: `${(settings.logoHeight || 80) * 0.7}px`, maxHeight: '80px' }} />
            ) : (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl" style={{ backgroundColor: settings.primaryColor }}>
                  <Home className="text-white" size={32} />
                </div>
                <span className="text-3xl font-black uppercase italic tracking-tighter">ImobSaaS</span>
              </div>
            )}
            <div className="flex flex-col md:flex-row justify-between items-center w-full gap-6 opacity-50">
               <p className="text-sm font-medium">© 2024 {settings.agencyName} - Todos os direitos reservados.</p>
               <Link to="/admin" className="text-[10px] font-black uppercase tracking-[0.5em] hover:opacity-100 transition-opacity flex items-center gap-2">
                 <Terminal size={12} /> Acesso Administrativo
               </Link>
            </div>
         </div>
      </footer>

      <LeadCaptureModal 
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        propertyTitle={property.title}
        propertyId={property.id}
      />
    </div>
  );
};

export default PropertyDetail;
