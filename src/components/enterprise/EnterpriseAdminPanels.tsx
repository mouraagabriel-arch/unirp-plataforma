import { Building2, Globe2, LayoutGrid } from 'lucide-react';

interface PanelProps {
  title: string;
  description: string;
  countLabel: string;
  countValue: number;
  emptyLabel: string;
}

function SimpleAdminPanel({ title, description, countLabel, countValue, emptyLabel }: PanelProps) {
  return (
    <section className="max-w-7xl mx-auto py-8 text-slate-100 space-y-4">
      <header className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <h1 className="text-2xl font-black text-white">{title}</h1>
        <p className="text-sm text-slate-400 mt-2">{description}</p>
      </header>

      <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <p className="text-xs uppercase tracking-wider text-slate-400 font-black">{countLabel}</p>
        <p className="text-4xl font-black text-white mt-2">{countValue}</p>
        <p className="text-sm text-slate-400 mt-3">{emptyLabel}</p>
      </article>
    </section>
  );
}

export function EnterpriseAdminOverview({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 mb-3">
        <LayoutGrid className="w-4 h-4" />
        Visão consolidada disponível
      </div>
      <SimpleAdminPanel
        title="Visão Geral"
        description="Resumo operacional da instância administrativa com fallback imediato."
        countLabel="Módulos ativos"
        countValue={0}
        emptyLabel="Nenhum item encontrado"
      />
      <span className="sr-only">Tema atual: {isDarkMode ? 'escuro' : 'claro'}</span>
    </div>
  );
}

export function EnterpriseTenantManagement({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 mb-3">
        <Building2 className="w-4 h-4" />
        Gestão de tenants pronta para uso
      </div>
      <SimpleAdminPanel
        title="Gestão de Tenants"
        description="Lista de tenants sem bloqueio de carregamento."
        countLabel="Tenants cadastrados"
        countValue={0}
        emptyLabel="Nenhum item encontrado"
      />
      <span className="sr-only">Tema atual: {isDarkMode ? 'escuro' : 'claro'}</span>
    </div>
  );
}

export function EnterprisePublicSiteManagement({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 mb-3">
        <Globe2 className="w-4 h-4" />
        Gestão do site público operacional
      </div>
      <SimpleAdminPanel
        title="Gestão do Site Público"
        description="Publicações e páginas com fallback para estado vazio."
        countLabel="Itens publicados"
        countValue={0}
        emptyLabel="Nenhum item encontrado"
      />
      <span className="sr-only">Tema atual: {isDarkMode ? 'escuro' : 'claro'}</span>
    </div>
  );
}
