-- =============================================================
-- SCRIPT DE EMERGÊNCIA — LIMPEZA DE POLÍTICAS PÚBLICAS + RLS
-- Projeto: ComuniqueGov / unirp-plataforma
-- Data: 2026-04-02
-- Executar no: Supabase SQL Editor (como superuser/postgres)
-- ORDEM DE EXECUÇÃO: Execute de cima para baixo, em bloco único.
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- ETAPA 0: Garantir dependências (funções de tenant)
-- is_super_admin() e current_tenant_id() devem existir.
-- Se já existem no seu banco, este bloco é no-op.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- ─────────────────────────────────────────────────────────────
-- ETAPA 1: DROP automático de TODAS as políticas públicas/abertas
-- Alvo: qualquer política cujo nome contenha:
--   anon_all | Public Access | _all_access_public | _all_anon | anon_select
-- em QUALQUER tabela do schema public.
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        policyname ILIKE '%anon_all%'
        OR policyname ILIKE '%public access%'
        OR policyname ILIKE '%_all_access_public%'
        OR policyname ILIKE '%all_anon%'
        OR policyname ILIKE '%anon_select%'
        OR policyname ILIKE '%allow all%'
        OR policyname ILIKE '%public_all%'
      )
  LOOP
    RAISE NOTICE 'Removendo política pública: % da tabela %', r.policyname, r.tablename;
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- ETAPA 2: Ativar RLS nas tabelas críticas que podem estar sem ele
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    -- Core multi-tenant
    'enterprise_tenants', 'profiles', 'enterprise_settings',
    -- CRM / Contatos
    'crm_interactions', 'enterprise_jornalistas', 'enterprise_crm_grupos',
    -- Clipping / Conteúdo
    'enterprise_clipping', 'enterprise_pautas', 'enterprise_atas',
    -- Workflow / Demandas
    'enterprise_demandas', 'workflow_colunas', 'workflow_cards',
    -- Endomarketing
    'enterprise_comunicados', 'enterprise_pesquisas', 'enterprise_pesquisa_respostas',
    'enterprise_campanhas',
    -- Relacionamento / Sala
    'enterprise_relacionamento', 'enterprise_cerebro_configuracao',
    'enterprise_sala_configuracao',
    -- Dados legados
    'crm_contatos', 'hub_influenciadores', 'atas_inteligentes',
    'plano_estrategico', 'perfil_agencia', 'press_contacts',
    'cabinet_demands', 'demands', 'hub_contents', 'press_assets', 'settings',
    -- Gabinete
    'gabinete_transparencia_cotas', 'system_audit_logs'
  ] LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      RAISE NOTICE 'RLS ativado: %', t;
    END IF;
  END LOOP;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- ETAPA 3: Recriar políticas seguras para tabelas com tenant_id (UUID)
-- Padrão: super_admin vê tudo; usuário comum vê só o próprio tenant.
-- Requer auth.uid() — anon NUNCA passa.
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'crm_interactions', 'enterprise_jornalistas',
    'enterprise_settings', 'gabinete_transparencia_cotas',
    'system_audit_logs'
  ] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      CONTINUE;
    END IF;
    -- Pula tabelas que não têm tenant_id (evita erro 42703)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t AND column_name = 'tenant_id'
    ) THEN
      RAISE NOTICE 'Tabela % não tem coluna tenant_id — pulando Etapa 3', t;
      CONTINUE;
    END IF;

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_super_admin_all', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated
       USING (public.is_super_admin())
       WITH CHECK (public.is_super_admin())',
      t || '_super_admin_all', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_tenant_scope', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated
       USING (tenant_id = public.current_tenant_id())
       WITH CHECK (tenant_id = public.current_tenant_id())',
      t || '_tenant_scope', t
    );
  END LOOP;
END;
$$;

-- enterprise_tenants tem PK = id (ela É a tabela de tenants, não tem coluna tenant_id)
DROP POLICY IF EXISTS enterprise_tenants_super_admin_all ON public.enterprise_tenants;
CREATE POLICY enterprise_tenants_super_admin_all ON public.enterprise_tenants
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS enterprise_tenants_select_own ON public.enterprise_tenants;
CREATE POLICY enterprise_tenants_select_own ON public.enterprise_tenants
  FOR SELECT TO authenticated
  USING (id = public.current_tenant_id());

