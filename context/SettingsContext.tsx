

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SiteSettings } from '../types';
import { DEFAULT_SITE_SETTINGS } from '../constants';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: SiteSettings) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode; organizationId?: string }> = ({ children, organizationId }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const { profile, loading: authLoading } = useAuth(); // Access Auth to get Organization ID

  const activeOrganizationId = organizationId || profile?.organization_id;

  // Carregar configurações do Supabase
  useEffect(() => {
    // Wait for auth to load only if we don't have a forced organizationId
    if (authLoading && !organizationId) return;

    const loadSettings = async () => {
      try {
        setSettingsLoading(true);
        
        let query = supabase.from('site_settings').select('*');
        
        // MULTI-TENANT LOGIC: Filter by Organization ID if available
        if (activeOrganizationId) {
            query = query.eq('organization_id', activeOrganizationId);
        } else {
             // Fallback for global or unauthenticated (load GLOBAL default or nothing?)
             // For now, let's assume Super Admins or public might see a default if we have a "global" row with null org_id
             // Or explicitly id=1 as before
             query = query.or('id.eq.1,organization_id.is.null'); // Attempt backward compatibility
        }

        const { data, error } = await query.single();

        if (error) {
           console.log("Settings Load Info:", error.message);
           // Fallback to defaults is fine
        } else if (data) {
          // Mapear campos do banco (snake_case) para a aplicação (camelCase)
          setSettings({
            ...DEFAULT_SITE_SETTINGS,
            id: data.id,
            agencyName: data.agency_name || DEFAULT_SITE_SETTINGS.agencyName,
            templateId: data.template_id || DEFAULT_SITE_SETTINGS.templateId,
            primaryColor: data.primary_color || DEFAULT_SITE_SETTINGS.primaryColor,
            secondaryColor: data.secondary_color || DEFAULT_SITE_SETTINGS.secondaryColor,
            headerColor: data.header_color, 
            logoUrl: data.logo_url || DEFAULT_SITE_SETTINGS.logoUrl,
            logoHeight: data.logo_height || 80, 
            fontFamily: data.font_family || 'Inter, sans-serif',
            baseFontSize: data.base_font_size || 16,
            headingFontSize: data.heading_font_size || 48,
            contactPhone: data.contact_phone || DEFAULT_SITE_SETTINGS.contactPhone,
            contactEmail: data.contact_email || DEFAULT_SITE_SETTINGS.contactEmail,
            footerText: data.footer_text || DEFAULT_SITE_SETTINGS.footerText,
            socialLinks: {
              instagram: data.instagram_url,
              facebook: data.facebook_url,
              whatsapp: data.whatsapp_number
            },
            homeContent: data.home_content || {}, 
            integrations: data.integrations 
          });
        }
      } catch (e) {
        console.error("Erro inesperado ao carregar settings:", e);
      } finally {
        setSettingsLoading(false);
      }
    };

    loadSettings();
  }, [activeOrganizationId, authLoading, organizationId]); // Reload when org changes

  const updateSettings = async (newSettings: SiteSettings) => {
    setSettings(newSettings);

    try {
      const payload: any = {
        organization_id: activeOrganizationId, // Ensure we save to the correct Tenant
        agency_name: newSettings.agencyName,
        primary_color: newSettings.primaryColor,
        secondary_color: newSettings.secondaryColor,
        header_color: newSettings.headerColor, 
        logo_url: newSettings.logoUrl,
        logo_height: newSettings.logoHeight,
        font_family: newSettings.fontFamily,
        base_font_size: newSettings.baseFontSize,
        heading_font_size: newSettings.headingFontSize,
        footer_text: newSettings.footerText,
        template_id: newSettings.templateId,
        instagram_url: newSettings.socialLinks?.instagram,
        facebook_url: newSettings.socialLinks?.facebook,
        whatsapp_number: newSettings.socialLinks?.whatsapp,
        home_content: newSettings.homeContent, 
        integrations: newSettings.integrations,
        updated_at: new Date().toISOString()
      };

      const idToUse = newSettings.id || (settings as any).id;
      
      if (idToUse) {
        payload.id = idToUse;
      }

      const { data, error } = await supabase
        .from('site_settings')
        .upsert(payload)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
          setSettings(prev => ({ ...prev, id: data.id }));
      }

    } catch (e: any) {
      console.error("Erro ao salvar no Supabase:", e);
      alert(`Erro ao salvar configurações: ${e.message || e}`);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading: settingsLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings deve ser usado dentro de um SettingsProvider');
  }
  return context;
};

