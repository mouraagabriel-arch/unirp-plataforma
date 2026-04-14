import { useEffect, useState, type FormEvent } from 'react';
import {
  BarChart3, TrendingUp, AlertCircle,
  Users, Activity, MapPin,
  MessageSquare, Calendar, ChevronRight,
  ArrowUpRight, ArrowDownRight, Zap,
  ThumbsUp, ThumbsDown, Landmark, CheckCircle2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePie, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useTenantService } from '../../services/useTenantService';
import { useTerminologia } from '../../hooks/useTerminologia';

const APPROVAL_DATA = [
  { name: 'Aprovação', value: 72, color: '#10b981' },
  { name: 'Reprovação', value: 18, color: '#ef4444' },
  { name: 'Indecisos', value: 10, color: '#f59e0b' },
];

const DEMANDS_BY_NEIGHBORHOOD = [
  { neighborhood: 'Centro', count: 145, color: '#3b82f6' },
  { neighborhood: 'Jardim Sul', count: 98, color: '#10b981' },
  { neighborhood: 'Vila Nova', count: 76, color: '#f59e0b' },
  { neighborhood: 'Bairro Alto', count: 54, color: '#ef4444' },
  { neighborhood: 'Distrito Industrial', count: 32, color: '#6366f1' },
];

const POPULARITY_HISTORY = [
  { month: 'Out', approval: 62 },
  { month: 'Nov', approval: 65 },
  { month: 'Dez', approval: 61 },
  { month: 'Jan', approval: 68 },
  { month: 'Fev', approval: 70 },
  { month: 'Mar', approval: 72 },
];

const MANDATE_TOOLS = [
  { label: 'Monitoramento em Tempo Real', icon: TrendingUp, route: '/gabinete/clipping' },
  { label: 'Ouvidoria', icon: MessageSquare, route: '/gabinete/inbox' },
  { label: 'Interação com Base Local', icon: Users, route: '/gabinete/cidadaos' },
  { label: 'Análise de Propostas', icon: BarChart3, route: '/gabinete/ideologia' },
  { label: 'Análise de Emendas Parlamentares', icon: MapPin, route: '/gabinete/transparencia' },
  { label: 'Plano de Ação', icon: Calendar, route: '/gabinete/planejamento' },
  { label: 'Geração de Releases', icon: Zap, route: '/gabinete/hub' },
  { label: 'Relatórios e Transparência', icon: Activity, route: '/gabinete/transparencia' },
  { label: 'Publicação Automática', icon: ArrowUpRight, route: '/gabinete/hub' },
];

const INITIAL_PENDING_APPROVALS = [
  { id: 1, title: 'Parecer Jurídico - Lei nº 432', status: 'Aguardando' },
  { id: 2, title: 'Orçamento 2024 - Saúde', status: 'Em Análise' },
  { id: 3, title: 'Autorização Contratação', status: 'Pendente' },
];

const URGENT_ALERTS = [
  {
    id: 1,
    title: 'Taxa de Lixo',
    severity: 'Crítica',
    time: 'Votação amanhã',
    details: 'Risco alto de repercussão negativa. Necessário preparar posicionamento e alinhar base antes da votação.',
  },
  {
    id: 2,
    title: 'Manifestação Anunciada',
    severity: 'Alta',
    time: 'Próximo sábado',
    details: 'Evento com previsão de presença expressiva em frente à Câmara. Recomendado plano de contingência e equipe de resposta.',
  },
  {
    id: 3,
    title: 'Queda de Aprovação Regional',
    severity: 'Média',
    time: 'Últimas 48h',
    details: 'Variação de sentimento em bairros-chave. Priorizar visitas locais, comunicado público e reforço de entregas.',
  },
];

