-- Saneamento global de tenant_id para ambiente multi-tenant.
-- 1) Preenche tenant_id nulo usando tenant padrao (super_admin ou primeiro tenant).
-- 2) Aplica NOT NULL em tabelas operacionais quando seguro.

DO $$
DECLARE
  v_default_tenant_id uuid;
  v_table_name text;
  v_null_count bigint;
  v_operational_tables text[] := ARRAY[
    'enterprise_clipping',
    'enterprise_demandas',
    'enterprise_pautas',
    'enterprise_jornalistas',
    'enterprise_crm_grupos',
    'press_contacts',
    'cabinet_demands',
    'gabinete_transparencia_cotas',
    'enterprise_workflow_items',
    'enterprise_workflow'
  ];
BEGIN
  -- Tenant padrao: tenant vinculado a super_admin; fallback para primeiro tenant cadastrado.
  SELECT p.tenant_id
  INTO v_default_tenant_id
  FROM public.profiles p
  WHERE p.role = 'super_admin'
    AND p.tenant_id IS NOT NULL
  ORDER BY p.updated_at DESC NULLS LAST, p.created_at DESC NULLS LAST
  LIMIT 1;

  IF v_default_tenant_id IS NULL THEN
    SELECT t.id
    INTO v_default_tenant_id
    FROM public.enterprise_tenants t
    ORDER BY t.created_at ASC NULLS LAST, t.id ASC
    LIMIT 1;
  END IF;

  IF v_default_tenant_id IS NULL THEN
    RAISE NOTICE 'Nenhum tenant encontrado em public.enterprise_tenants. O saneamento de tenant_id sera pulado. Crie ao menos um tenant e execute o script novamente.';
    RETURN;
  END IF;

  RAISE NOTICE 'tenant padrao utilizado no saneamento: %', v_default_tenant_id;

  -- Preenche tenant_id nulo em todas as tabelas de dominio com coluna tenant_id.
  FOR v_table_name IN
    SELECT c.table_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.column_name = 'tenant_id'
      AND c.table_name NOT IN ('enterprise_tenants', 'profiles')
  LOOP
    EXECUTE format(
      'UPDATE public.%I SET tenant_id = %L::uuid WHERE tenant_id IS NULL',
      v_table_name,
      v_default_tenant_id
    );

    RAISE NOTICE 'tenant_id nulo saneado em public.%', v_table_name;
  END LOOP;

  -- Endurece esquema com NOT NULL nas tabelas operacionais quando nao houver nulos remanescentes.
  FOREACH v_table_name IN ARRAY v_operational_tables
  LOOP
    IF to_regclass('public.' || v_table_name) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format('SELECT COUNT(*) FROM public.%I WHERE tenant_id IS NULL', v_table_name)
    INTO v_null_count;

    IF v_null_count > 0 THEN
      RAISE WARNING 'public.% ainda possui % registros com tenant_id nulo; NOT NULL nao aplicado.', v_table_name, v_null_count;
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN tenant_id SET NOT NULL', v_table_name);
    RAISE NOTICE 'NOT NULL aplicado em public.%.tenant_id', v_table_name;
  END LOOP;
END
$$;

-- Relatorio final rapido de nulos por tabela tenantizada.
SELECT
  c.table_name,
  (
    SELECT COUNT(*)
    FROM pg_catalog.pg_class pc
    WHERE pc.relname = c.table_name
  ) AS table_exists,
  format('SELECT COUNT(*) AS null_tenant_id FROM public.%I WHERE tenant_id IS NULL', c.table_name) AS query_sugestao
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.column_name = 'tenant_id'
ORDER BY c.table_name;
