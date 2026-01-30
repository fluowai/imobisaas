-- FIX DEFINITIVO PARA ROTEAMENTO PÚBLICO
-- Execute este script no Supabase SQL Editor

-- 1. Melhorar RPC para ser case-insensitivity e garantir search_path
create or replace function get_tenant_public(slug_input text)
returns table (id uuid, name text, slug text, plan_id uuid)
security definer
set search_path = public -- GARANTE que acha as tabelas certas
as $$
begin
  return query
  select o.id, o.name, o.slug, o.plan_id
  from organizations o
  where lower(o.slug) = lower(trim(slug_input)) -- Ignora maiusculas/minusculas e espaços
  limit 1;
end;
$$ language plpgsql;

-- 2. Melhorar RPC de Settings também
create or replace function get_site_settings_public(org_id uuid)
returns json
security definer
set search_path = public
as $$
declare
  data record;
begin
  select * into data
  from site_settings
  where organization_id = org_id
  limit 1;
  
  if not found then return null; end if;

  return json_build_object(
    'organization_id', data.organization_id,
    'logo', data.logo,
    'primary_color', data.primary_color,
    'secondary_color', data.secondary_color,
    'site_title', data.site_title,
    'contact_email', data.contact_email,
    'contact_phone', data.contact_phone
  );
end;
$$ language plpgsql;

-- 3. Garantir Permissões (Novamente)
grant execute on function get_tenant_public(text) to anon, authenticated, service_role;
grant execute on function get_site_settings_public(uuid) to anon, authenticated, service_role;

-- 4. Garantir Policy de Leitura Pública
drop policy if exists "Public view published pages" on landing_pages;
create policy "Public view published pages"
  on landing_pages for select
  using ( status = 'published' );
