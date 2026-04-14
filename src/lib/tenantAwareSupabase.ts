const TENANT_STORAGE_KEY = 'unirp_active_tenant_id';

// Tabelas que têm coluna `tenant_id` (UUID) como discriminador de tenant
const TENANT_ID_TABLES = new Set([
  'settings',
  'press_contacts',
  'cabinet_demands',
  'demands',
  'hub_influenciadores',
  'atas_inteligentes',
  'plano_estrategico',
  'workflow_colunas',
  'workflow_cards',
  'hub_contents',
  'press_assets',
  'perfil_agencia',
  'crm_contatos',
  'enterprise_settings',
  'enterprise_jornalistas',
  'gabinete_hub_conteudos',
  'gabinete_cidadaos',
  'gabinete_workflow_tarefas',
  'gabinete_transparencia_cotas',
]);

// Tabelas que NÃO têm tenant_id — usam coluna `ambiente` (text) como discriminador.
// O wrapper injeta o tenantId UUID como valor de `ambiente` para garantir isolamento.
const AMBIENTE_TABLES = new Set([
  'enterprise_pautas',
  'enterprise_atas',
  'enterprise_clipping',
  'enterprise_demandas',
  'enterprise_relacionamento',
  'enterprise_cerebro_configuracao',
  'enterprise_sala_configuracao',
  'enterprise_campanhas',
  'enterprise_comunicados',
  'enterprise_crm_grupos',
  'enterprise_pesquisas',
  'enterprise_pesquisa_respostas',
]);

function getActiveTenantId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem(TENANT_STORAGE_KEY);
}

function injectTenantCol(values: any, col: string, tenantId: string | null) {
  if (!tenantId) return values;
  if (Array.isArray(values)) {
    return values.map((item) => ({ ...item, [col]: item?.[col] ?? tenantId }));
  }
  if (values && typeof values === 'object') {
    return { ...values, [col]: values[col] ?? tenantId };
  }
  return values;
}

function wrapBuilder(tableName: string, builder: any) {
  const isTenantId = TENANT_ID_TABLES.has(tableName);
  const isAmbiente = AMBIENTE_TABLES.has(tableName);

  if (!isTenantId && !isAmbiente) {
    return builder;
  }

  const tenantId = getActiveTenantId();
  // Coluna e valor a ser usado para filtrar/injetar o tenant
  const col = isTenantId ? 'tenant_id' : 'ambiente';

  const originalSelect = builder.select?.bind(builder);
  if (originalSelect) {
    builder.select = (...args: any[]) => {
      const query = originalSelect(...args);
      return tenantId ? query.eq(col, tenantId) : query;
    };
  }

  const originalInsert = builder.insert?.bind(builder);
  if (originalInsert) {
    builder.insert = (values: any, ...args: any[]) => {
      const payload = injectTenantCol(values, col, tenantId);
      return originalInsert(payload, ...args);
    };
  }

  const originalUpsert = builder.upsert?.bind(builder);
  if (originalUpsert) {
    builder.upsert = (values: any, ...args: any[]) => {
      const payload = injectTenantCol(values, col, tenantId);
      return originalUpsert(payload, ...args);
    };
  }

  const originalUpdate = builder.update?.bind(builder);
  if (originalUpdate) {
    builder.update = (values: any, ...args: any[]) => {
      const payload = isTenantId ? injectTenantCol(values, col, tenantId) : values;
      const query = originalUpdate(payload, ...args);
      return tenantId ? query.eq(col, tenantId) : query;
    };
  }

  const originalDelete = builder.delete?.bind(builder);
  if (originalDelete) {
    builder.delete = (...args: any[]) => {
      const query = originalDelete(...args);
      return tenantId ? query.eq(col, tenantId) : query;
    };
  }

  return builder;
}

export function createTenantAwareSupabase(baseClient: any) {
  return new Proxy(baseClient, {
    get(target, prop, receiver) {
      if (prop !== 'from') {
        return Reflect.get(target, prop, receiver);
      }

      return (tableName: string) => {
        const builder = target.from(tableName);
        return wrapBuilder(tableName, builder);
      };
    },
  });
}
