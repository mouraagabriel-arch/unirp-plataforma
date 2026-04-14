import { useEffect, useMemo, useState } from 'react';
import { Building2, FileSearch, Palette, ShieldCheck } from 'lucide-react';
import { useTenantService } from '../../services/useTenantService';

type TenantUsage = {
  id: string;
  nome: string;
  status: string;
  tipo_modulo: string;
  primary_color?: string | null;
  logo_url?: string | null;
  clippingTotal: number;
  crmTotal: number;
};

type AuditLog = {
  id: string;
  tenant_id: string;
  user_id: string | null;
  acao: string;
  tabela_afetada: string;
  detalhes_json: Record<string, any> | null;
  created_at: string;
};

interface EnterpriseAdminConsoleProps {
  isDarkMode: boolean;
}

export function EnterpriseAdminConsole({ isDarkMode }: EnterpriseAdminConsoleProps) {
  const tenantService = useTenantService();

  const [loadingTenants, setLoadingTenants] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [tenantUsage, setTenantUsage] = useState<TenantUsage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [logUserFilter, setLogUserFilter] = useState('');
  const [logActionFilter, setLogActionFilter] = useState('');

  const loadTenants = async () => {
    setLoadingTenants(true);
    try {
      const { data, error } = await tenantService.getTenantUsageSummaryForAdmin();
      if (error || !data) {
        setTenantUsage([]);
        return;
      }
      setTenantUsage(data);
    } finally {
      setLoadingTenants(false);
    }
  };

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data, error } = await tenantService.listAuditLogsForAdmin({
        userId: logUserFilter.trim() || undefined,
        acao: logActionFilter || undefined,
        limit: 200,
      });

      if (error || !data) {
        setAuditLogs([]);
        return;
      }

      setAuditLogs(data as AuditLog[]);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    void loadTenants();
  }, [tenantService]);

  useEffect(() => {
    void loadLogs();
  }, [tenantService]);

  const totais = useMemo(() => {
    return tenantUsage.reduce(
      (acc, row) => {
        acc.crm += row.crmTotal || 0;
        acc.clipping += row.clippingTotal || 0;
        return acc;
      },
      { crm: 0, clipping: 0 }
    );
  }, [tenantUsage]);

  return (
    <section className="max-w-7xl mx-auto py-8 space-y-6 text-slate-100">
      <header className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <h1 className="text-2xl font-black text-white">Console de Administração</h1>
        <p className="text-sm text-slate-400 mt-2">Central SaaS com dados reais de uso por tenant e trilha de auditoria.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-black">Tenants monitorados</p>
          <p className="text-3xl font-black text-white mt-2">{tenantUsage.length}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-black">Total CRM</p>
          <p className="text-3xl font-black text-white mt-2">{totais.crm}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-black">Total Clipping</p>
          <p className="text-3xl font-black text-white mt-2">{totais.clipping}</p>
        </article>
      </div>

      <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-brand-accent" />
          <h2 className="text-lg font-black text-white">Gestão de Tenants</h2>
        </div>

        {loadingTenants ? (
          <p className="text-sm text-slate-400">Carregando tenants...</p>
        ) : tenantUsage.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum dado cadastrado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-white/10">
                  <th className="py-3 pr-3">Tenant</th>
                  <th className="py-3 pr-3">Módulo</th>
                  <th className="py-3 pr-3">Status</th>
                  <th className="py-3 pr-3">CRM</th>
                  <th className="py-3 pr-3">Clipping</th>
                  <th className="py-3 pr-3">Branding</th>
                </tr>
              </thead>
              <tbody>
                {tenantUsage.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-white/5">
                    <td className="py-3 pr-3 text-white font-semibold">{tenant.nome || 'Sem nome'}</td>
                    <td className="py-3 pr-3 text-slate-300">{tenant.tipo_modulo || 'Nao informado'}</td>
                    <td className="py-3 pr-3 text-slate-300">{tenant.status || 'Nao informado'}</td>
                    <td className="py-3 pr-3 text-slate-200">{tenant.crmTotal}</td>
                    <td className="py-3 pr-3 text-slate-200">{tenant.clippingTotal}</td>
                    <td className="py-3 pr-3">
                      <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-2 py-1">
                        <Palette className="w-3.5 h-3.5 text-slate-400" />
                        <span
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: tenant.primary_color || '#6366f1' }}
                        />
                        <span className="text-xs text-slate-300">{tenant.primary_color || 'Padrão'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-accent" />
          <h2 className="text-lg font-black text-white">Logs de Auditoria</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={logUserFilter}
            onChange={(event) => setLogUserFilter(event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            placeholder="Filtrar por user_id"
          />
          <select
            value={logActionFilter}
            onChange={(event) => setLogActionFilter(event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          >
            <option value="" className="bg-slate-900">Todas ações</option>
            <option value="INSERT" className="bg-slate-900">INSERT</option>
            <option value="UPDATE" className="bg-slate-900">UPDATE</option>
            <option value="DELETE" className="bg-slate-900">DELETE</option>
            <option value="LOGIN" className="bg-slate-900">LOGIN</option>
            <option value="LOGOUT" className="bg-slate-900">LOGOUT</option>
            <option value="EXPORT" className="bg-slate-900">EXPORT</option>
          </select>
          <button
            onClick={() => void loadLogs()}
            className="rounded-xl border border-brand-accent/30 bg-brand-accent/20 px-4 py-2 text-sm font-black text-brand-accent"
          >
            Filtrar Logs
          </button>
          <button
            onClick={() => {
              setLogUserFilter('');
              setLogActionFilter('');
              void loadLogs();
            }}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-slate-200"
          >
            Limpar Filtros
          </button>
        </div>

        {loadingLogs ? (
          <p className="text-sm text-slate-400">Carregando logs...</p>
        ) : auditLogs.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum dado cadastrado</p>
        ) : (
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-wider text-brand-accent font-black">
                    {log.acao} em {log.tabela_afetada}
                  </p>
                  <span className="text-xs text-slate-400">{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                </div>
                <p className="text-sm text-slate-300 mt-1">Usuário: {log.user_id || 'Nao informado'} • Tenant: {log.tenant_id}</p>
                {log.detalhes_json ? (
                  <p className="text-xs text-slate-400 mt-1 break-all">{JSON.stringify(log.detalhes_json)}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <div className="inline-flex items-center gap-2 text-slate-300 text-sm">
          <FileSearch className="w-4 h-4" />
          Query operacional pronta para rastrear ações críticas, incluindo deleções financeiras do Gabinete.
        </div>
      </article>

      <span className="sr-only">Tema atual: {isDarkMode ? 'escuro' : 'claro'}</span>
    </section>
  );
}