-- ─────────────────────────────────────────────────────────────
-- ETAPA 4: Políticas seguras para tabelas com coluna `ambiente` (text)
-- IMPORTANTE: O frontend agora usa o UUID do tenant como valor de `ambiente`
-- para garantir isolamento real. Dados legados com ambiente='enterprise'
-- devem ser migrados com: UPDATE <tabela> SET ambiente = '<uuid_tenant>';
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'enterprise_clipping', 'enterprise_pautas', 'enterprise_atas',
    'enterprise_demandas', 'enterprise_relacionamento',
    'enterprise_cerebro_configuracao', 'enterprise_sala_configuracao',
    'enterprise_campanhas', 'enterprise_comunicados',
    'enterprise_pesquisas', 'enterprise_pesquisa_respostas',
    'enterprise_crm_grupos'
  ] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      CONTINUE;
    END IF;

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_super_admin_all', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated
       USING (public.is_super_admin())
       WITH CHECK (public.is_super_admin())',
      t || '_super_admin_all', t
    );

    -- ambiente armazena o UUID do tenant (injetado pelo tenantAwareSupabase.ts)
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_tenant_scope', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated
       USING (ambiente = public.current_tenant_id()::text)
       WITH CHECK (ambiente = public.current_tenant_id()::text)',
      t || '_tenant_scope', t
    );
  END LOOP;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- MIGRAÇÃO DE DADOS LEGADOS (execute apenas uma vez por tenant)
-- Substitua '00000000-0000-0000-0000-000000000000' pelo UUID real do tenant.
-- Para encontrar o UUID: SELECT id FROM enterprise_tenants LIMIT 10;
-- ─────────────────────────────────────────────────────────────
-- UPDATE public.enterprise_clipping          SET ambiente = '<uuid_tenant>' WHERE ambiente IN ('enterprise','padrao');
-- UPDATE public.enterprise_pautas            SET ambiente = '<uuid_tenant>' WHERE ambiente IN ('enterprise','padrao');
-- UPDATE public.enterprise_atas              SET ambiente = '<uuid_tenant>' WHERE ambiente IN ('enterprise','padrao');
-- UPDATE public.enterprise_demandas          SET ambiente = '<uuid_tenant>' WHERE ambiente IN ('enterprise','padrao');
-- UPDATE public.enterprise_relacionamento    SET ambiente = '<uuid_tenant>' WHERE ambiente IN ('enterprise','padrao');
-- UPDATE public.enterprise_cerebro_configuracao SET ambiente = '<uuid_tenant>' WHERE ambiente IN ('enterprise','padrao');
-- UPDATE public.enterprise_sala_configuracao SET ambiente = '<uuid_tenant>' WHERE ambiente IN ('enterprise','padrao');
-- UPDATE public.enterprise_campanhas         SET ambiente = '<uuid_tenant>' WHERE ambiente IN ('enterprise','padrao');
-- UPDATE public.enterprise_comunicados       SET ambiente = '<uuid_tenant>' WHERE ambiente IN ('enterprise','padrao');
-- UPDATE public.enterprise_pesquisas         SET ambiente = '<uuid_tenant>' WHERE ambiente IN ('enterprise','padrao');
-- UPDATE public.enterprise_pesquisa_respostas SET ambiente = '<uuid_tenant>' WHERE ambiente IN ('enterprise','padrao');
-- UPDATE public.enterprise_crm_grupos        SET ambiente = '<uuid_tenant>' WHERE ambiente IN ('enterprise','padrao');

-- ─────────────────────────────────────────────────────────────
-- ETAPA 5: Políticas para tabelas legadas (coluna user_id)
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'crm_contatos', 'hub_influenciadores', 'atas_inteligentes',
    'plano_estrategico', 'perfil_agencia', 'workflow_colunas', 'workflow_cards',
    'press_contacts', 'cabinet_demands', 'demands',
    'hub_contents', 'press_assets', 'settings'
  ] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      CONTINUE;
    END IF;

    -- Verifica se a tabela tem tenant_id ou user_id
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t AND column_name = 'tenant_id'
    ) THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_tenant_scope', t);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO authenticated
         USING (tenant_id = public.current_tenant_id())
         WITH CHECK (tenant_id = public.current_tenant_id())',
        t || '_tenant_scope', t
      );
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t AND column_name = 'user_id'
    ) THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_owner_scope', t);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO authenticated
         USING (user_id = auth.uid())
         WITH CHECK (user_id = auth.uid())',
        t || '_owner_scope', t
      );
    END IF;
  END LOOP;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- ETAPA 6: Profiles — política especial (usuário vê só o próprio perfil)
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS profiles_super_admin_all ON public.profiles;
CREATE POLICY profiles_super_admin_all ON public.profiles
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND COALESCE(role, 'user') = 'user');

-- ─────────────────────────────────────────────────────────────
-- ETAPA 7: Verificação final — lista políticas restantes abertas
-- Se retornar linhas, essas políticas precisam de revisão manual.
-- ─────────────────────────────────────────────────────────────
SELECT
  tablename,
  policyname,
  roles,
  cmd,
  qual AS using_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    -- Políticas que permitem acesso sem auth.uid() na expressão USING
    qual NOT ILIKE '%auth.uid()%'
    AND qual NOT ILIKE '%is_super_admin()%'
    AND qual NOT ILIKE '%current_tenant_id()%'
  )
ORDER BY tablename, policyname;
