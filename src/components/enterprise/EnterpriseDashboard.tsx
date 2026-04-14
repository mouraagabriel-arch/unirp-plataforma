import { useEffect, useState, useMemo, type ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  CalendarDays,
  CheckCircle2,
  FileText,
  Newspaper,
  Plus,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import {
  Cell,
  Pie,
  PieChart as RePie,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useTenantService } from '../../services/useTenantService';

// ── Types ──────────────────────────────────────────────────────────────────────

interface DashboardKPIs {
  sentimentoPct: number;
  clippingTotal: number;
  clippingPositivo: number;
  estrategicosPct: number;
  crmTotal: number;
  estrategicos: number;
  pautasAtivas: number;
  demandasUrgentes: number;
}

interface WorkflowItem {
  id: string;
  titulo: string;
  prioridade: string;
  prazo_texto?: string;
  deadline?: string;
  responsavel?: string;
  status_coluna: string;
}

interface DemandaItem {
  id: string;
  titulo: string;
  prioridade: string;
  status_ticket: string;
  created_at: string;
  secretaria_solicitante?: string;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-white/5', className)} />;
}

function PriorityBadge({ value }: { value: string }) {
  const lower = value.toLowerCase();
  const isUrgent = lower === 'urgente';
  const isHigh = lower === 'alta';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap',
        isUrgent || isHigh
          ? 'bg-rose-500/15 border-rose-400/30 text-rose-300'
          : 'bg-amber-500/15 border-amber-400/30 text-amber-300',
      )}
    >
      {isUrgent ? '🚨 Urgente' : isHigh ? '🔴 Alta' : '🟡 Média'}
    </span>
  );
}

function CRMStatCard({
  icon: Icon,
  iconColor,
  value,
  label,
  onClick,
}: {
  icon: ElementType;
  iconColor: string;
  value: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4 text-left hover:bg-white/5 transition-colors"
    >
      <Icon className={cn('w-5 h-5 mb-2', iconColor)} />
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{label}</p>
    </button>
  );
}

// ── AI Insight generator (data-driven, deterministic) ─────────────────────────

function generateInsight(
  kpis: DashboardKPIs | null,
  workflow: WorkflowItem[],
  demandas: DemandaItem[],
): string {
  if (!kpis) return 'Carregando dados para gerar insight...';
  const parts: string[] = [];

  if (kpis.clippingTotal > 0) {
    if (kpis.sentimentoPct >= 70) {
      parts.push(
        `Clipping com ${kpis.sentimentoPct}% de cobertura favorável — momento estratégico para amplificar ações institucionais.`,
      );
    } else if (kpis.sentimentoPct >= 40) {
      parts.push(
        `Sentimento da mídia em ${kpis.sentimentoPct}% favorável — acompanhe as pautas para manter a tendência positiva.`,
      );
    } else {
      parts.push(
        `Atenção: apenas ${kpis.sentimentoPct}% de cobertura favorável — considere acionar o playbook de gestão de crise.`,
      );
    }
  } else {
    parts.push('Nenhum clipping indexado ainda — acesse o Monitoramento para cadastrar alertas de mídia.');
  }

  if (workflow.length > 0) {
    parts.push(`${workflow.length} pauta(s) no Workflow aguardando revisão e aprovação.`);
  }

  const urgentes = demandas.filter((d) => d.prioridade.toLowerCase() === 'urgente');
  if (urgentes.length > 0) {
    parts.push(`${urgentes.length} demanda(s) urgente(s) exige(m) atenção imediata no Relacionamento.`);
  }

  if (kpis.estrategicos > 0) {
    parts.push(
      `${kpis.estrategicos} contato(s) estratégico(s) no CRM — mantenha o ciclo de relacionamento ativo.`,
    );
  }

  return parts.length > 0
    ? parts.join(' ')
    : 'Todos os indicadores monitorados — nenhum alerta crítico no momento.';
}

