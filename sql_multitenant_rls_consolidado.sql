-- =============================================================
-- uniRP Plataforma - Multi-Tenant + RLS + Super Admin
-- Data: 2026-04-01
-- Execucao: Supabase SQL Editor
-- Objetivo: consolidar infraestrutura de tenant, seguranca LGPD e politicas globais
-- =============================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'tenant_module_type'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.tenant_module_type AS ENUM ('orgao_publico', 'autarquia');
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.enterprise_tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(160) NOT NULL,
  tipo_modulo public.tenant_module_type NOT NULL,
  status boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.enterprise_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.enterprise_tenants(id) ON DELETE CASCADE,
  missao text,
  tom_de_voz text,
  publico_alvo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id)
);

-- Tabela de perfis (equivalente a users no contexto de aplicacao)
-- Cria automaticamente se ainda nao existir no projeto Supabase.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  role varchar(40) NOT NULL DEFAULT 'user',
  tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL,
  tipo_modulo public.tenant_module_type,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enterprise_tenants_tipo_modulo ON public.enterprise_tenants(tipo_modulo);
CREATE INDEX IF NOT EXISTS idx_enterprise_tenants_status ON public.enterprise_tenants(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_settings_tenant_id ON public.enterprise_settings(tenant_id);

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS role varchar(40) NOT NULL DEFAULT 'user';

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS tipo_modulo public.tenant_module_type;

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS role varchar(40) NOT NULL DEFAULT 'user';

UPDATE public.profiles
SET role = 'user'
WHERE role IS NULL OR trim(role) = '';

-- Tabelas operacionais conhecidas no repositorio
ALTER TABLE IF EXISTS public.settings ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.press_contacts ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.cabinet_demands ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.demands ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.hub_influenciadores ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.atas_inteligentes ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.plano_estrategico ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.workflow_colunas ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.workflow_cards ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.hub_contents ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.press_assets ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.perfil_agencia ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.crm_contatos ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.enterprise_jornalistas ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.enterprise_pautas ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.enterprise_atas ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.enterprise_clipping ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.enterprise_demandas ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.enterprise_relacionamento ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.enterprise_cerebro_configuracao ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.enterprise_sala_configuracao ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.enterprise_campanhas ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.enterprise_comunicados ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.enterprise_tenants(id) ON DELETE SET NULL;

DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN
    SELECT table_schema, table_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name = 'tenant_id'
  LOOP
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON %I.%I (tenant_id)',
      'idx_' || rec.table_name || '_tenant_id',
      rec.table_schema,
      rec.table_name
    );
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enterprise_tenants_updated_at ON public.enterprise_tenants;
CREATE TRIGGER trg_enterprise_tenants_updated_at
BEFORE UPDATE ON public.enterprise_tenants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_enterprise_settings_updated_at ON public.enterprise_settings;
CREATE TRIGGER trg_enterprise_settings_updated_at
BEFORE UPDATE ON public.enterprise_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()), 'user');
$$;

CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_role() = 'super_admin';
$$;

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.enterprise_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.enterprise_settings ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN (
        'settings', 'press_contacts', 'cabinet_demands', 'demands', 'hub_influenciadores',
        'atas_inteligentes', 'plano_estrategico', 'workflow_colunas', 'workflow_cards',
        'hub_contents', 'press_assets', 'perfil_agencia', 'crm_contatos',
        'enterprise_jornalistas', 'enterprise_pautas', 'enterprise_atas', 'enterprise_clipping',
        'enterprise_demandas', 'enterprise_relacionamento', 'enterprise_cerebro_configuracao',
        'enterprise_sala_configuracao', 'enterprise_campanhas', 'enterprise_comunicados'
      )
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', rec.tablename);
  END LOOP;
END;
$$;

DROP POLICY IF EXISTS profiles_super_admin_all ON public.profiles;
CREATE POLICY profiles_super_admin_all ON public.profiles
FOR ALL
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND COALESCE(role, 'user') = 'user');

DROP POLICY IF EXISTS enterprise_tenants_super_admin_all ON public.enterprise_tenants;
CREATE POLICY enterprise_tenants_super_admin_all ON public.enterprise_tenants
FOR ALL
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS enterprise_tenants_select_user_tenant ON public.enterprise_tenants;
CREATE POLICY enterprise_tenants_select_user_tenant ON public.enterprise_tenants
FOR SELECT
USING (id = public.current_tenant_id());

DROP POLICY IF EXISTS enterprise_settings_super_admin_all ON public.enterprise_settings;
CREATE POLICY enterprise_settings_super_admin_all ON public.enterprise_settings
FOR ALL
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS enterprise_settings_tenant_scope ON public.enterprise_settings;
CREATE POLICY enterprise_settings_tenant_scope ON public.enterprise_settings
FOR ALL
USING (tenant_id = public.current_tenant_id())
WITH CHECK (tenant_id = public.current_tenant_id());

DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN
    SELECT c.table_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.column_name = 'tenant_id'
      AND c.table_name NOT IN ('enterprise_settings', 'profiles', 'enterprise_tenants')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', rec.table_name || '_super_admin_all', rec.table_name);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin())',
      rec.table_name || '_super_admin_all',
      rec.table_name
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', rec.table_name || '_tenant_scope', rec.table_name);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL USING (tenant_id = public.current_tenant_id()) WITH CHECK (tenant_id = public.current_tenant_id())',
      rec.table_name || '_tenant_scope',
      rec.table_name
    );
  END LOOP;
END;
$$;

COMMIT;
