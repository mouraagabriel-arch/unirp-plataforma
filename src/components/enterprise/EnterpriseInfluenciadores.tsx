import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Pencil,
  Grip,
  Handshake,
  MapPinned,
  MessageSquarePlus,
  Plus,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  Users2,
  X,
  ChevronDown,
  Flame,
  Snowflake,
  Heart,
  MessageCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin as MapPinIcon,
  Send,
  Lightbulb,
  Layers,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { useTenantService } from '../../services/useTenantService';
import {
  LIDERANCAS_MOCK,
  getNivelInfluenciaCorStatus,
  getTemperaturaCorStatus,
  getTipoInteracaoLabel,
  type Lideranca,
  type NivelInfluencia,
  type TemperaturaRelacionamento,
  type TipoInteracao,
} from '../../lib/influenciadoresMockApi';
import {
  TICKETS_DEMANDA_MOCK,
  type InteracaoDemanda,
  type PrioridadeDemanda,
  type StatusDemanda,
  type TicketDemandaDesk,
} from '../../lib/demandasMockApi';

type InfluenceLevel = 'Alto' | 'Médio' | 'Baixo';

interface Stakeholder {
  id: string;
  nome: string;
  cargo: string;
  influencia: InfluenceLevel;
  regioes: string[];
  resumo: string;
  prioridade: string;
  canal: string;
  agenda: string;
  timeline: { date: string; event: string }[];
}

const DEMAND_COLUMNS: { key: StatusDemanda; label: string; tone: string }[] = [
  { key: 'triagem', label: 'Triagem', tone: 'text-amber-300' },
  { key: 'producao', label: 'Em Produção', tone: 'text-cyan-300' },
  { key: 'revisao', label: 'Em Revisão', tone: 'text-violet-300' },
  { key: 'entregue', label: 'Entregue', tone: 'text-emerald-300' },
];

const stakeholderInfluenceStyles: Record<InfluenceLevel, string> = {
  Alto: 'bg-rose-500/15 text-rose-200 border-rose-400/30',
  Médio: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
  Baixo: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
};

const demandPriorityStyles: Record<PrioridadeDemanda, string> = {
  Alta: 'bg-rose-500/15 text-rose-200 border-rose-400/30',
  Media: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
  Baixa: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
};