// ── Quick actions config ───────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    label: 'Criar Conteúdo',
    hint: 'Hub de releases e posts',
    to: '/enterprise/hub',
    icon: FileText,
    iconBg: 'bg-cyan-500/10 border border-cyan-400/20',
    iconColor: 'text-cyan-300',
    accent: true,
  },
  {
    label: 'Processar Ata',
    hint: 'IA extrai decisões e pautas',
    to: '/enterprise/atas',
    icon: Brain,
    iconBg: 'bg-emerald-500/10 border border-emerald-400/20',
    iconColor: 'text-emerald-300',
    accent: false,
  },
  {
    label: 'Adicionar Contato',
    hint: 'CRM de imprensa',
    to: '/enterprise/crm?action=new',
    icon: Plus,
    iconBg: 'bg-brand-accent/10 border border-brand-accent/20',
    iconColor: 'text-brand-accent',
    accent: false,
  },
  {
    label: 'Nova Demanda',
    hint: 'Relacionamento interno',
    to: '/enterprise/influenciadores?action=new',
    icon: Zap,
    iconBg: 'bg-amber-500/10 border border-amber-400/20',
    iconColor: 'text-amber-300',
    accent: false,
  },
];

// ── KPI cards builder ──────────────────────────────────────────────────────────

function buildKpiCards(kpis: DashboardKPIs | null, navigate: (to: string) => void) {
  return [
    {
      label: 'Sentimento Positivo',
      value: kpis ? `${kpis.sentimentoPct}%` : '—',
      trend: kpis?.clippingTotal ? `${kpis.clippingTotal} itens` : 'sem dados',
      trendUp: (kpis?.sentimentoPct ?? 0) >= 50,
      icon: Activity,
      iconTone: 'text-emerald-300',
      cta: 'Ver Clipping',
      onClick: () => navigate('/enterprise/clipping'),
    },
    {
      label: 'Contatos Estratégicos',
      value: kpis ? String(kpis.estrategicos) : '—',
      trend: kpis?.crmTotal ? `${kpis.estrategicosPct}% da base` : 'sem dados',
      trendUp: (kpis?.estrategicos ?? 0) > 0,
      icon: Star,
      iconTone: 'text-amber-300',
      cta: 'Abrir CRM',
      onClick: () => navigate('/enterprise/crm'),
    },
    {
      label: 'Pautas Ativas',
      value: kpis ? String(kpis.pautasAtivas) : '—',
      trend: kpis?.pautasAtivas ? 'no workflow' : 'nenhuma',
      trendUp: true,
      icon: CalendarDays,
      iconTone: 'text-indigo-300',
      cta: 'Ver Workflow',
      onClick: () => navigate('/enterprise/workflow'),
    },
    {
      label: 'Demandas Urgentes',
      value: kpis ? String(kpis.demandasUrgentes) : '—',
      trend: kpis?.demandasUrgentes ? 'requerem ação' : 'tudo ok',
      trendUp: (kpis?.demandasUrgentes ?? 0) === 0,
      icon: AlertTriangle,
      iconTone: (kpis?.demandasUrgentes ?? 0) > 0 ? 'text-rose-300' : 'text-slate-400',
      cta: 'Ver Demandas',
      onClick: () => navigate('/enterprise/influenciadores'),
    },
  ];
}

// ── Main component ─────────────────────────────────────────────────────────────

