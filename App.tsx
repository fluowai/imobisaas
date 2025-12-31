
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './views/LandingPage';
import AdminDashboard from './views/AdminDashboard';
import PropertyDetail from './views/PropertyDetail';
import PropertyManagement from './views/PropertyManagement';
import AIAssistant from './views/AIAssistant';
import PropertyEditor from './views/PropertyEditor';
import TemplateCustomizer from './views/TemplateCustomizer';
import SetupWizard from './views/SetupWizard';
import Migration from './views/Migration';
import KanbanBoard from './views/CRM/KanbanBoard';
import BIRural from './views/BIRural';
import LegalContracts from './views/LegalContracts';
import Login from './views/Login';
import Register from './views/Register';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Simple placeholder for other views
const Placeholder: React.FC<{ name: string }> = ({ name }) => (
  <div className="flex flex-col items-center justify-center h-full text-slate-400">
    <h2 className="text-2xl font-bold mb-2">Módulo: {name}</h2>
    <p>Funcionalidade em desenvolvimento para o MVP completo.</p>
  </div>
);


// Wrapper para verificar se o setup já foi feito
const AppContent: React.FC = () => {
  const { settings, loading } = useSettings();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Verificação: Se o nome for o default E id existir (significando que carregou do banco mas não foi alterado)
  // Ou se não tiver ID (erro de carga ou vazio), manda pro setup pra tentar arrumar
  const isDefaultName = settings.agencyName === 'Minha Imobiliária';
  const needsSetup = isDefaultName; 

  return (
    <BrowserRouter>
      <Routes>
        {/* Setup Wizard - Acessível se precisar de setup ou explicitamente */}
        <Route path="/setup" element={<SetupWizard />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public Portal Routes */}
        <Route path="/site" element={<LandingPage />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        
        {/* Redirect Root to Site (or Setup) */}
        <Route path="/" element={needsSetup ? <Navigate to="/setup" replace /> : <Navigate to="/site" replace />} />
        
        {/* Admin Dashboard Routes - PROTEGIDAS */}
        <Route path="/admin" element={<ProtectedRoute><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
        <Route path="/admin/properties" element={<ProtectedRoute><Layout><PropertyManagement /></Layout></ProtectedRoute>} />
        <Route path="/admin/properties/:id" element={<ProtectedRoute><Layout><PropertyEditor /></Layout></ProtectedRoute>} />
        <Route path="/admin/crm" element={<ProtectedRoute><Layout><KanbanBoard /></Layout></ProtectedRoute>} />
        <Route path="/admin/site-config" element={<ProtectedRoute><Layout><TemplateCustomizer /></Layout></ProtectedRoute>} />
        <Route path="/admin/agenda" element={<ProtectedRoute><Layout><Placeholder name="Agenda do Corretor" /></Layout></ProtectedRoute>} />
        <Route path="/admin/contracts" element={<ProtectedRoute><Layout><LegalContracts /></Layout></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute><Layout><BIRural /></Layout></ProtectedRoute>} />
        <Route path="/admin/ai-assistant" element={<ProtectedRoute><Layout><AIAssistant /></Layout></ProtectedRoute>} />
        <Route path="/admin/migration" element={<ProtectedRoute><Layout><Migration /></Layout></ProtectedRoute>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SettingsProvider>
  );
};

export default App;