export function GabineteDashboard({ isDarkMode }: { isDarkMode: boolean }) {
  const navigate = useNavigate();
  const tenantService = useTenantService();
  const { termo } = useTerminologia();
  const termoPlural = termo('cidadaos');
  const [showNewReleaseModal, setShowNewReleaseModal] = useState(false);
  const [showNewCitizenModal, setShowNewCitizenModal] = useState(false);
  const [showNewPautaModal, setShowNewPautaModal] = useState(false);
  const [isSavingRelease, setIsSavingRelease] = useState(false);
  const [isSavingCitizen, setIsSavingCitizen] = useState(false);
  const [isSavingPauta, setIsSavingPauta] = useState(false);
  const [releaseForm, setReleaseForm] = useState({ title: '', content: '', date: '' });
  const [citizenForm, setCitizenForm] = useState({ name: '', neighborhood: '', contact: '' });
  const [pautaForm, setPautaForm] = useState({ title: '', description: '', date: '' });
  const [pendingApprovals, setPendingApprovals] = useState(INITIAL_PENDING_APPROVALS);
  const [selectedAlert, setSelectedAlert] = useState<(typeof URGENT_ALERTS)[number] | null>(null);
  const [topBairros, setTopBairros] = useState<Array<{ bairro: string; total: number }>>([]);

  useEffect(() => {
    const loadHeatmap = async () => {
      const { data, error } = await tenantService.getDemandasHeatByBairro(5);
      if (error) {
        console.error('[GabineteDashboard] Erro ao carregar mapa de calor:', error);
        return;
      }
      setTopBairros(data ?? []);
    };

    void loadHeatmap();
  }, [tenantService]);

  const handleCreateRelease = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingRelease(true);

    const { error } = await tenantService.from('gabinete_hub_conteudos').insert({
      titulo: releaseForm.title,
      conteudo: releaseForm.content,
      data: releaseForm.date,
    });

    setIsSavingRelease(false);

    if (error) {
      alert(`Erro ao salvar release: ${error.message}`);
      return;
    }

    setReleaseForm({ title: '', content: '', date: '' });
    setShowNewReleaseModal(false);
    alert('Release criado com sucesso!');
  };

  const handleCreateCitizen = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingCitizen(true);

    const { error } = await tenantService.from('gabinete_cidadaos').insert({
      nome: citizenForm.name,
      bairro: citizenForm.neighborhood,
      contato: citizenForm.contact,
    });

    setIsSavingCitizen(false);

    if (error) {
      alert(`Erro ao salvar ${termo('cidadao').toLowerCase()}: ${error.message}`);
      return;
    }

    setCitizenForm({ name: '', neighborhood: '', contact: '' });
    setShowNewCitizenModal(false);
    alert(`${termo('cidadao')} adicionado com sucesso!`);
  };

  const handleCreatePauta = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingPauta(true);

    const { error } = await tenantService.from('gabinete_workflow_tarefas').insert({
      titulo: pautaForm.title,
      descricao: pautaForm.description,
      data: pautaForm.date,
    });

    setIsSavingPauta(false);

    if (error) {
      alert(`Erro ao salvar pauta: ${error.message}`);
      return;
    }

    setPautaForm({ title: '', description: '', date: '' });
    setShowNewPautaModal(false);
    alert('Pauta criada com sucesso!');
  };

  const handleApprovalAction = (id: number, action: 'Aprovar' | 'Rejeitar') => {
    setPendingApprovals((current) => current.filter((item) => item.id !== id));
    alert(`Item ${action.toLowerCase()} com sucesso.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6 overflow-x-hidden">
      {/* Cabeçalho Superior com Título e Atalhos Rápidos */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <h1 className="text-2xl font-bold text-white">Estação de Comando - Gabinete</h1>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setShowNewReleaseModal(true)} className="bg-brand-accent text-white px-4 py-2 text-sm rounded-lg hover:bg-brand-accent/90 transition-all shadow-sm">
            Novo Release
          </button>
          <button onClick={() => setShowNewCitizenModal(true)} className="bg-brand-accent text-white px-4 py-2 text-sm rounded-lg hover:bg-brand-accent/90 transition-all shadow-sm">
            Adicionar {termo('cidadao')}
          </button>
          <button onClick={() => setShowNewPautaModal(true)} className="bg-brand-accent text-white px-4 py-2 text-sm rounded-lg hover:bg-brand-accent/90 transition-all shadow-sm">
            Nova Pauta
          </button>
        </div>
      </div>

      {/* Lâmina de Tempo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            label: 'Dias para a Eleição',
            value: '192 dias',
            progress: 62,
            tone: 'from-brand-accent/50 to-cyan-400/50',
          },
          {
            label: '% do Mandato Concluído',
            value: '70%',
            progress: 70,
            tone: 'from-brand-emerald/50 to-emerald-300/50',
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-lg rounded-2xl p-5"
          >
            <div className="flex items-end justify-between gap-3 mb-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400 font-bold">{item.label}</p>
              <p className="text-2xl font-black text-white">{item.value}</p>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800/80 overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.progress}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className={cn('h-full rounded-full bg-gradient-to-r', item.tone)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Grade de Métricas 4 Colunas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: `Base de ${termoPlural}`, value: '18.4K', desc: `${termoPlural} mapeados` },
          { label: 'Demandas Totais', value: '1.2K', desc: 'Taxa de resolução 85%' },
          { label: 'Presença Digital', value: '45.2K', desc: 'Alcance orgânico' },
          { label: 'Saldo Político', value: 'Positivo', desc: 'Relação com base' },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-slate-900/60 border border-slate-700/50 backdrop-blur-md shadow-lg rounded-xl p-5 transition-all hover:shadow-2xl"
          >
            <p className="text-sm text-slate-300 mb-2">{stat.label}</p>
            <p className="text-2xl font-bold text-white mb-3">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Lâmina de Radar Social */}
      <div className="bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-lg rounded-2xl p-5 md:p-6">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-lg md:text-xl font-bold text-white">Radar Social • Os Ouvidos do Mandato</h2>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400 font-bold">Leitura contínua das últimas 24h</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 md:p-5">
            <h3 className="text-sm font-bold text-slate-100 mb-4">Termos em Alta (24h)</h3>
            <div className="flex flex-wrap items-end gap-x-3 gap-y-2 leading-tight">
              <span className="text-3xl font-black text-rose-400">Impostos</span>
              <span className="text-2xl font-extrabold text-emerald-400">Educação</span>
              <span className="text-xl font-bold text-slate-200">Prefeito</span>
              <span className="text-lg font-bold text-cyan-300">Transporte</span>
              <span className="text-base font-semibold text-amber-300">Saúde</span>
              <span className="text-sm font-semibold text-slate-400">Orçamento</span>
              <span className="text-lg font-bold text-violet-300">Segurança</span>
              <span className="text-sm font-semibold text-slate-500">Bairros</span>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 md:p-5">
            <h3 className="text-sm font-bold text-slate-100 mb-4">Radar de Sentimento</h3>
            <div className="space-y-4">
              {[
                { label: 'Menções Positivas', value: 65, bar: 'bg-brand-emerald' },
                { label: 'Menções Neutras', value: 20, bar: 'bg-slate-400' },
                { label: 'Negativas / Risco', value: 15, bar: 'bg-brand-rose' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-slate-200 font-semibold">{item.label}</p>
                    <span className="text-white font-black">{item.value}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-900/80 overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 0.7, delay: 0.1 + idx * 0.08 }}
                      className={cn('h-full rounded-full', item.bar)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ferramentas do Mandato */}
      <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-md shadow-lg rounded-xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Ferramentas do Mandato</h2>
          <p className="text-xs text-slate-300">Centro de operações avançado</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {MANDATE_TOOLS.map((tool, idx) => (
            <button
              key={idx}
              onClick={() => navigate(tool.route)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-left text-slate-200 hover:text-white hover:bg-slate-800 transition-all duration-200"
              type="button"
            >
              <tool.icon className="w-4 h-4" />
              <span className="text-xs font-medium leading-tight">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid inferior 2/3 + 1/3 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Card principal do calendário com gráficos e mapa */}
        <div className="xl:col-span-2 bg-slate-900/60 border border-slate-700/50 backdrop-blur-md shadow-lg rounded-xl p-6 transition-all hover:shadow-2xl space-y-5">
          <h2 className="text-xl font-bold text-white">Calendário Editorial & Atividades Recentes</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 bg-slate-800/70 p-4 border border-slate-700/50 rounded-lg">
              <h3 className="text-sm font-semibold text-slate-100">Próximos Eventos</h3>
              {[
                { date: 'Seg 31', title: 'Reunião com Base' },
                { date: 'Ter 01', title: 'Release de Infraestrutura' },
                { date: 'Qua 02', title: 'Votação Crucial' },
              ].map((event, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/30 border border-slate-700/50">
                  <Calendar className="w-4 h-4 text-cyan-300 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-300">{event.date}</p>
                    <p className="text-sm text-white font-semibold">{event.title}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 bg-slate-800/70 p-4 border border-slate-700/50 rounded-lg">
              <h3 className="text-sm font-semibold text-slate-100">Atividades Recentes</h3>
              {[
                { user: 'Sistema IA', action: 'Gerou análise de sentimento', time: '2h atrás' },
                { user: 'Assessor PM', action: 'Criou novo release', time: '4h atrás' },
                { user: `${termo('cidadao')} (App)`, action: 'Submeteu demanda urgente', time: '6h atrás' },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/30 border border-slate-700/50">
                  <Users className="w-4 h-4 text-slate-300 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-300 font-medium">{activity.user}</p>
                    <p className="text-sm text-white">{activity.action}</p>
                    <p className="text-xs text-slate-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/70 border border-slate-700/50 rounded-lg p-4">
              <h3 className="text-sm font-bold text-slate-100 mb-3">Histórico de Popularidade</h3>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={POPULARITY_HISTORY} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApproval" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12, fill: '#cbd5e1' }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12, fill: '#cbd5e1' }} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} />
                    <Area type="monotone" dataKey="approval" stroke="#0ea5e9" fill="url(#colorApproval)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/50 rounded-lg p-4">
              <h3 className="text-sm font-bold text-slate-100 mb-3">Mapa de Demandas</h3>
              <div className="h-44 rounded-lg overflow-hidden border border-slate-700/50">
                <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-slate-200 p-3">
                  <div className="space-y-2">
                    {topBairros.length === 0 && (
                      <p className="text-xs text-slate-400">Sem demandas por bairro para o tenant ativo.</p>
                    )}
                    {topBairros.map((item, idx) => {
                      const max = topBairros[0]?.total || 1;
                      const width = Math.max(10, Math.round((item.total / max) * 100));
                      return (
                        <div key={`${item.bairro}-${idx}`}>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3 text-cyan-300" />{item.bairro}</span>
                            <span className="font-black text-white">{item.total}</span>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-slate-700">
                            <div className="h-full rounded-full bg-cyan-400" style={{ width: `${width}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card lateral de alertas e aprovações */}
        <div className="space-y-5">
          <div className="bg-slate-900/60 border border-slate-700/50 backdrop-blur-md shadow-lg rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              Alertas Urgentes
            </h2>
            <div className="space-y-3">
              {URGENT_ALERTS.map((alert) => (
                <button
                  key={alert.id}
                  type="button"
                  onClick={() => setSelectedAlert(alert)}
                  className="w-full p-3 bg-slate-800/70 border border-slate-700/50 rounded-lg text-left"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-sm font-bold text-white">{alert.title}</p>
                      <p className="text-xs text-slate-300 mt-1">{alert.time}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                      alert.severity === 'Crítica' ? 'bg-rose-100 text-rose-700' :
                      alert.severity === 'Alta' ? 'bg-amber-100 text-amber-700' :
                      'bg-cyan-100 text-cyan-700'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => alert('Filtros aplicados! Atualizando dashboard...')} className="w-full mt-4 bg-brand-accent text-white px-4 py-2 text-sm rounded-lg hover:bg-brand-accent/90 transition-all">
              Aplicar
            </button>
          </div>

          <div className="bg-slate-900/60 border border-slate-700/50 backdrop-blur-md shadow-lg rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Aprovações Pendentes
            </h2>
            <div className="space-y-3">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="p-3 bg-slate-800/70 border border-slate-700/50 rounded-lg flex justify-between items-start gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">{approval.title}</p>
                    <p className="text-xs text-slate-300 mt-1">{approval.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprovalAction(approval.id, 'Aprovar')}
                      className="px-2 py-1 text-[11px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprovalAction(approval.id, 'Rejeitar')}
                      className="px-2 py-1 text-[11px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    >
                      Rejeitar
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/gabinete/planejamento')} className="w-full mt-4 bg-brand-accent text-white px-4 py-2 text-sm rounded-lg hover:bg-brand-accent/90 transition-all">
              Revisar Todas
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showNewReleaseModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowNewReleaseModal(false)}>
            <motion.form initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} onSubmit={handleCreateRelease} className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-lg font-bold text-white">Novo Release</h3>
              <input required value={releaseForm.title} onChange={(e) => setReleaseForm((c) => ({ ...c, title: e.target.value }))} placeholder="Título" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
              <textarea required value={releaseForm.content} onChange={(e) => setReleaseForm((c) => ({ ...c, content: e.target.value }))} placeholder="Conteúdo" rows={5} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
              <input required type="date" value={releaseForm.date} onChange={(e) => setReleaseForm((c) => ({ ...c, date: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowNewReleaseModal(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-white">Cancelar</button>
                <button type="submit" disabled={isSavingRelease} className="px-4 py-2 rounded-lg bg-brand-accent text-white disabled:opacity-70">{isSavingRelease ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewCitizenModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowNewCitizenModal(false)}>
            <motion.form initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} onSubmit={handleCreateCitizen} className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-lg font-bold text-white">Adicionar {termo('cidadao')}</h3>
              <input required value={citizenForm.name} onChange={(e) => setCitizenForm((c) => ({ ...c, name: e.target.value }))} placeholder="Nome" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
              <input required value={citizenForm.neighborhood} onChange={(e) => setCitizenForm((c) => ({ ...c, neighborhood: e.target.value }))} placeholder="Bairro" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
              <input required value={citizenForm.contact} onChange={(e) => setCitizenForm((c) => ({ ...c, contact: e.target.value }))} placeholder="Contato" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowNewCitizenModal(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-white">Cancelar</button>
                <button type="submit" disabled={isSavingCitizen} className="px-4 py-2 rounded-lg bg-brand-accent text-white disabled:opacity-70">{isSavingCitizen ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewPautaModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowNewPautaModal(false)}>
            <motion.form initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} onSubmit={handleCreatePauta} className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-lg font-bold text-white">Nova Pauta</h3>
              <input required value={pautaForm.title} onChange={(e) => setPautaForm((c) => ({ ...c, title: e.target.value }))} placeholder="Título" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
              <textarea required value={pautaForm.description} onChange={(e) => setPautaForm((c) => ({ ...c, description: e.target.value }))} placeholder="Descrição" rows={4} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
              <input required type="date" value={pautaForm.date} onChange={(e) => setPautaForm((c) => ({ ...c, date: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowNewPautaModal(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-white">Cancelar</button>
                <button type="submit" disabled={isSavingPauta} className="px-4 py-2 rounded-lg bg-brand-accent text-white disabled:opacity-70">{isSavingPauta ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSelectedAlert(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-2xl p-5 space-y-3">
              <h3 className="text-lg font-bold text-white">{selectedAlert.title}</h3>
              <p className="text-sm text-slate-300">Severidade: {selectedAlert.severity}</p>
              <p className="text-sm text-slate-300">Prazo: {selectedAlert.time}</p>
              <p className="text-sm text-slate-200 leading-relaxed">{selectedAlert.details}</p>
              <div className="flex justify-end">
                <button type="button" onClick={() => setSelectedAlert(null)} className="px-4 py-2 rounded-lg bg-brand-accent text-white">Fechar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GabineteDashboard;