export function EnterpriseDashboard({ isDarkMode }: { isDarkMode: boolean }) {
  const navigate = useNavigate();
  const tenantService = useTenantService();

  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [workflowItems, setWorkflowItems] = useState<WorkflowItem[]>([]);
  const [urgentDemandas, setUrgentDemandas] = useState<DemandaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState('');

  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      try {
        const [kpisResult, workflowResult, demandasResult] = await Promise.allSettled([
          tenantService.getDashboardKPIs(),
          tenantService.getDashboardWorkflowItems(),
          tenantService.getUrgentDemandas(),
        ]);

        const kpisData = kpisResult.status === 'fulfilled' ? kpisResult.value : null;
        const workflowData =
          workflowResult.status === 'fulfilled'
            ? (workflowResult.value.data as WorkflowItem[])
            : [];
        const demandasData =
          demandasResult.status === 'fulfilled'
            ? (demandasResult.value.data as DemandaItem[])
            : [];

        setKpis(kpisData);
        setWorkflowItems(workflowData);
        setUrgentDemandas(demandasData);
        setAiInsight(generateInsight(kpisData, workflowData, demandasData));
      } finally {
        setIsLoading(false);
      }
    };

    void loadAll();
  }, []);

  const sentimentDonutData = useMemo(() => {
    if (!kpis || kpis.clippingTotal === 0) return null;
    const negativoPct = Math.max(0, Math.round((100 - kpis.sentimentoPct) * 0.33));
    const neutroPct = Math.max(0, 100 - kpis.sentimentoPct - negativoPct);
    return [
      { name: 'Favorável', value: kpis.sentimentoPct, color: '#10b981' },
      { name: 'Neutro', value: neutroPct, color: '#f59e0b' },
      { name: 'Hostil', value: negativoPct, color: '#ef4444' },
    ];
  }, [kpis]);

  const kpiCards = useMemo(() => buildKpiCards(kpis, navigate), [kpis, navigate]);

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section className="flex flex-col gap-8 w-full max-w-7xl mx-auto py-8 text-slate-100">
      {/* ── Header ── */}
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-black tracking-tight text-white"
        >
          Centro de <span className="text-brand-accent">Comando</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.07 }}
          className="text-sm text-slate-400 mt-1 capitalize"
        >
          {today}
        </motion.p>
      </div>

      {/* ── Quick Action Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-4"
      >
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
          Atalhos Rápidos
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.to)}
                className={cn(
                  'group flex flex-col items-start gap-2.5 rounded-2xl border px-4 py-3.5 transition-all text-left',
                  action.accent
                    ? 'border-brand-accent/30 bg-brand-accent/10 hover:bg-brand-accent/20'
                    : 'border-white/10 bg-white/5 hover:bg-white/10',
                )}
              >
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', action.iconBg)}>
                  <Icon className={cn('w-4 h-4', action.iconColor)} />
                </div>
                <div>
                  <p
                    className={cn(
                      'text-sm font-black leading-tight',
                      action.accent ? 'text-white' : 'text-slate-200',
                    )}
                  >
                    {action.label}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{action.hint}</p>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-36 rounded-2xl" />
            ))
          : kpiCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.button
                  key={card.label}
                  type="button"
                  onClick={card.onClick}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-4 text-left hover:border-brand-accent/30 transition-all"
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                      <Icon className={cn('w-5 h-5', card.iconTone)} />
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border',
                        card.trendUp
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20'
                          : 'bg-rose-500/10 text-rose-300 border-rose-400/20',
                      )}
                    >
                      {card.trendUp ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {card.trend}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-white tracking-tight">{card.value}</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.18em] mt-1">
                    {card.label}
                  </p>
                  <p className="mt-3 text-xs text-slate-400 inline-flex items-center gap-1">
                    {card.cta} <ArrowRight className="w-3.5 h-3.5" />
                  </p>
                </motion.button>
              );
            })}
      </div>

      {/* ── Mesa de Trabalho ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow — Pautas em Revisão */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-black text-white">Pautas em Revisão</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
                Workflow — aguardando aprovação
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/enterprise/workflow')}
              className="text-[10px] font-black uppercase tracking-widest text-brand-accent hover:underline"
            >
              Ver Tudo
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <SkeletonBlock key={i} className="h-16" />
              ))}
            </div>
          ) : workflowItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-500">
              <CheckCircle2 className="w-9 h-9" />
              <p className="text-sm font-black">Nenhuma pauta aguardando revisão.</p>
              <button
                type="button"
                onClick={() => navigate('/enterprise/workflow')}
                className="mt-1 text-xs text-brand-accent hover:underline"
              >
                Ir para o Workflow →
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {workflowItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate('/enterprise/workflow')}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-black text-white truncate">{item.titulo}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {item.responsavel && <span>{item.responsavel}</span>}
                      {(item.prazo_texto ?? item.deadline) && (
                        <span className="ml-2 text-amber-400">
                          {item.prazo_texto ?? item.deadline}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge value={item.prioridade} />
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Relacionamento — Demandas Urgentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-black text-white">Demandas Urgentes</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
                Relacionamento — maior prioridade
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/enterprise/influenciadores')}
              className="text-[10px] font-black uppercase tracking-widest text-brand-accent hover:underline"
            >
              Ver Tudo
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <SkeletonBlock key={i} className="h-16" />
              ))}
            </div>
          ) : urgentDemandas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-500">
              <CheckCircle2 className="w-9 h-9" />
              <p className="text-sm font-black">Nenhuma demanda urgente no momento.</p>
              <button
                type="button"
                onClick={() => navigate('/enterprise/influenciadores?action=new')}
                className="mt-1 text-xs text-brand-accent hover:underline"
              >
                Registrar nova demanda →
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {urgentDemandas.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate('/enterprise/influenciadores')}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-black text-white truncate">{item.titulo}</p>
                    {item.secretaria_solicitante && (
                      <p className="text-[10px] text-slate-500 mt-0.5">{item.secretaria_solicitante}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge value={item.prioridade} />
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Termômetro de Sentimento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xl font-black text-white">Termômetro de Sentimento</h3>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mt-1">
                Clipping do mês corrente
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/enterprise/clipping')}
              className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Activity className="w-5 h-5 text-brand-accent" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center py-6 gap-4">
              <SkeletonBlock className="w-52 h-52 rounded-full" />
              <SkeletonBlock className="h-4 w-52" />
            </div>
          ) : !sentimentDonutData ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-500">
              <Newspaper className="w-9 h-9" />
              <p className="text-sm font-black">Nenhum clipping indexado ainda.</p>
              <button
                type="button"
                onClick={() => navigate('/enterprise/clipping')}
                className="mt-1 text-xs text-brand-accent hover:underline"
              >
                Cadastrar primeiro clipping →
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative w-52 h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePie>
                      <Pie
                        data={sentimentDonutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={88}
                        paddingAngle={6}
                        dataKey="value"
                      >
                        {sentimentDonutData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} className="stroke-none" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15,23,42,0.9)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                        formatter={(value: number, name: string) => [`${value}%`, name]}
                      />
                    </RePie>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-white">{kpis?.sentimentoPct ?? 0}%</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                      Favorável
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-5 justify-center flex-wrap">
                {sentimentDonutData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[11px] text-slate-400 font-black">
                      {d.name} {d.value}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* AI Insight */}
          <div className="mt-5 rounded-2xl border border-brand-accent/30 bg-brand-accent/10 px-4 py-3">
            <p className="text-xs font-bold text-slate-300 leading-relaxed flex items-start gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.7)] mt-1 shrink-0" />
              <span>
                <span className="text-brand-accent font-black uppercase tracking-widest mr-2">Insight:</span>
                {isLoading ? (
                  <span className="animate-pulse text-slate-500">Analisando dados em tempo real…</span>
                ) : (
                  aiInsight
                )}
              </span>
            </p>
          </div>
        </motion.div>

        {/* Panorama CRM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xl font-black text-white">Panorama CRM</h3>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mt-1">
                Contatos e influência
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/enterprise/crm')}
              className="text-[10px] font-black uppercase tracking-widest text-brand-accent hover:underline"
            >
              Abrir CRM
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-4 flex-1">
              {[1, 2, 3].map((i) => (
                <SkeletonBlock key={i} className="h-20" />
              ))}
            </div>
          ) : (kpis?.crmTotal ?? 0) === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-2 text-slate-500 py-10">
              <Users className="w-9 h-9" />
              <p className="text-sm font-black">Nenhum contato no CRM ainda.</p>
              <button
                type="button"
                onClick={() => navigate('/enterprise/crm?action=new')}
                className="mt-1 text-xs text-brand-accent hover:underline"
              >
                Adicionar primeiro contato →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <CRMStatCard
                  icon={Users}
                  iconColor="text-cyan-300"
                  value={kpis?.crmTotal ?? 0}
                  label="Total de Contatos"
                  onClick={() => navigate('/enterprise/crm')}
                />
                <CRMStatCard
                  icon={Star}
                  iconColor="text-amber-300"
                  value={kpis?.estrategicos ?? 0}
                  label="Estratégicos"
                  onClick={() => navigate('/enterprise/crm')}
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-black text-slate-300 uppercase tracking-widest">
                    Grau de Influência Alto
                  </p>
                  <span className="text-xl font-black text-amber-300">
                    {kpis?.estrategicosPct ?? 0}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-700"
                    style={{ width: `${Math.min(kpis?.estrategicosPct ?? 0, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">
                  {kpis?.estrategicos} de {kpis?.crmTotal} contatos com alta influência
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/enterprise/crm?action=new')}
                className="mt-auto w-full rounded-2xl border border-brand-accent/20 bg-brand-accent/10 px-4 py-3 text-sm font-black text-white hover:bg-brand-accent/20 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Contato
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <span className="sr-only">Tema atual: {isDarkMode ? 'escuro' : 'claro'}</span>
    </section>
  );
}
