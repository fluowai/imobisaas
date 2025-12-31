
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  LogOut, 
  Search,
  PlusCircle,
  Sparkles,
  PieChart,
  Globe,
  Database,
  Settings
} from 'lucide-react';
import { MOCK_USER } from '../constants';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { settings } = useSettings();
  const { profile, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/#/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Home, label: 'Fazendas & Imóveis', path: '/admin/properties' },
    { icon: Users, label: 'Leads & CRM', path: '/admin/crm' },
    { icon: Settings, label: 'Configurações', path: '/admin/site-config' },
    { icon: Calendar, label: 'Agenda', path: '/admin/agenda' },
    { icon: FileText, label: 'Contratos', path: '/admin/contracts' },
    { icon: PieChart, label: 'BI & Rural', path: '/admin/reports' },
    { icon: Sparkles, label: 'IA Studio', path: '/admin/ai-assistant' },
    { icon: Database, label: 'Migração', path: '/admin/migration' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" style={{ fontFamily: '"Poppins", sans-serif', fontSize: '16px' }}>
      {/* Sidebar - Fix: Using a dark theme for professional look instead of secondaryColor background */}
      <aside className="w-68 bg-[#000000] text-white flex flex-col hidden md:flex transition-all">
        <div className="p-8 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-12 w-auto object-contain max-w-[180px]" />
            ) : (
              <>
                <div className="p-2 rounded-xl" style={{ backgroundColor: settings.primaryColor }}>
                  <Home className="text-white" size={28} />
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase italic">PAINEL</span>
              </>
            )}
          </Link>
          <a 
            href="/#/site" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-6 flex items-center justify-center gap-2 w-full bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border border-indigo-500/30"
          >
            <Globe size={14} /> Visualizar Site
          </a>
        </div>
        
        <nav className="flex-1 p-5 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-white/10 text-white shadow-lg' 
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`
              }
              style={({ isActive }) => isActive ? { borderLeft: `4px solid ${settings.primaryColor}` } : {}}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} className={isActive ? "text-white" : "text-white/50"} />
                  <span className="font-semibold text-sm">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
         {/* Bottom: User Profile & Logout */}
        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-black text-sm">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-white">{profile?.full_name || 'Usuário'}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">{profile?.role === 'admin' ? 'Admin' : 'Corretor'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
          >
            <LogOut size={18} className="opacity-60 group-hover:opacity-100" />
            <span className="text-xs font-black uppercase tracking-widest">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shadow-sm z-10">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar fazendas, clientes ou matrículas..." 
              className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-5">
             <div className="hidden lg:flex flex-col text-right mr-2">
                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Saldo do Mês</span>
                <span className="text-sm font-black text-emerald-600">R$ 142.500,00</span>
             </div>
            <Link to="/admin/properties/new" className="flex items-center gap-2 text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-all shadow-lg hover:brightness-110 active:scale-95" style={{ backgroundColor: settings.primaryColor }}>
              <PlusCircle size={20} />
              Novo Imóvel
            </Link>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
