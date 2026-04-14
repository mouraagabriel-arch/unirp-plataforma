import { useMemo, useState } from 'react';
import {
  AtSign,
  Bold,
  Calendar,
  Copy,
  Download,
  Facebook,
  FileText,
  Filter,
  Image as ImageIcon,
  Instagram,
  Italic,
  Layout,
  Link2,
  Loader2,
  Mail,
  MessageSquare,
  MoreVertical,
  Newspaper,
  Paperclip,
  Play,
  Plus,
  Search,
  Send,
  Share2,
  Sparkles,
  Twitter,
  UploadCloud,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { handleCopyToClipboard, handleDownload, handleOpenWhatsapp } from '../../lib/buttonHandlers';

// ─── DADOS (INVARIANTES) ─────────────────────────────────────────────────────
const MOCK_POSTS = [
  { id: '1', title: 'Visita à Obra da Vila Nova', platform: 'Instagram', date: '25 Mar, 10:00', status: 'Agendado' },
  { id: '2', title: 'Posicionamento sobre IPTU', platform: 'Twitter', date: '25 Mar, 14:00', status: 'Rascunho' },
  { id: '3', title: 'Live: Prestação de Contas', platform: 'Facebook', date: '26 Mar, 19:00', status: 'Agendado' },
];

const IMPACT_TRENDS = {
  '7d': [24, 36, 42, 40, 58, 68, 82],
  '30d': [18, 28, 34, 31, 48, 52, 64, 58, 70, 74],
  '90d': [12, 18, 26, 30, 38, 42, 48, 52, 60, 66, 72, 79],
} as const;

const TOP_CONTENTS = [
  { id: '1', title: 'Reels da obra da Vila Nova', engagement: '12.8%', reach: '84 mil', platform: 'Instagram' },
  { id: '2', title: 'Thread sobre reajuste do IPTU', engagement: '9.6%', reach: '51 mil', platform: 'Twitter' },
  { id: '3', title: 'Live de prestação de contas', engagement: '8.9%', reach: '37 mil', platform: 'Facebook' },
];

const PLATFORM_OPTIONS = [
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-400' },
  { id: 'tiktok', label: 'TikTok', icon: Video, color: 'text-brand-accent' },
  { id: 'informativo', label: 'Informativo', icon: FileText, color: 'text-brand-emerald' },
] as const;

const RECIPIENT_OPTIONS = [
  { id: 'jornalistas', label: 'Todos os Jornalistas', icon: Newspaper, count: '248 contatos' },
  { id: 'liderancas', label: 'Lideranças de Bairro', icon: Users, count: '87 contatos' },
  { id: 'base', label: 'Base Total', icon: AtSign, count: '3.420 contatos' },
];

// ─── TIPOS ───────────────────────────────────────────────────────────────────
type ActiveTab = 'generator' | 'calendar' | 'history';
type DateRange = keyof typeof IMPACT_TRENDS;
type HubMode = 'social' | 'imprensa';

interface GeneratedContent {
  script: string;
  caption: string;
  hashtags: string;
  suggestion: string;
}

// ─── COMPONENTE ──────────────────────────────────────────────────────────────
export function GabineteHub({ isDarkMode }: { isDarkMode: boolean }) {
  // ── estado novo para toasts e modais ──
  const [toastMessage, setToastMessage] = useState<{text: string; type: 'success' | 'error'} | null>(null);
  const [isNewContentOpen, setIsNewContentOpen] = useState(false);
  const [isToneMenuOpen, setIsToneMenuOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // ── estado existente (preservado) ──
  const [activeTab, setActiveTab] = useState<ActiveTab>('generator');
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [briefing, setBriefing] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'tiktok']);
  const [selectedMedia, setSelectedMedia] = useState('Vídeo curto');

  // ── estado novo ──
  const [hubMode, setHubMode] = useState<HubMode>('social');
  const [recipients, setRecipients] = useState<string[]>(['jornalistas']);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Toast auto-hide
  if (toastMessage) {
    setTimeout(() => setToastMessage(null), 3000);
  }

  // ── lógica existente (preservada) ──
  const trendData = IMPACT_TRENDS[dateRange];
  const maxTrendValue = Math.max(...trendData);
  const chartPoints = trendData
    .map((value, index) => {
      const x = (index / Math.max(trendData.length - 1, 1)) * 100;
      const y = 100 - (value / maxTrendValue) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  const scheduledPosts = useMemo(
    () => MOCK_POSTS.filter((post) => post.status === 'Agendado').length,
    []
  );

  const impactMetrics = [
    { label: 'Alcance Total', value: '284 mil', detail: '+18% na semana', accent: 'text-cyan-300' },
    { label: 'Engajamento Médio', value: '8.7%', detail: 'Acima do benchmark', accent: 'text-brand-emerald' },
    { label: 'Melhor Plataforma', value: 'Instagram', detail: '62% do tráfego orgânico', accent: 'text-pink-400' },
    { label: 'Postagens Agendadas', value: `${scheduledPosts}`, detail: 'Pipeline pronto para 72h', accent: 'text-brand-accent' },
  ];

  const activeTabMeta = {
    generator: {
      title: 'Modo Criação',
      description: 'IA focada em roteiros, legendas e assets para novas narrativas.',
    },
    calendar: {
      title: 'Modo Orquestração',
      description: 'Leitura rápida da cadência de posts e próximos disparos.',
    },
    history: {
      title: 'Modo Aprendizado',
      description: 'Ajustes com base no histórico de peças e desempenho passado.',
    },
  } satisfies Record<ActiveTab, { title: string; description: string }>;

  const generateContent = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const normalizedBriefing = briefing.trim() || 'a visita à obra da Vila Nova';
      setContent({
        script: `Olá pessoal! Hoje estou aqui para mostrar de perto ${normalizedBriefing}. É fundamental transformar cada pauta em resultado concreto para a população. Seguimos trabalhando com presença, fiscalização e entrega real.`,
        caption: `Trabalho que transforma. Estamos acompanhando ${normalizedBriefing} com transparência, presença em campo e compromisso com quem mais precisa. #MandatoEmAção #Resultado #Cidade`,
        hashtags: '#politica #vereador #trabalho #comunidade',
        suggestion: `Priorize ${selectedMedia.toLowerCase()} com cortes rápidos, abertura em até 3 segundos e fechamento com chamada para compartilhamento nas plataformas selecionadas.`,
      });
      setIsGenerating(false);
    }, 2500);
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((current) =>
      current.includes(platformId)
        ? current.filter((id) => id !== platformId)
        : [...current, platformId]
    );
  };

  // ── nova lógica ──
  const toggleRecipient = (id: string) => {
    setRecipients((current) =>
      current.includes(id) ? current.filter((r) => r !== id) : [...current, id]
    );
  };

  const sendEmail = () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      setToastMessage({text: '❌ Preencha assunto e corpo do email', type: 'error'});
      return;
    }
    
    setIsSendingEmail(true);
    
    // Simular envio (em produção, integrar com Supabase)
    setTimeout(() => {
      setIsSendingEmail(false);
      setToastMessage({
        text: `✅ Email enviado para ${totalRecipients} destinatários!`,
        type: 'success'
      });
      setEmailSubject('');
      setEmailBody('');
    }, 2500);
  };

  const transformToPost = () => {
    if (!content?.caption) {
      setToastMessage({text: '❌ Nenhum conteúdo para transformar', type: 'error'});
      return;
    }
    
    setIsTransforming(true);
    
    // Simular transformação e otimização para redes sociais
    setTimeout(() => {
      setIsTransforming(false);
      setToastMessage({
        text: '✅ Release transformado em 3 posts otimizados!',
        type: 'success'
      });
      // Em produção: abrir modal com posts otimizados para cada plataforma
    }, 2000);
  };

  const totalRecipients = recipients.reduce((acc, rid) => {
    const opt = RECIPIENT_OPTIONS.find((o) => o.id === rid);
    if (!opt) return acc;
    return acc + parseInt(opt.count.replace(/\D/g, ''), 10);
  }, 0);

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-8 px-4 overflow-x-hidden pb-20">

      {/* ══ CABEÇALHO GLOBAL + HUB MODE SWITCHER ══ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
      >
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6 mb-8">
          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl md:text-4xl font-black tracking-tight text-white"
            >
              Hub de{' '}
              <span className="text-brand-accent drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                Distribuição
              </span>
            </motion.h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl">
              Super Hub de Distribuição Integrada — gerencie Redes Sociais e Disparos de E-mail/Imprensa em um único painel estratégico.
            </p>
          </div>

          <button onClick={() => setIsNewContentOpen(true)} className="flex items-center gap-3 px-5 py-3 bg-brand-accent text-white rounded-2xl font-bold hover:bg-brand-accent/90 transition-all shadow-[0_10px_30px_rgba(139,92,246,0.3)] self-start xl:self-center whitespace-nowrap">
            <Plus className="w-4 h-4" />
            Novo Conteúdo
          </button>
        </div>

        {/* ── HUB MODE SWITCHER ── */}
        <div className="flex flex-wrap gap-3 p-2 rounded-[1.5rem] bg-white/5 border border-white/10 w-full">
          {[
            { id: 'social' as HubMode, label: 'Redes Sociais', emoji: '📱' },
            { id: 'imprensa' as HubMode, label: 'Disparo & Imprensa', emoji: '📰' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setHubMode(tab.id)}
              className={cn(
                'relative flex items-center gap-3 px-6 py-4 rounded-[1.2rem] font-black text-base transition-all duration-300 flex-1 justify-center',
                hubMode === tab.id
                  ? 'bg-brand-accent text-white shadow-[0_0_25px_rgba(139,92,246,0.35)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <span className="text-lg">{tab.emoji}</span>
              {tab.label}
              {hubMode === tab.id && (
                <motion.div
                  layoutId="hubModeIndicator"
                  className="absolute inset-0 bg-brand-accent rounded-[1.2rem] -z-10"
                />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════
          ABA: REDES SOCIAIS
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {hubMode === 'social' && (
          <motion.div
            key="social"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-6"
          >
            {/* sub-tabs generator/calendar/history */}
            <div className="flex flex-wrap gap-3 p-2 rounded-[1.5rem] bg-white/5 border border-white/10 w-fit">
              {[
                { id: 'generator', label: 'Gerador IA', icon: Sparkles },
                { id: 'calendar', label: 'Calendário', icon: Calendar },
                { id: 'history', label: 'Histórico', icon: Layout },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3 rounded-[1.2rem] font-black text-sm transition-all duration-300 relative',
                    activeTab === tab.id
                      ? 'bg-brand-accent text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabHub"
                      className="absolute inset-0 bg-brand-accent rounded-[1.2rem] -z-10"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* ─ LÂMINA 1: Métricas ─ */}
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-black text-white">Performance de Impacto</h2>
                  <p className="text-sm text-slate-400 font-medium">{activeTabMeta[activeTab].description}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-accent">{activeTabMeta[activeTab].title}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {impactMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-5 relative overflow-hidden"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 mb-3">{metric.label}</p>
                    <div className={cn('text-3xl font-black tracking-tight mb-1 drop-shadow-[0_0_14px_rgba(255,255,255,0.08)]', metric.accent)}>
                      {metric.value}
                    </div>
                    <p className="text-sm font-medium text-slate-400">{metric.detail}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* ─ LÂMINA 2: Tendência de Impacto ─ */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white">Tendência de Impacto</h2>
                  <p className="text-slate-400 font-medium">Alcance x tempo com leitura visual rápida para cadência editorial.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(['7d', '30d', '90d'] as DateRange[]).map((range) => (
                    <button
                      key={range}
                      onClick={() => setDateRange(range)}
                      className={cn(
                        'px-4 py-2 rounded-full border text-xs font-black uppercase tracking-[0.24em] transition-all',
                        dateRange === range
                          ? 'bg-brand-accent text-white border-brand-accent shadow-[0_0_20px_rgba(139,92,246,0.25)]'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
                      )}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[1.75rem] p-5 md:p-6">
                <div className="flex items-end justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-accent">Performance Simulada</p>
                    <p className="text-xl font-black text-white">Alcance orgânico em aceleração</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-500">Pico recente</p>
                    <p className="text-2xl font-black text-white">{maxTrendValue}k</p>
                  </div>
                </div>
                <div className="relative h-72 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] overflow-hidden">
                  <div className="absolute inset-0 grid grid-rows-4">
                    {[0, 1, 2, 3].map((line) => (
                      <div key={line} className="border-b border-white/5" />
                    ))}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 top-0 flex items-end gap-2 px-4 pb-5">
                    {trendData.map((value, index) => (
                      <div key={`${dateRange}-${index}`} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
                        <div
                          className="w-full rounded-t-[1rem] bg-gradient-to-t from-brand-accent/80 via-cyan-400/60 to-cyan-300/25 shadow-[0_0_18px_rgba(56,189,248,0.2)]"
                          style={{ height: `${Math.max((value / maxTrendValue) * 85, 14)}%` }}
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{index + 1}</span>
                      </div>
                    ))}
                  </div>
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full pointer-events-none">
                    <defs>
                      <linearGradient id="hubTrendStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(56,189,248,0.45)" />
                        <stop offset="100%" stopColor="rgba(139,92,246,0.9)" />
                      </linearGradient>
                    </defs>
                    <polyline
                      fill="none"
                      stroke="url(#hubTrendStroke)"
                      strokeWidth="1.6"
                      points={chartPoints}
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
              </div>
            </motion.section>

            {/* ─ LÂMINA 3: Publicações Agendadas + Nova Publicação ─ */}
            <section className="grid grid-cols-1 xl:grid-cols-[0.88fr_1.12fr] gap-6 items-start">
              {/* Lado esquerdo: Agendadas */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  'bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]',
                  activeTab === 'calendar' && 'border-brand-accent/30 shadow-[0_0_30px_rgba(139,92,246,0.12)]'
                )}
              >
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-white">Publicações Agendadas</h2>
                    <p className="text-sm text-slate-400 font-medium">Agenda compacta para execução social.</p>
                  </div>
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
                <div className="flex gap-3 mb-5">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Buscar post..."
                      className="w-full pl-11 pr-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white text-sm font-medium outline-none focus:border-brand-accent/50 transition-all"
                    />
                  </div>
                  <button onClick={() => setToastMessage({text: 'Filtro de publicacoes aplicado.', type: 'success'})} className="px-4 bg-white/5 rounded-xl text-slate-400 hover:text-brand-accent border border-white/10 hover:bg-white/10 transition-all">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {MOCK_POSTS.map((post) => (
                    <motion.div
                      key={post.id}
                      whileHover={{ x: 4 }}
                      className="p-4 rounded-[1.5rem] border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                            {post.platform === 'Instagram' ? (
                              <Instagram className="w-4 h-4 text-pink-500" />
                            ) : post.platform === 'Twitter' ? (
                              <Twitter className="w-4 h-4 text-blue-400" />
                            ) : (
                              <Facebook className="w-4 h-4 text-brand-accent" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.24em] mb-1">{post.platform}</p>
                            <p className="font-black text-sm text-white group-hover:text-brand-accent transition-all leading-tight truncate">{post.title}</p>
                          </div>
                        </div>
                        <button onClick={() => setIsToneMenuOpen(!isToneMenuOpen)} className="p-2 text-slate-500 hover:text-white transition-colors shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{post.date}</span>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full shadow-[0_0_8px]',
                              post.status === 'Agendado'
                                ? 'bg-brand-emerald shadow-brand-emerald/50'
                                : 'bg-amber-400 shadow-amber-400/50'
                            )}
                          />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{post.status}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <button onClick={() => setIsCalendarOpen(true)} className="w-full mt-5 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                  Ver Calendário Completo
                  <Share2 className="w-4 h-4" />
                </button>
              </motion.div>

              {/* Lado direito: Nova Publicação */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  'bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden',
                  activeTab === 'generator' && 'border-brand-accent/30 shadow-[0_0_30px_rgba(139,92,246,0.12)]'
                )}
              >
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-white">Nova Publicação</h2>
                    <p className="text-sm text-slate-400 font-medium">Conteúdo, mídia, plataformas e geração estratégica no mesmo fluxo.</p>
                  </div>
                  <div className="rounded-2xl border border-brand-accent/20 bg-brand-accent/10 px-4 py-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-accent">Pipeline Editorial</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-4 mb-4">
                  <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-brand-accent/10 text-brand-accent rounded-2xl flex items-center justify-center border border-brand-accent/20">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white tracking-tight">O que vamos gravar hoje?</h3>
                        <p className="text-sm text-slate-500 font-medium">Descreva o evento ou a pauta do conteúdo.</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.24em]">Briefing do Conteúdo</label>
                      <textarea
                        value={briefing}
                        onChange={(event) => setBriefing(event.target.value)}
                        placeholder="Ex: Visita à obra da creche no bairro São José, mostrando os avanços..."
                        className="w-full min-h-[120px] p-5 rounded-[1.25rem] font-medium leading-relaxed resize-none border border-white/10 bg-slate-900/60 backdrop-blur-xl focus:border-brand-accent/50 transition-all outline-none text-white placeholder:text-slate-700"
                      />
                    </div>

                    {/* DRAG & DROP UPLOAD */}
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.24em] block mb-2">Upload de Mídia (Vídeo / Imagens)</label>
                      <div
                        onDragEnter={() => setIsDragging(true)}
                        onDragLeave={() => setIsDragging(false)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
                        className={cn(
                          'flex flex-col items-center justify-center gap-3 rounded-[1.25rem] border-2 border-dashed py-6 px-4 transition-all cursor-pointer',
                          isDragging
                            ? 'border-brand-accent bg-brand-accent/10 shadow-[0_0_24px_rgba(139,92,246,0.2)]'
                            : 'border-white/10 bg-white/5 hover:border-brand-accent/40 hover:bg-white/10'
                        )}
                      >
                        <UploadCloud className={cn('w-8 h-8 transition-all', isDragging ? 'text-brand-accent' : 'text-slate-500')} />
                        <div className="text-center">
                          <p className="text-sm font-black text-white">Arraste arquivos aqui</p>
                          <p className="text-xs text-slate-500 mt-1">MP4, MOV, JPG, PNG — até 512 MB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setToastMessage({text: 'Upload manual aberto.', type: 'success'})}
                          className="px-4 py-2 text-xs font-black bg-white/10 border border-white/10 rounded-lg text-slate-300 hover:bg-white/20 transition-all"
                        >
                          Escolher Arquivo
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-5 space-y-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.24em]">Mídias</p>
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          { label: 'Vídeo curto', icon: Play },
                          { label: 'Carrossel', icon: ImageIcon },
                          { label: 'Manifesto PDF', icon: FileText },
                        ].map((media) => (
                          <button
                            key={media.label}
                            type="button"
                            onClick={() => setSelectedMedia(media.label)}
                            className={cn(
                              'flex items-center gap-3 p-4 rounded-xl border transition-all text-left',
                              selectedMedia === media.label
                                ? 'bg-brand-accent/15 border-brand-accent/30 text-white'
                                : 'bg-slate-900/60 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                            )}
                          >
                            <media.icon className="w-4 h-4" />
                            <span className="text-sm font-black tracking-tight">{media.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-5 mb-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.24em]">Seleção de Plataformas</p>
                      <p className="text-sm font-medium text-slate-400">Distribua a mesma narrativa em formatos complementares.</p>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                      <span>{selectedPlatforms.length} canais ativos</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {PLATFORM_OPTIONS.map((platform) => (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => togglePlatform(platform.id)}
                        className={cn(
                          'p-4 rounded-[1.25rem] border flex items-center gap-3 transition-all group',
                          selectedPlatforms.includes(platform.id)
                            ? 'bg-brand-accent/15 border-brand-accent/30 text-white shadow-[0_0_20px_rgba(139,92,246,0.12)]'
                            : 'bg-slate-900/60 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                        )}
                      >
                        <platform.icon className={cn('w-5 h-5 transition-transform group-hover:scale-110', platform.color)} />
                        <span className="text-sm font-black tracking-tight">{platform.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <button
                    onClick={generateContent}
                    className="flex-1 py-4 bg-brand-accent text-white rounded-xl font-black text-base hover:bg-brand-accent/90 transition-all shadow-[0_10px_30px_rgba(139,92,246,0.3)] flex items-center justify-center gap-3 group"
                  >
                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Gerar Roteiro e Legendas
                  </button>
                  <button onClick={() => setToastMessage({text: 'Postagem adicionada ao calendario.', type: 'success'})} className="sm:min-w-[220px] py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black text-base hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                    <Calendar className="w-4 h-4" />
                    Agendar Postagem
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {!content && !isGenerating ? (
                    <motion.div
                      key="input"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      className="bg-white/5 border border-white/10 rounded-[1.75rem] p-6 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-accent/5 blur-[80px] -mr-24 -mt-24 pointer-events-none" />
                      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-brand-accent/10 text-brand-accent rounded-2xl flex items-center justify-center border border-brand-accent/20">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-white tracking-tight">Prévia estratégica</h3>
                            <p className="text-sm text-slate-400 font-medium">Ao gerar, o Hub retorna roteiro, legenda, hashtags e dica de produção.</p>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Formato selecionado</p>
                          <p className="text-sm font-black text-white">{selectedMedia}</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : isGenerating ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-white/5 border border-brand-accent/20 rounded-[1.75rem] p-10 flex flex-col items-center justify-center text-center min-h-[280px]"
                    >
                      <div className="w-20 h-20 bg-brand-accent/20 rounded-[1.5rem] flex items-center justify-center border border-brand-accent/30 animate-pulse shadow-[0_0_30px_rgba(139,92,246,0.2)] mb-6">
                        <Loader2 className="w-10 h-10 text-brand-accent animate-spin" />
                      </div>
                      <h3 className="text-xl font-black text-white tracking-tight mb-3">IA Criativa em Ação</h3>
                      <p className="text-slate-400 text-base font-medium max-w-xl">Estruturando roteiro persuasivo, legendas de alto engajamento e recomendação de formato para as redes sociais.</p>
                    </motion.div>
                  ) : content ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      className="space-y-4"
                    >
                      <div className="bg-white/5 border border-white/10 rounded-[1.75rem] p-6 space-y-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-accent/5 blur-[100px] -mr-36 -mt-36 pointer-events-none" />
                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 bg-brand-accent/10 text-brand-accent rounded-2xl flex items-center justify-center border border-brand-accent/20">
                              <Sparkles className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-white tracking-tight">Conteúdo Estratégico</h3>
                          </div>
                          <div className="flex gap-3">
                            <button onClick={async () => {
                              const result = await handleCopyToClipboard(content?.caption || "Conteúdo");
                              setToastMessage({text: result.message, type: result.success ? 'success' : 'error'});
                            }} className="p-3 bg-white/5 text-slate-400 hover:text-brand-accent rounded-xl transition-all border border-white/10 hover:bg-white/10">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button onClick={() => {
                              const result = handleDownload(content?.caption || '', `conteudo_${Date.now()}.txt`);
                              setToastMessage({text: result.message, type: result.success ? 'success' : 'error'});
                            }} className="p-3 bg-white/5 text-slate-400 hover:text-brand-accent rounded-xl transition-all border border-white/10 hover:bg-white/10">
                              <Download className="w-4 h-4" />
                            </button>
                            <button onClick={() => {
                              const result = handleOpenWhatsapp(content?.caption || "Conteúdo estratégico");
                              setToastMessage({text: result.message, type: result.success ? 'success' : 'error'});
                            }} className="p-3 bg-white/5 text-slate-400 hover:text-brand-accent rounded-xl transition-all border border-white/10 hover:bg-white/10">
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 relative z-10">
                          <div className="p-5 bg-slate-900/60 rounded-[1.5rem] border border-white/10 space-y-4 hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-3">
                              <Play className="w-4 h-4 text-brand-accent" />
                              <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.24em]">Roteiro de Vídeo Sugerido</span>
                            </div>
                            <p className="text-base font-medium leading-relaxed text-white italic">"{content.script}"</p>
                          </div>
                          <div className="p-5 bg-slate-900/60 rounded-[1.5rem] border border-white/10 space-y-4 hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-3">
                              <MessageSquare className="w-4 h-4 text-brand-accent" />
                              <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.24em]">Legenda Estratégica</span>
                            </div>
                            <p className="text-base font-medium leading-relaxed text-white">{content.caption}</p>
                            <p className="text-sm font-black text-brand-accent drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]">{content.hashtags}</p>
                          </div>
                        </div>
                        <div className="p-5 bg-brand-accent/10 rounded-[1.5rem] border border-brand-accent/20 flex items-start gap-4 hover:bg-brand-accent/20 transition-all relative z-10">
                          <Zap className="w-6 h-6 text-brand-accent shrink-0" />
                          <div>
                            <p className="text-[10px] font-black text-brand-accent uppercase tracking-[0.24em] mb-1">Dica de Produção</p>
                            <p className="text-base font-bold text-white">{content.suggestion}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                          <button onClick={() => {
                            setToastMessage({text: '📅 Postagem agendada com sucesso!', type: 'success'});
                          }} className="flex-1 py-4 bg-brand-accent text-white rounded-xl font-black text-base hover:bg-brand-accent/90 transition-all shadow-[0_10px_30px_rgba(139,92,246,0.3)] flex items-center justify-center gap-3">
                            <Calendar className="w-4 h-4" />
                            Agendar Postagem
                          </button>
                          <button onClick={() => {
                            setToastMessage({text: '✅ Enviado para aprovação!', type: 'success'});
                          }} className="sm:min-w-[220px] py-4 bg-brand-emerald text-white rounded-xl font-black text-base hover:bg-brand-emerald/90 transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(16,185,129,0.25)]">
                            <Send className="w-4 h-4" />
                            Enviar para Aprovação
                          </button>
                          <button
                            onClick={() => setContent(null)}
                            className="sm:min-w-[180px] py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black text-base hover:bg-white/10 transition-all"
                          >
                            Novo Roteiro
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            </section>

            {/* ─ LÂMINA 4: Insights de Conteúdo ─ */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)]',
                activeTab === 'history' && 'border-brand-accent/30 shadow-[0_0_30px_rgba(139,92,246,0.12)]'
              )}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white">Insights de Conteúdo</h2>
                  <p className="text-slate-400 font-medium">Top 3 conteúdos passados com melhor leitura de engajamento para orientar novas peças.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Benchmark editorial</p>
                  <p className="text-sm font-black text-white">Últimos 90 dias</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {TOP_CONTENTS.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 blur-3xl -mr-10 -mt-10" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-accent">Top {index + 1}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{item.platform}</span>
                      </div>
                      <h3 className="text-lg font-black text-white tracking-tight mb-3">{item.title}</h3>
                      <div className="flex items-center justify-between text-sm font-medium text-slate-400 mb-2">
                        <span>Engajamento</span>
                        <span className="font-black text-brand-emerald">{item.engagement}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden mb-4">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-emerald to-cyan-400"
                          style={{ width: item.engagement }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm font-medium text-slate-400">
                        <span>Alcance</span>
                        <span className="font-black text-white">{item.reach}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            ABA: DISPARO & IMPRENSA
        ══════════════════════════════════════════════════════════════════════ */}
        {hubMode === 'imprensa' && (
          <motion.div
            key="imprensa"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-6"
          >
            {/* ─ LÂMINA 1: Destinatários ─ */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white">Destinatários</h2>
                  <p className="text-slate-400 font-medium">Selecione os públicos que receberão este disparo.</p>
                </div>
                <div className="rounded-2xl border border-brand-accent/20 bg-brand-accent/10 px-4 py-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-accent">
                    {totalRecipients.toLocaleString('pt-BR')} contatos selecionados
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {RECIPIENT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleRecipient(option.id)}
                    className={cn(
                      'flex items-center gap-4 p-5 rounded-[1.5rem] border text-left transition-all group',
                      recipients.includes(option.id)
                        ? 'bg-brand-accent/15 border-brand-accent/30 shadow-[0_0_24px_rgba(139,92,246,0.15)]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    )}
                  >
                    <div
                      className={cn(
                        'w-11 h-11 rounded-xl flex items-center justify-center border transition-all',
                        recipients.includes(option.id)
                          ? 'bg-brand-accent/20 border-brand-accent/30 text-brand-accent'
                          : 'bg-white/5 border-white/10 text-slate-400 group-hover:text-white'
                      )}
                    >
                      <option.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-black text-sm tracking-tight', recipients.includes(option.id) ? 'text-white' : 'text-slate-300')}>
                        {option.label}
                      </p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{option.count}</p>
                    </div>
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                        recipients.includes(option.id)
                          ? 'bg-brand-accent border-brand-accent'
                          : 'border-white/20'
                      )}
                    >
                      {recipients.includes(option.id) && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ─ LÂMINA 2: Editor Rich Text ─ */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white">Novo Release / E-mail</h2>
                  <p className="text-slate-400 font-medium">Compose o conteúdo do seu disparo com inteligência editorial.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Editor Avançado</p>
                </div>
              </div>

              {/* Assunto */}
              <div className="mb-4 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.24em]">Assunto / Título do Release</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Ex: Prefeitura entrega nova creche no Bairro São José"
                  className="w-full py-4 px-5 bg-white/5 border border-white/10 rounded-[1.25rem] text-white font-medium text-sm outline-none focus:border-brand-accent/50 transition-all placeholder:text-slate-700"
                />
              </div>

              {/* Área editor simulado */}
              <div className="space-y-0">
                {/* Barra de ferramentas */}
                <div className="flex flex-wrap items-center gap-1 p-3 bg-slate-800/80 border border-white/10 rounded-t-[1.25rem] border-b-0">
                  {[
                    { icon: Bold, label: 'Negrito' },
                    { icon: Italic, label: 'Itálico' },
                    { icon: Link2, label: 'Link' },
                    { icon: Paperclip, label: 'Anexar PDF' },
                    { icon: ImageIcon, label: 'Inserir Imagem' },
                  ].map((tool) => (
                    <button
                      key={tool.label}
                      type="button"
                      title={tool.label}
                      onClick={() => setToastMessage({text: `${tool.label} ativado.`, type: 'success'})}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <tool.icon className="w-4 h-4" />
                    </button>
                  ))}
                  <div className="w-px h-5 bg-white/10 mx-1" />
                  <span className="text-[10px] text-slate-600 font-medium ml-1">Corpo do Texto</span>
                </div>
                {/* Textarea */}
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Redija aqui o corpo completo do release ou e-mail. Descreva os fatos, contexto, declarações e chamada para ação..."
                  className="w-full min-h-[260px] p-5 bg-white/5 border border-white/10 rounded-b-[1.25rem] text-white font-medium text-sm leading-relaxed resize-none outline-none focus:border-brand-accent/50 transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            {/* ─ LÂMINA 3: Ações de Inteligência ─ */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <h2 className="text-xl font-black text-white mb-2">Ações de Inteligência</h2>
              <p className="text-sm text-slate-400 font-medium mb-6">Execute o disparo ou potencialize o alcance transformando o release em conteúdo para as redes.</p>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Botão primário: Disparar */}
                <button
                  onClick={sendEmail}
                  disabled={isSendingEmail}
                  className="flex-1 py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-70 text-white rounded-2xl font-black text-base transition-all shadow-[0_10px_40px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 group"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Disparando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      Disparar E-mail
                    </>
                  )}
                </button>

                {/* Botão IA: Transformar em Post */}
                <button
                  onClick={transformToPost}
                  disabled={isTransforming}
                  className="flex-1 py-5 relative overflow-hidden rounded-2xl font-black text-base transition-all flex items-center justify-center gap-3 group border border-brand-accent/40 bg-gradient-to-r from-brand-accent/20 via-violet-600/20 to-cyan-500/20 hover:from-brand-accent/30 hover:via-violet-600/30 hover:to-cyan-500/30 text-white shadow-[0_0_30px_rgba(139,92,246,0.25)] hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] disabled:opacity-70"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {isTransforming ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                      <span className="relative z-10">Transformando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-cyan-300 group-hover:rotate-12 transition-transform relative z-10" />
                      <span className="relative z-10 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]">
                        ✨ Transformar Release em Post para Redes Sociais (IA)
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Feedback visual pós-disparo */}
              <AnimatePresence>
                {!isSendingEmail && emailBody.length === 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-slate-600 text-center mt-4 font-medium"
                  >
                    Preencha o assunto e o corpo do release para habilitar os disparos.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'fixed bottom-6 right-6 px-6 py-4 rounded-xl font-black text-sm flex items-center gap-3 shadow-2xl z-50 border',
            toastMessage.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
              : 'bg-red-500/20 border-red-400/40 text-red-300'
          )}
        >
          {toastMessage.type === 'success' ? '✅' : '❌'} {toastMessage.text}
        </motion.div>
      )}
    </div>
  );
}