export function EnterpriseInfluenciadores({ isDarkMode }: { isDarkMode: boolean }) {
  const tenantService = useTenantService();
  const [activeTab, setActiveTab] = useState<'stakeholders' | 'demandas'>('stakeholders')
  const [isNewDemandOpen, setIsNewDemandOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState<TicketDemandaDesk | null>(null);
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [demands, setDemands] = useState<TicketDemandaDesk[]>(TICKETS_DEMANDA_MOCK);
  const [isSavingStakeholder, setIsSavingStakeholder] = useState(false);
  const [novaDemandaTitulo, setNovaDemandaTitulo] = useState('');
  const [novaDemandaTipoPeca, setNovaDemandaTipoPeca] = useState('Arte Digital');
  const [novaDemandaPrioridade, setNovaDemandaPrioridade] = useState<PrioridadeDemanda>('Media');
  const [novaDemandaPrazo, setNovaDemandaPrazo] = useState('');
  const [novaDemandaBriefing, setNovaDemandaBriefing] = useState('');
  const [novaDemandaSolicitante, setNovaDemandaSolicitante] = useState('Gabinete Central');
  const [novaDemandaCategoria, setNovaDemandaCategoria] = useState('Institucional');
  const [novaDemandaAnexosTexto, setNovaDemandaAnexosTexto] = useState('');
  const [novoComentarioTicket, setNovoComentarioTicket] = useState('');
  
  // ── NOVOS ESTADOS — ABA LIDERANÇAS ──────────────────────────────────────────
  const [localLiderancas, setLocalLiderancas] = useState<Lideranca[]>(LIDERANCAS_MOCK);
  const [liderancaSelecionada, setLiderancaSelecionada] = useState<Lideranca | null>(null);
  const [isDrawerLiderancaOpen, setIsDrawerLiderancaOpen] = useState(false);
  const [filtroKpiLiderancas, setFiltroKpiLiderancas] = useState<'todos' | 'alta' | 'media' | 'baixa' | 'quente' | 'neutro' | 'frio'>('todos');
  const [novaInteracaoTexto, setNovaInteracaoTexto] = useState('');
  const [localLiderancasComHistorico, setLocalLiderancasComHistorico] = useState<Lideranca[]>(LIDERANCAS_MOCK);
  const [isNovoCadastroModalOpen, setIsNovoCadastroModalOpen] = useState(false);
  const [isEditarPerfilModalOpen, setIsEditarPerfilModalOpen] = useState(false);
  const [novoCadastroNome, setNovoCadastroNome] = useState('');
  const [novoCadastroCargo, setNovoCadastroCargo] = useState('');
  const [novoCadastroZona, setNovoCadastroZona] = useState('');
  const [novoCadastroInfluencia, setNovoCadastroInfluencia] = useState<NivelInfluencia>('Alta');
  const [novoCadastroTemperatura, setNovoCadastroTemperatura] = useState<TemperaturaRelacionamento>('Neutro');
  const [editarCargo, setEditarCargo] = useState('');
  const [editarInfluencia, setEditarInfluencia] = useState<NivelInfluencia>('Alta');
  const [editarTemperatura, setEditarTemperatura] = useState<TemperaturaRelacionamento>('Neutro');

  useEffect(() => {
    const load = async () => {
      const { data, error } = await tenantService
        .from('enterprise_relacionamento')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        alert(`Erro ao carregar: ${error.message}`);
        return;
      }

      const rows = data ?? [];
      setStakeholders(rows.map((row) => ({
        id: row.id,
        nome: row.nome,
        cargo: row.cargo ?? '',
        influencia: (row.influencia ?? 'Médio') as InfluenceLevel,
        regioes: Array.isArray(row.regioes) ? row.regioes : [],
        resumo: row.resumo ?? '',
        prioridade: row.prioridade ?? '',
        canal: row.canal ?? '',
        agenda: row.agenda ?? '',
        timeline: Array.isArray(row.timeline) ? row.timeline : [],
      })));
    };

    void load();
  }, []);

  const [isSavingDemand, setIsSavingDemand] = useState(false);
  const [isRegisteringInteraction, setIsRegisteringInteraction] = useState(false);

  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      setIsNewDemandOpen(true);
    }
  }, [location.search]);

  const handleCreateDemand = async () => {
    if (!novaDemandaTitulo.trim()) {
      toast.error('Informe o título da demanda.');
      return;
    }

    if (!novaDemandaPrazo) {
      toast.error('Informe o prazo final.');
      return;
    }

    if (!novaDemandaBriefing.trim()) {
      toast.error('Preencha o briefing detalhado.');
      return;
    }

    setIsSavingDemand(true);

    const anexos = novaDemandaAnexosTexto
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const novoTicket: TicketDemandaDesk = {
      id: `DM-${Math.floor(100000 + Math.random() * 900000)}`,
      titulo: novaDemandaTitulo.trim(),
      prioridade: novaDemandaPrioridade,
      categoria: novaDemandaCategoria.trim() || 'Institucional',
      tipo_peca: novaDemandaTipoPeca,
      briefing: novaDemandaBriefing.trim(),
      deadline: novaDemandaPrazo,
      status: 'triagem',
      solicitante: novaDemandaSolicitante.trim() || 'Gabinete Central',
      arquivos_anexos: anexos,
      interacoes: [
        {
          id: `int-${Date.now()}`,
          data: new Date().toISOString().split('T')[0],
          autor: 'Gabinete',
          mensagem: 'Ticket aberto e encaminhado para triagem da equipe criativa.',
        },
      ],
    };

    await toast.promise(
      new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), 900);
      }),
      {
        loading: 'Criando solicitação...',
        success: 'Solicitação registrada no Service Desk.',
        error: 'Falha ao criar solicitação.',
      },
    );

    setDemands((prev) => [novoTicket, ...prev]);
    setIsSavingDemand(false);
    setIsNewDemandOpen(false);
    setNovaDemandaTitulo('');
    setNovaDemandaTipoPeca('Arte Digital');
    setNovaDemandaPrioridade('Media');
    setNovaDemandaPrazo('');
    setNovaDemandaBriefing('');
    setNovaDemandaSolicitante('Gabinete Central');
    setNovaDemandaCategoria('Institucional');
    setNovaDemandaAnexosTexto('');
  };

  const handleRegisterInteraction = async () => {
    if (!selectedStakeholder) return;
    setIsRegisteringInteraction(true);
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    const event = `Interacao registrada em ${today}.`;
    const timeline = [...selectedStakeholder.timeline, { date: today, event }];

    const { error } = await tenantService
      .from('enterprise_relacionamento')
      .update({ timeline })
      .eq('id', selectedStakeholder.id);

    if (error) {
      console.error('[Influenciadores] Erro ao registrar interação:', error);
      alert(`Erro ao salvar: ${error.message}`);
      setIsRegisteringInteraction(false);
      return;
    }

    const updatedStakeholder = { ...selectedStakeholder, timeline };
    setStakeholders((prev) => prev.map((item) => item.id === selectedStakeholder.id ? updatedStakeholder : item));
    setSelectedStakeholder(updatedStakeholder);

    setIsRegisteringInteraction(false);
  };

  const handleSaveStakeholderProfile = async () => {
    if (!selectedStakeholder) return;

    setIsSavingStakeholder(true);
    const payload = {
      nome: selectedStakeholder.nome,
      cargo: selectedStakeholder.cargo,
      influencia: selectedStakeholder.influencia,
      regioes: selectedStakeholder.regioes,
      resumo: selectedStakeholder.resumo,
      prioridade: selectedStakeholder.prioridade,
      canal: selectedStakeholder.canal,
      agenda: selectedStakeholder.agenda,
      timeline: selectedStakeholder.timeline,
    };

    const { error } = await tenantService
      .from('enterprise_relacionamento')
      .update(payload)
      .eq('id', selectedStakeholder.id);

    if (error) {
      console.error('[Influenciadores] Erro ao atualizar stakeholder:', error);
      alert(`Erro ao atualizar: ${error.message}`);
      setIsSavingStakeholder(false);
      return;
    }

    setStakeholders((prev) => prev.map((item) => item.id === selectedStakeholder.id ? selectedStakeholder : item));
    setIsSavingStakeholder(false);
  };

  const handleDeleteStakeholder = async (id: string) => {
    const { error } = await tenantService
      .from('enterprise_relacionamento')
      .delete()
      .eq('id', id);

    if (error) {
      alert(`Erro ao excluir: ${error.message}`);
      return;
    }

    setStakeholders((prev) => prev.filter((c) => c.id !== id));
    if (selectedStakeholder?.id === id) {
      setSelectedStakeholder(null);
    }
  };

  const resetNovoCadastroForm = () => {
    setNovoCadastroNome('');
    setNovoCadastroCargo('');
    setNovoCadastroZona('');
    setNovoCadastroInfluencia('Alta');
    setNovoCadastroTemperatura('Neutro');
  };

  const syncLiderancas = (next: Lideranca[]) => {
    setLocalLiderancas(next);
    setLocalLiderancasComHistorico(next);
  };

  const handleCriarLideranca = async () => {
    if (!novoCadastroNome.trim()) {
      toast.error('Informe o nome da liderança.');
      return;
    }

    if (!novoCadastroZona.trim()) {
      toast.error('Informe a zona de atuação.');
      return;
    }

    const hoje = new Date().toISOString().split('T')[0];
    const novaLideranca: Lideranca = {
      id: `lid-${Date.now()}`,
      nome: novoCadastroNome.trim(),
      cargo: novoCadastroCargo.trim() || 'Liderança em cadastro',
      zona_atuacao: novoCadastroZona.trim(),
      influencia: novoCadastroInfluencia,
      temperatura: novoCadastroTemperatura,
      ultimo_contato: hoje,
      historico: [],
    };

    const criada = await toast.promise(
      new Promise<Lideranca>((resolve) => {
        window.setTimeout(() => resolve(novaLideranca), 900);
      }),
      {
        loading: 'Cadastrando liderança...',
        success: 'Liderança adicionada ao CRM.',
        error: 'Não foi possível cadastrar a liderança.',
      },
    );

    syncLiderancas([criada, ...localLiderancasComHistorico]);
    setIsNovoCadastroModalOpen(false);
    resetNovoCadastroForm();
  };

  const handleAbrirEdicaoPerfil = () => {
    if (!liderancaSelecionada) return;
    setEditarCargo(liderancaSelecionada.cargo ?? '');
    setEditarInfluencia(liderancaSelecionada.influencia);
    setEditarTemperatura(liderancaSelecionada.temperatura);
    setIsEditarPerfilModalOpen(true);
  };

  const handleSalvarEdicaoPerfil = async () => {
    if (!liderancaSelecionada) return;

    const atualizada: Lideranca = {
      ...liderancaSelecionada,
      cargo: editarCargo.trim(),
      influencia: editarInfluencia,
      temperatura: editarTemperatura,
    };

    const salva = await toast.promise(
      new Promise<Lideranca>((resolve) => {
        window.setTimeout(() => resolve(atualizada), 700);
      }),
      {
        loading: 'Atualizando perfil...',
        success: 'Perfil atualizado com sucesso.',
        error: 'Não foi possível atualizar o perfil.',
      },
    );

    const next = localLiderancasComHistorico.map((item) => item.id === salva.id ? salva : item);
    syncLiderancas(next);
    setLiderancaSelecionada(salva);
    setIsEditarPerfilModalOpen(false);
  };

  const handleRegistrarInteracaoLideranca = () => {
    if (!liderancaSelecionada || !novaInteracaoTexto.trim()) return;

    const data = new Date().toISOString().split('T')[0];
    const novaInteracao = {
      id: `int-${Date.now()}`,
      data,
      resumo: novaInteracaoTexto.trim(),
      tipo: 'outro' as TipoInteracao,
      responsavel: 'Você',
    };

    const next = localLiderancasComHistorico.map((item) => {
      if (item.id !== liderancaSelecionada.id) return item;
      return {
        ...item,
        ultimo_contato: data,
        historico: [novaInteracao, ...item.historico],
      };
    });

    syncLiderancas(next);
    setLiderancaSelecionada(next.find((item) => item.id === liderancaSelecionada.id) ?? liderancaSelecionada);
    setNovaInteracaoTexto('');
    toast.success('Interação registrada na ficha viva.');
  };

  const formatarData = (dataIso: string) => {
    if (!dataIso) return 'Sem prazo';
    return new Date(`${dataIso}T00:00:00`).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const moverTicket = (ticketId: string, direcao: 'avancar' | 'voltar') => {
    const ordem: StatusDemanda[] = ['triagem', 'producao', 'revisao', 'entregue'];
    const next = demands.map((ticket) => {
      if (ticket.id !== ticketId) return ticket;
      const indexAtual = ordem.indexOf(ticket.status);
      const novoIndex = direcao === 'avancar' ? indexAtual + 1 : indexAtual - 1;
      if (novoIndex < 0 || novoIndex >= ordem.length) return ticket;
      return { ...ticket, status: ordem[novoIndex] };
    });

    setDemands(next);
    if (selectedDemand) {
      const atualizado = next.find((item) => item.id === selectedDemand.id) ?? selectedDemand;
      setSelectedDemand(atualizado);
    }
  };

  const adicionarComentarioTicket = () => {
    if (!selectedDemand || !novoComentarioTicket.trim()) return;

    const novaInteracao: InteracaoDemanda = {
      id: `int-${Date.now()}`,
      data: new Date().toISOString().split('T')[0],
      autor: 'Comunicação',
      mensagem: novoComentarioTicket.trim(),
    };

    const next = demands.map((ticket) => {
      if (ticket.id !== selectedDemand.id) return ticket;
      return { ...ticket, interacoes: [novaInteracao, ...ticket.interacoes] };
    });

    setDemands(next);
    setSelectedDemand(next.find((item) => item.id === selectedDemand.id) ?? selectedDemand);
    setNovoComentarioTicket('');
    toast.success('Comentário adicionado na trilha da demanda.');
  };

  const baixarArquivoFinal = (arquivo: string) => {
    toast.success(`Download iniciado: ${arquivo}`);
  };

  const demandasEmCurso = demands.filter((ticket) => ticket.status !== 'entregue').length;
  const entregasNaSemana = demands.filter((ticket) => ticket.status === 'entregue').length;

  return (
    <section className={cn('flex flex-col gap-6 w-full max-w-7xl mx-auto py-8 text-slate-100', isDarkMode ? 'text-slate-100' : 'text-slate-900')}>
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.1),transparent_30%)] pointer-events-none" />
        <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 text-[11px] font-black uppercase tracking-[0.25em] text-brand-accent">
              <Sparkles className="w-4 h-4" />
              Relacionamento & Demandas
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mt-4">
              CRM Político + <span className="text-brand-accent">Service Desk</span>
            </h1>
            <p className="text-slate-400 font-medium mt-3 max-w-3xl">
              Profundidade operacional para relacionamento com lideranças e gestão de entregas internas em uma mesma superfície premium de trabalho.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-full xl:min-w-[480px] xl:max-w-[520px]">
            {[
              { label: 'Stakeholders mapeados', value: localLiderancasComHistorico.length.toString(), tone: 'text-cyan-300' },
              { label: 'Demandas em curso', value: demandasEmCurso.toString(), tone: 'text-amber-300' },
              { label: 'Entregas na semana', value: entregasNaSemana.toString(), tone: 'text-emerald-300' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                <p className={cn('text-2xl font-black mt-2', item.tone)}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-black text-white">Fluxos reais de relacionamento e atendimento interno</h2>
          <p className="text-slate-500 font-medium mt-2">Cards clicáveis abrem contexto histórico e ações operacionais sem quebrar a navegação.</p>
        </div>

        <div className="flex flex-wrap gap-2 p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl w-fit">
          {[
            { id: 'stakeholders', label: '🤝 Lideranças & Stakeholders' },
            { id: 'demandas', label: '🗂️ Demandas Internas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'stakeholders' | 'demandas')}
              className={cn(
                'flex items-center gap-3 px-5 py-3 rounded-2xl font-bold transition-all',
                activeTab === tab.id
                  ? 'bg-brand-accent text-white shadow-[0_0_24px_rgba(99,102,241,0.35)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'stakeholders' && (
          <motion.div
            key="stakeholders"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Base de relacionamento</p>
                <h3 className="text-2xl font-black text-white mt-2">Lideranças ativas do território</h3>
                <p className="text-sm text-slate-400 mt-2">Cadastre novas lideranças e mantenha influência, temperatura e histórico em atualização contínua.</p>
              </div>

              <button
                type="button"
                onClick={() => setIsNovoCadastroModalOpen(true)}
                className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-brand-accent text-white font-bold hover:bg-brand-accent/90 transition-all shadow-[0_10px_30px_rgba(99,102,241,0.35)]"
              >
                <Plus className="w-5 h-5" />
                Adicionar Liderança
              </button>
            </div>

            {/* ── KPIs Clicáveis ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Todos', value: localLiderancas.length.toString(), icon: Users2, id: 'todos' },
                { label: 'Influência Alta', value: localLiderancasComHistorico.filter((l) => l.influencia === 'Alta').length.toString(), icon: Flame, id: 'alta', color: 'text-rose-400' },
                { label: 'Relacionamento Quente', value: localLiderancasComHistorico.filter((l) => l.temperatura === 'Quente').length.toString(), icon: Heart, id: 'quente', color: 'text-orange-400' },
                { label: 'Pendentes de Contato', value: localLiderancasComHistorico.filter((l) => l.temperatura === 'Frio').length.toString(), icon: Snowflake, id: 'frio', color: 'text-blue-400' },
              ].map((kpi) => (
                <button
                  key={kpi.id}
                  onClick={() => setFiltroKpiLiderancas(kpi.id as any)}
                  className={cn(
                    'rounded-2xl border p-4 transition-all cursor-pointer',
                    filtroKpiLiderancas === kpi.id
                      ? 'border-brand-accent bg-brand-accent/15 ring-2 ring-brand-accent/30'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8',
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{kpi.label}</p>
                      <p className={cn('text-2xl font-black mt-1', kpi.color || 'text-brand-accent')}>{kpi.value}</p>
                    </div>
                    <kpi.icon className={cn('w-5 h-5', kpi.color || 'text-slate-600')} />
                  </div>
                </button>
              ))}
            </div>

            {/* ── Alert: Leitura Recomendada ── */}
            <div className="rounded-2xl border border-brand-accent/30 bg-brand-accent/10 p-5 flex gap-4 items-start">
              <div className="shrink-0 mt-0.5">
                <Lightbulb className="w-5 h-5 text-brand-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-white mb-1">💡 Leitura Recomendada (Insights da IA)</p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  🎯 <strong>Prioridade Imediata:</strong> Priorizar contato com Padre João Benedito (Zona Oeste) — temperatura "Frio" e último contato há 31 dias. 
                  Sugerir encontro presencial ou ligação de follow-up para manter relacionamento.
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  <strong>Também recomendado:</strong> Agenda de almoço com Roberto Costa (ACSP) para solidificar agenda 2026. Relacionamento "Quente" e alta influência.
                </p>
              </div>
            </div>

            {/* ── Grid de Cards de Lideranças ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {(() => {
                let filtered = localLiderancasComHistorico;
                if (filtroKpiLiderancas === 'alta') filtered = filtered.filter((l) => l.influencia === 'Alta');
                if (filtroKpiLiderancas === 'media') filtered = filtered.filter((l) => l.influencia === 'Média');
                if (filtroKpiLiderancas === 'baixa') filtered = filtered.filter((l) => l.influencia === 'Baixa');
                if (filtroKpiLiderancas === 'quente') filtered = filtered.filter((l) => l.temperatura === 'Quente');
                if (filtroKpiLiderancas === 'neutro') filtered = filtered.filter((l) => l.temperatura === 'Neutro');
                if (filtroKpiLiderancas === 'frio') filtered = filtered.filter((l) => l.temperatura === 'Frio');

                return filtered.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-dashed border-white/10 p-12 text-center">
                    <Users2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-bold">Nenhuma liderança encontrada com este filtro.</p>
                  </div>
                ) : (
                  filtered.map((lideranca) => {
                    const cfgInfluencia = getNivelInfluenciaCorStatus(lideranca.influencia);
                    const cfgTemperatura = getTemperaturaCorStatus(lideranca.temperatura);
                    const diasDesdeContato = Math.floor(
                      (new Date().getTime() - new Date(lideranca.ultimo_contato + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <motion.button
                        key={lideranca.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => {
                          setLiderancaSelecionada(lideranca);
                          setIsDrawerLiderancaOpen(true);
                        }}
                        className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 hover:border-brand-accent/30 hover:bg-slate-900/80 transition-all cursor-pointer text-left"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-black text-white">{lideranca.nome}</h3>
                            {lideranca.cargo && <p className="text-xs text-slate-400 mt-1">{lideranca.cargo}</p>}
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <span className={cn('px-2 py-1 rounded-full text-[10px] font-black border flex items-center gap-1', cfgInfluencia.bg, cfgInfluencia.border, cfgInfluencia.text)}>
                              <span className={cn('w-1.5 h-1.5 rounded-full', cfgInfluencia.dot)} />
                              {lideranca.influencia}
                            </span>
                            <span className={cn('px-2 py-1 rounded-full text-[10px] font-black border flex items-center gap-1', cfgTemperatura.bg, cfgTemperatura.border, cfgTemperatura.text)}>
                              <span className={cn('w-1.5 h-1.5 rounded-full', cfgTemperatura.dot)} />
                              {lideranca.temperatura}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs text-slate-400 mb-4">
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="w-3.5 h-3.5 text-slate-600" />
                            {lideranca.zona_atuacao}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock3 className="w-3.5 h-3.5 text-slate-600" />
                            Último contato há {diasDesdeContato} dias
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-brand-accent text-xs font-bold hover:gap-3 transition-all">
                          <MessageCircle className="w-3.5 h-3.5" />
                          Ver ficha completa
                          <ChevronDown className="w-3 h-3 rotate-90" />
                        </div>
                      </motion.button>
                    );
                  })
                );
              })()}
            </div>
          </motion.div>
        )}

        {activeTab === 'demandas' && (
          <motion.div
            key="demandas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-black text-white">Helpdesk Criativo Interno</h3>
                  <p className="text-sm text-slate-400 mt-2">Solicitações viram tickets clicáveis com briefing, prazo e trilha clara até a entrega.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewDemandOpen(true)}
                  className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-brand-accent text-white font-bold hover:bg-brand-accent/90 transition-all shadow-[0_10px_30px_rgba(99,102,241,0.35)] w-fit"
                >
                  <Plus className="w-5 h-5" />
                  Nova Solicitação
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
              {DEMAND_COLUMNS.map((column) => (
                <div key={column.key} className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className={cn('text-base font-black', column.tone)}>{column.label}</h4>
                      <p className="text-[10px] uppercase tracking-[0.22em] font-black text-slate-500 mt-1">
                        {demands.filter((demand) => demand.status === column.key).length} tickets
                      </p>
                    </div>
                    <Grip className="w-4 h-4 text-slate-500" />
                  </div>

                  <div className="space-y-3">
                    {demands.filter((demand) => demand.status === column.key).map((demand) => (
                      <div
                        key={demand.id}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 hover:border-brand-accent/20 transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedDemand(demand)}
                          className="w-full text-left"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{demand.id}</p>
                              <h5 className="text-sm font-black text-white mt-2 leading-snug">{demand.titulo}</h5>
                            </div>
                            <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.16em] border', demandPriorityStyles[demand.prioridade])}>
                              {demand.prioridade}
                            </span>
                          </div>

                          <div className="space-y-2 mt-4 text-xs text-slate-300">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-slate-500" />
                              {demand.solicitante}
                            </div>
                            <div className="flex items-center gap-2">
                              <Layers className="w-4 h-4 text-slate-500" />
                              {demand.categoria}
                            </div>
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-slate-500" />
                              {demand.tipo_peca}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock3 className="w-4 h-4 text-slate-500" />
                              Prazo: {formatarData(demand.deadline)}
                            </div>
                          </div>
                        </button>

                        <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => moverTicket(demand.id, 'voltar')}
                            disabled={demand.status === 'triagem'}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-slate-300 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Voltar
                          </button>

                          <button
                            type="button"
                            onClick={() => moverTicket(demand.id, 'avancar')}
                            disabled={demand.status === 'entregue'}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-brand-accent/30 bg-brand-accent/10 text-xs font-bold text-brand-accent hover:bg-brand-accent/20 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Avançar
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNovoCadastroModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNovoCadastroModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 18 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
            >
              <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-slate-900/95 backdrop-blur-2xl p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Nova liderança</p>
                    <h3 className="text-3xl font-black text-white mt-3">Adicionar liderança ao CRM</h3>
                    <div className="mt-4 rounded-2xl border border-brand-accent/25 bg-brand-accent/10 px-4 py-3">
                      <p className="text-sm text-slate-200">As lideranças cadastradas aqui são automaticamente vinculadas à base central de contatos do órgão.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNovoCadastroModalOpen(false)}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                  >
                    <X className="w-5 h-5 text-slate-300" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-3 md:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Nome</span>
                    <input
                      type="text"
                      value={novoCadastroNome}
                      onChange={(event) => setNovoCadastroNome(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white font-bold outline-none"
                      placeholder="Ex.: Maria Souza"
                    />
                  </label>

                  <label className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Cargo / Papel</span>
                    <input
                      type="text"
                      value={novoCadastroCargo}
                      onChange={(event) => setNovoCadastroCargo(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white font-bold outline-none"
                      placeholder="Ex.: Presidente de Associação"
                    />
                  </label>

                  <label className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Zona de Atuação</span>
                    <input
                      type="text"
                      value={novoCadastroZona}
                      onChange={(event) => setNovoCadastroZona(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white font-bold outline-none"
                      placeholder="Ex.: Zona Norte"
                    />
                  </label>

                  <label className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Influência</span>
                    <select
                      value={novoCadastroInfluencia}
                      onChange={(event) => setNovoCadastroInfluencia(event.target.value as NivelInfluencia)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white font-bold outline-none"
                    >
                      <option value="Alta">Alta</option>
                      <option value="Média">Média</option>
                      <option value="Baixa">Baixa</option>
                    </select>
                  </label>

                  <label className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Temperatura</span>
                    <select
                      value={novoCadastroTemperatura}
                      onChange={(event) => setNovoCadastroTemperatura(event.target.value as TemperaturaRelacionamento)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white font-bold outline-none"
                    >
                      <option value="Quente">Quente</option>
                      <option value="Neutro">Neutro</option>
                      <option value="Frio">Frio</option>
                    </select>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => void handleCriarLideranca()}
                    className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-brand-accent text-white font-bold hover:bg-brand-accent/90 transition-all shadow-[0_10px_30px_rgba(99,102,241,0.35)]"
                  >
                    <Plus className="w-5 h-5" />
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNovoCadastroModalOpen(false)}
                    className="px-6 py-4 rounded-2xl border border-white/10 bg-white/5 text-slate-200 font-bold hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDrawerLiderancaOpen && liderancaSelecionada && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerLiderancaOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-[440px] bg-slate-950 border-l border-white/10 z-50 flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 shrink-0">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Ficha viva</p>
                    <h2 className="text-2xl font-black text-white mt-2">{liderancaSelecionada.nome}</h2>
                    {liderancaSelecionada.cargo && <p className="text-sm text-slate-400 mt-2">{liderancaSelecionada.cargo}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAbrirEdicaoPerfil}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-200 text-xs font-bold hover:bg-white/10 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar Perfil
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDrawerLiderancaOpen(false)}
                      className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.18em] border border-white/10 bg-white/5 text-slate-300">
                    {liderancaSelecionada.cargo || 'Sem papel informado'}
                  </span>
                  <span className={cn('inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.18em] border', getNivelInfluenciaCorStatus(liderancaSelecionada.influencia).bg, getNivelInfluenciaCorStatus(liderancaSelecionada.influencia).text, getNivelInfluenciaCorStatus(liderancaSelecionada.influencia).border)}>
                    Influência {liderancaSelecionada.influencia}
                  </span>
                  <span className={cn('inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.18em] border', getTemperaturaCorStatus(liderancaSelecionada.temperatura).bg, getTemperaturaCorStatus(liderancaSelecionada.temperatura).text, getTemperaturaCorStatus(liderancaSelecionada.temperatura).border)}>
                    {liderancaSelecionada.temperatura}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Território e contato</p>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <MapPinIcon className="w-4 h-4 text-slate-500" />
                    {liderancaSelecionada.zona_atuacao}
                  </div>
                  {liderancaSelecionada.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Mail className="w-4 h-4 text-slate-500" />
                      {liderancaSelecionada.email}
                    </div>
                  )}
                  {liderancaSelecionada.telefone && (
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Phone className="w-4 h-4 text-slate-500" />
                      {liderancaSelecionada.telefone}
                    </div>
                  )}
                  {liderancaSelecionada.endereco && (
                    <div className="flex items-start gap-2 text-sm text-slate-300">
                      <MapPinned className="w-4 h-4 text-slate-500 mt-0.5" />
                      <span>{liderancaSelecionada.endereco}</span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-4">Histórico de interações</p>
                  <div className="space-y-3">
                    {liderancaSelecionada.historico.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
                        Nenhuma interação registrada ainda.
                      </div>
                    ) : (
                      liderancaSelecionada.historico.map((interacao, index) => (
                        <div key={interacao.id} className="flex gap-3 relative">
                          {index !== liderancaSelecionada.historico.length - 1 && (
                            <div className="absolute left-3.5 top-9 bottom-0 w-px bg-white/10" />
                          )}
                          <div className="w-7 h-7 rounded-full bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center shrink-0 mt-1 relative z-10">
                            <div className="w-2.5 h-2.5 rounded-full bg-brand-accent" />
                          </div>
                          <div className="flex-1 rounded-2xl bg-white/5 border border-white/10 p-4">
                            <p className="text-sm font-bold text-white">{interacao.resumo}</p>
                            <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 uppercase tracking-[0.18em] font-black">
                              <span>{getTipoInteracaoLabel(interacao.tipo)}</span>
                              <span>•</span>
                              <span>{new Date(interacao.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                            </div>
                            {interacao.responsavel && <p className="text-[11px] text-slate-400 mt-2">Por {interacao.responsavel}</p>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 shrink-0 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Registrar interação</p>
                <textarea
                  value={novaInteracaoTexto}
                  onChange={(event) => setNovaInteracaoTexto(event.target.value)}
                  placeholder="Ex.: Ligação de follow-up sobre pauta territorial e agenda de reunião."
                  className="w-full h-24 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-accent/50 resize-none"
                />
                <button
                  type="button"
                  onClick={handleRegistrarInteracaoLideranca}
                  disabled={!novaInteracaoTexto.trim()}
                  className="w-full px-4 py-3 rounded-2xl bg-brand-accent text-white font-black text-sm hover:bg-brand-accent/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Registrar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditarPerfilModalOpen && liderancaSelecionada && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditarPerfilModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-6"
            >
              <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-slate-900/95 backdrop-blur-2xl p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Editar perfil</p>
                    <h3 className="text-2xl font-black text-white mt-3">Atualizar sinais do relacionamento</h3>
                    <p className="text-sm text-slate-400 mt-2">Ajuste cargo, influência e temperatura sem sair da ficha viva.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditarPerfilModalOpen(false)}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                  >
                    <X className="w-5 h-5 text-slate-300" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <label className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Cargo / Papel</span>
                    <input
                      type="text"
                      value={editarCargo}
                      onChange={(event) => setEditarCargo(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white font-bold outline-none"
                    />
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Influência</span>
                      <select
                        value={editarInfluencia}
                        onChange={(event) => setEditarInfluencia(event.target.value as NivelInfluencia)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white font-bold outline-none"
                      >
                        <option value="Alta">Alta</option>
                        <option value="Média">Média</option>
                        <option value="Baixa">Baixa</option>
                      </select>
                    </label>

                    <label className="space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Temperatura</span>
                      <select
                        value={editarTemperatura}
                        onChange={(event) => setEditarTemperatura(event.target.value as TemperaturaRelacionamento)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white font-bold outline-none"
                      >
                        <option value="Quente">Quente</option>
                        <option value="Neutro">Neutro</option>
                        <option value="Frio">Frio</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => void handleSalvarEdicaoPerfil()}
                    className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-brand-accent text-white font-bold hover:bg-brand-accent/90 transition-all shadow-[0_10px_30px_rgba(99,102,241,0.35)]"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Salvar alterações
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditarPerfilModalOpen(false)}
                    className="px-6 py-4 rounded-2xl border border-white/10 bg-white/5 text-slate-200 font-bold hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNewDemandOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewDemandOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
            >
              <div className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-slate-900/95 backdrop-blur-2xl p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Nova solicitação</p>
                    <h3 className="text-3xl font-black text-white mt-3">Briefing da Demanda</h3>
                    <p className="text-sm text-slate-400 mt-2">Cadastre contexto, prioridade e referências para manter rastreabilidade total no Service Desk.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNewDemandOpen(false)}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                  >
                    <X className="w-5 h-5 text-slate-300" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-3 md:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Título da Demanda</span>
                    <input
                      type="text"
                      value={novaDemandaTitulo}
                      onChange={(event) => setNovaDemandaTitulo(event.target.value)}
                      placeholder="Ex.: Campanha digital para mutirão de saúde"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold text-slate-100 outline-none"
                    />
                  </label>

                  <label className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tipo de Entrega</span>
                    <select
                      value={novaDemandaTipoPeca}
                      onChange={(event) => setNovaDemandaTipoPeca(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold text-slate-100 outline-none"
                    >
                      <option>Release</option>
                      <option>Arte Digital</option>
                      <option>Banner</option>
                      <option>Vídeo</option>
                    </select>
                  </label>

                  <label className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Prioridade</span>
                    <select
                      value={novaDemandaPrioridade}
                      onChange={(event) => setNovaDemandaPrioridade(event.target.value as PrioridadeDemanda)}
                      className={cn('w-full rounded-2xl border px-5 py-4 font-bold outline-none', demandPriorityStyles[novaDemandaPrioridade], 'border-white/10 bg-white/5')}
                    >
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baixa">Baixa</option>
                    </select>
                  </label>

                  <label className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Prazo Final</span>
                    <input
                      type="date"
                      value={novaDemandaPrazo}
                      onChange={(event) => setNovaDemandaPrazo(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold text-slate-100 outline-none"
                    />
                  </label>

                  <label className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Solicitante</span>
                    <input
                      type="text"
                      value={novaDemandaSolicitante}
                      onChange={(event) => setNovaDemandaSolicitante(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold text-slate-100 outline-none"
                    />
                  </label>

                  <label className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Categoria</span>
                    <input
                      type="text"
                      value={novaDemandaCategoria}
                      onChange={(event) => setNovaDemandaCategoria(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold text-slate-100 outline-none"
                    />
                  </label>

                  <label className="space-y-3 md:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Briefing Detalhado</span>
                    <textarea
                      value={novaDemandaBriefing}
                      onChange={(event) => setNovaDemandaBriefing(event.target.value)}
                      className="w-full min-h-[170px] rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-medium text-slate-100 outline-none resize-none"
                      placeholder="Objetivo, público, mensagem-chave, canais, tom de voz, validações e deadline operacional."
                    />
                  </label>

                  <div className="md:col-span-2 rounded-[1.75rem] border border-dashed border-white/20 bg-white/5 p-6">
                    <div className="flex flex-col items-center justify-center text-center min-h-[180px]">
                      <div className="w-14 h-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center mb-4">
                        <Upload className="w-6 h-6 text-brand-accent" />
                      </div>
                      <h4 className="text-lg font-black text-white">Anexos de Referência</h4>
                      <p className="text-sm text-slate-400 mt-2 max-w-md">Informe os nomes dos arquivos separados por vírgula para registrar materiais de apoio no ticket.</p>
                      <input
                        type="text"
                        value={novaDemandaAnexosTexto}
                        onChange={(event) => setNovaDemandaAnexosTexto(event.target.value)}
                        placeholder="Ex.: pauta.pdf, referencia_visual.png, roteiro.docx"
                        className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-white/10">
                  <button onClick={handleCreateDemand} disabled={isSavingDemand} className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-brand-accent text-white font-bold hover:bg-brand-accent/90 transition-all shadow-[0_10px_30px_rgba(99,102,241,0.35)]">
                    <Plus className="w-5 h-5" />
                    {isSavingDemand ? 'Salvando...' : 'Criar Solicitação'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewDemandOpen(false)}
                    className="px-6 py-4 rounded-2xl border border-white/10 bg-white/5 text-slate-200 font-bold hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDemand && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDemand(null)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl p-6 overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Trilha da demanda</p>
                  <h3 className="text-2xl font-black text-white mt-3">{selectedDemand.titulo}</h3>
                  <p className="text-sm text-slate-400 mt-2">{selectedDemand.id} • {selectedDemand.solicitante}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDemand(null)}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                >
                  <X className="w-5 h-5 text-slate-300" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">Tipo</p>
                  <p className="text-sm font-bold text-white mt-2">{selectedDemand.tipo_peca}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">Prazo</p>
                  <p className="text-sm font-bold text-white mt-2">{formatarData(selectedDemand.deadline)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">Categoria</p>
                  <p className="text-sm font-bold text-white mt-2">{selectedDemand.categoria}</p>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <UserRound className="w-5 h-5 text-cyan-300" />
                  <h4 className="text-lg font-black text-white">Briefing Completo</h4>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{selectedDemand.briefing}</p>

                {selectedDemand.arquivos_anexos.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Anexos de referência</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDemand.arquivos_anexos.map((arquivo) => (
                        <span key={arquivo} className="px-3 py-2 rounded-xl border border-white/10 bg-slate-950/60 text-[11px] text-slate-300">
                          {arquivo}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageCircle className="w-5 h-5 text-amber-300" />
                  <h4 className="text-lg font-black text-white">Interações / Comentários</h4>
                </div>

                <div className="space-y-3 mb-4">
                  {selectedDemand.interacoes.map((item, index) => (
                    <div key={item.id} className="relative pl-7">
                      {index !== selectedDemand.interacoes.length - 1 && (
                        <div className="absolute left-[11px] top-7 bottom-[-16px] w-px bg-white/10" />
                      )}
                      <span className="absolute left-0 top-1.5 w-[10px] h-[10px] rounded-full bg-brand-accent" />
                      <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{item.autor} • {formatarData(item.data)}</p>
                        <p className="text-sm text-slate-300 mt-2">{item.mensagem}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  <textarea
                    value={novoComentarioTicket}
                    onChange={(event) => setNovoComentarioTicket(event.target.value)}
                    placeholder="Adicionar comentário da trilha entre Gabinete e Comunicação..."
                    className="w-full min-h-[96px] rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 outline-none resize-none"
                  />
                  <button
                    type="button"
                    onClick={adicionarComentarioTicket}
                    disabled={!novoComentarioTicket.trim()}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-brand-accent text-white font-bold hover:bg-brand-accent/90 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Registrar comentário
                  </button>
                </div>
              </div>

              {selectedDemand.status === 'entregue' && selectedDemand.arquivo_final && (
                <div className="rounded-[1.75rem] border border-emerald-400/30 bg-emerald-500/10 p-5 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-300 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-lg font-black text-white">Arquivo Finalizado</h4>
                      <p className="text-sm text-emerald-100/80 mt-2">Material aprovado e disponibilizado para download.</p>
                      <button
                        type="button"
                        onClick={() => baixarArquivoFinal(selectedDemand.arquivo_final as string)}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 transition-all"
                      >
                        <Upload className="w-4 h-4" />
                        Baixar {selectedDemand.arquivo_final}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedDemand(null)}
                className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-white/5 text-slate-200 font-bold hover:bg-white/10 transition-all"
              >
                Fechar Trilha
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
