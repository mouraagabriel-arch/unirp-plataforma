import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Edit2,
  FileText,
  Filter,
  Flag,
  Globe,
  History,
  Loader2,
  MessageSquare,
  Plus,
  Save,
  Search,
  Send,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useTerminologia } from '../../hooks/useTerminologia';

const MOCK_FLAGS = [
  { id: '1', title: 'Saúde Pública de Qualidade', type: 'Bandeira', description: 'Foco em redução de filas e novos médicos.' },
  { id: '2', title: 'Segurança no Centro', type: 'Bandeira', description: 'Aumento do policiamento e iluminação.' },
  { id: '3', title: 'Educação Infantil', type: 'Bandeira', description: 'Vagas em creches e valorização de professores.' },
];

const MOCK_RED_LINES = [
  { id: '1', title: 'Aumento de Impostos', type: 'Linha Vermelha', description: 'Voto contrário a qualquer nova taxa ou aumento de IPTU.' },
  { id: '2', title: 'Privatização da Saúde', type: 'Linha Vermelha', description: 'Defesa do SUS e contra a gestão privada de hospitais públicos.' },
  { id: '3', title: 'Cortes na Educação', type: 'Linha Vermelha', description: 'Inadmissível qualquer redução de verba para o ensino básico.' },
];

const MOCK_TOPICS = [
  { id: '1', title: 'Aumento do IPTU', date: '25 Mar, 2024', status: 'Publicado', sentiment: 'Crítico' },
  { id: '2', title: 'Reforma da Previdência Municipal', date: '24 Mar, 2024', status: 'Em Rascunho', sentiment: 'Sensível' },
  { id: '3', title: 'Greve dos Professores', date: '22 Mar, 2024', status: 'Publicado', sentiment: 'Alto Risco' },
];

interface PositioningDraft {
  title: string;
  content: string;
  tags: string[];
  audience: string;
  risk: string;
}

export function GabineteIdeologia({ isDarkMode }: { isDarkMode: boolean }) {
  const { termo } = useTerminologia();
  const termoPlural = termo('cidadaos');
  const [flags, setFlags] = useState(MOCK_FLAGS);
  const [redLines, setRedLines] = useState(MOCK_RED_LINES);
  const [isEditing, setIsEditing] = useState(false);
  const [topic, setTopic] = useState('');
  const [voiceTone, setVoiceTone] = useState('Equilibrado');
  const [targetAudience, setTargetAudience] = useState('Eleitorado Geral');
  const [isGenerating, setIsGenerating] = useState(false);
  const [positioning, setPositioning] = useState<PositioningDraft | null>(null);

  const generatePositioning = () => {
    if (!topic) return;

    setIsGenerating(true);
    setTimeout(() => {
      setPositioning({
        title: `Nota Oficial: ${topic}`,
        content: `O Gabinete do Vereador vem a público esclarecer sua posição sobre ${topic}. Reafirmamos nosso compromisso com a transparência e o bem-estar da população. Entendemos as preocupações levantadas e estamos trabalhando para garantir que o interesse público prevaleça em todas as decisões legislativas. Com tom ${voiceTone.toLowerCase()} e foco em ${targetAudience.toLowerCase()}, a mensagem respeita suas Bandeiras e Linhas Vermelhas.` ,
        tags: ['Transparência', 'Compromisso', 'Diálogo', voiceTone],
        audience: targetAudience,
        risk: 'Médio',
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto py-8 px-4 overflow-x-hidden">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl md:text-4xl font-black tracking-tight text-white"
            >
              Cérebro <span className="text-brand-accent drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">Estratégico</span>
            </motion.h1>
            <div className="flex flex-wrap gap-3 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">Núcleo Ideológico</span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">Central de Posicionamento</span>
            </div>
            <p className="text-slate-300 font-medium leading-relaxed">
              Configure as diretrizes mestras do seu mandato. A inteligência artificial utiliza este núcleo para filtrar, priorizar e analisar cada projeto ou demanda que chega ao gabinete, além de gerar notas oficiais, comunicados e posicionamentos estratégicos com o auxílio da IA.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-wrap gap-3"
          >
            <button className="flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <History className="w-4 h-4" />
              Histórico de Notas
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={cn(
                'flex items-center gap-3 px-5 py-3 rounded-2xl font-bold transition-all duration-300 border',
                isEditing
                  ? 'bg-brand-emerald/20 text-brand-emerald border-brand-emerald/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                  : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
              )}
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              {isEditing ? 'Salvar Diretrizes' : 'Editar Núcleo'}
            </button>
          </motion.div>
        </div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
      >
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-accent/15 border border-brand-accent/20 text-brand-accent flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">As Diretrizes</h2>
            <p className="text-slate-400 font-medium">O Cérebro do mandato em formato horizontal, compacto e acionável.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-brand-emerald/10 text-brand-emerald rounded-2xl flex items-center justify-center border border-brand-emerald/20">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Bandeiras</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Prioridades Estratégicas</p>
                </div>
              </div>
              {isEditing && (
                <button className="p-3 bg-brand-emerald/10 text-brand-emerald rounded-xl hover:bg-brand-emerald/20 transition-all border border-brand-emerald/20">
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flags.map((flag, index) => (
                <motion.div
                  key={flag.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="min-h-[180px] rounded-[1.75rem] border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 hover:border-brand-emerald/30 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-emerald/5 blur-3xl -mr-10 -mt-10 group-hover:bg-brand-emerald/10 transition-colors" />
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-brand-emerald rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-[10px] font-black text-brand-emerald uppercase tracking-widest">{flag.type}</span>
                    </div>
                    {isEditing && (
                      <button className="p-2 text-slate-500 hover:text-brand-rose transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <h4 className="text-lg font-black text-white mb-2 relative z-10">{flag.title}</h4>
                  <p className="text-sm font-medium text-slate-400 leading-relaxed relative z-10">{flag.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-brand-rose/10 text-brand-rose rounded-2xl flex items-center justify-center border border-brand-rose/20">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Linhas Vermelhas</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Limites Inegociáveis</p>
                </div>
              </div>
              {isEditing && (
                <button className="p-3 bg-brand-rose/10 text-brand-rose rounded-xl hover:bg-brand-rose/20 transition-all border border-brand-rose/20">
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {redLines.map((line, index) => (
                <motion.div
                  key={line.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="min-h-[180px] rounded-[1.75rem] border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 hover:border-brand-rose/30 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-rose/5 blur-3xl -mr-10 -mt-10 group-hover:bg-brand-rose/10 transition-colors" />
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-brand-rose rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                      <span className="text-[10px] font-black text-brand-rose uppercase tracking-widest">{line.type}</span>
                    </div>
                    {isEditing && (
                      <button className="p-2 text-slate-500 hover:text-brand-rose transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <h4 className="text-lg font-black text-white mb-2 relative z-10">{line.title}</h4>
                  <p className="text-sm font-medium text-slate-400 leading-relaxed relative z-10">{line.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
      >
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
          <Sparkles className="w-40 h-40 text-brand-accent" />
        </div>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-brand-accent/10 blur-[100px] rounded-full" />

        <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.35fr_0.9fr] gap-8 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-brand-accent/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-brand-accent/30 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                <Zap className="w-7 h-7 text-brand-accent" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white">O Motor IA</h3>
                <p className="text-slate-400 font-medium">Inteligência de Filtragem</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-brand-emerald rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-brand-emerald uppercase tracking-widest">Sistema Ativo</span>
                </div>
              </div>
            </div>

            <p className="text-lg md:text-xl font-medium text-slate-300 leading-relaxed max-w-3xl">
              Com base nestas diretrizes, a IA classifica automaticamente todos os Projetos de Lei e Demandas de {termoPlural}, garantindo que o mandato mantenha sua coerência ideológica.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-brand-emerald" />
                <span className="text-xs font-black uppercase tracking-widest text-white">Alinhamento Automático</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <AlertCircle className="w-5 h-5 text-brand-amber" />
                <span className="text-xs font-black uppercase tracking-widest text-white">Alerta de Conflito</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 flex flex-col items-center text-center group hover:border-brand-accent/30 transition-all">
              <p className="text-3xl font-black mb-2 text-white group-hover:text-brand-accent transition-colors">100%</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Precisão de Filtro</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 flex flex-col items-center text-center group hover:border-brand-accent/30 transition-all">
              <p className="text-3xl font-black mb-2 text-white group-hover:text-brand-accent transition-colors">24h</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Monitoramento</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 flex flex-col items-center text-center group hover:border-brand-accent/30 transition-all">
              <p className="text-3xl font-black mb-2 text-white group-hover:text-brand-accent transition-colors">Zero</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ruído Político</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 flex flex-col items-center text-center group hover:border-brand-accent/30 transition-all">
              <p className="text-3xl font-black mb-2 text-white group-hover:text-brand-accent transition-colors">IA</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Estratégica</p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">Ação Estratégica</h2>
            <p className="text-slate-400 font-medium">A Central de Posicionamento agora opera dentro do Cérebro Estratégico.</p>
          </div>
          <div className="px-4 py-2 rounded-full border border-brand-accent/20 bg-brand-accent/10 text-brand-accent text-[10px] font-black uppercase tracking-[0.24em]">
            IA calibrada com suas Bandeiras e Linhas Vermelhas
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6 items-stretch">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[1.75rem] p-5 shadow-2xl h-full">
            <div className="space-y-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-accent/10 text-brand-accent rounded-xl flex items-center justify-center border border-brand-accent/20">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-tight">Tópicos Quentes</h3>
                  <p className="text-sm text-slate-500 font-medium">Radar de crise e oportunidades de fala.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 px-4 py-3 bg-white/5 rounded-xl flex items-center gap-2 border border-white/10 focus-within:border-brand-accent/50 transition-all">
                  <Search className="w-3 h-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar tópico..."
                    className="bg-transparent border-none outline-none text-xs font-medium w-full text-white placeholder:text-slate-600"
                  />
                </div>
                <button className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-brand-accent border border-white/10 hover:bg-white/10 transition-all">
                  <Filter className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {MOCK_TOPICS.map((item, index) => (
                <motion.button
                  key={item.id}
                  type="button"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  onClick={() => setTopic(item.title)}
                  className="w-full text-left p-4 rounded-[1.5rem] border border-white/10 bg-white/5 hover:bg-white/10 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-brand-accent/5 blur-2xl -mr-10 -mt-10 group-hover:bg-brand-accent/10 transition-colors" />

                  <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
                    <span className={cn(
                      'text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest border',
                      item.sentiment === 'Alto Risco' ? 'bg-brand-rose/10 text-brand-rose border-brand-rose/20' :
                      item.sentiment === 'Crítico' ? 'bg-brand-amber/10 text-brand-amber border-brand-amber/20' :
                      'bg-brand-accent/10 text-brand-accent border-brand-accent/20'
                    )}>
                      {item.sentiment}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.date}</span>
                  </div>

                  <p className="font-black text-sm text-white group-hover:text-brand-accent transition-all relative z-10">{item.title}</p>

                  <div className="flex items-center gap-2 mt-3 relative z-10">
                    <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ backgroundColor: item.status === 'Publicado' ? '#10b981' : item.status === 'Em Rascunho' ? '#f59e0b' : '#f43f5e' }} />
                    <span className={cn(
                      'text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border',
                      item.status === 'Publicado' ? 'bg-brand-emerald/20 text-brand-emerald border-brand-emerald/30' :
                      item.status === 'Em Rascunho' ? 'bg-brand-amber/20 text-brand-amber border-brand-amber/30' :
                      'bg-rose-500/20 text-rose-300 border-rose-400'
                    )}>
                      {item.status === 'Publicado' ? 'Aprovado' : item.status === 'Em Rascunho' ? 'Em Análise' : 'Conflito'}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[1.75rem] p-6 shadow-2xl relative overflow-hidden min-h-[560px] flex flex-col"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/5 blur-[100px] -mr-48 -mt-48 pointer-events-none" />

            <AnimatePresence mode="wait">
              {!positioning && !isGenerating ? (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-8 flex-1 flex flex-col relative z-10"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-brand-accent/20 backdrop-blur-xl rounded-xl flex items-center justify-center border border-brand-accent/30 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                      <MessageSquare className="w-5 h-5 text-brand-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">Novo Posicionamento</h3>
                      <p className="text-slate-500 font-medium">Defina o tema para que a IA redija a nota ideal.</p>
                    </div>
                  </div>

                  <div className="px-4 py-3 rounded-2xl border border-brand-accent/20 bg-brand-accent/10 text-brand-accent text-xs font-black uppercase tracking-[0.2em]">
                    IA calibrada com suas Bandeiras e Linhas Vermelhas
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Sobre qual polêmica ou tema deseja se posicionar?</label>
                    <textarea
                      value={topic}
                      onChange={(event) => setTopic(event.target.value)}
                      placeholder="Ex: Minha posição sobre a nova ciclovia no centro..."
                      className="w-full min-h-[170px] p-5 rounded-xl font-medium leading-relaxed resize-none border border-white/10 bg-white/5 focus:border-brand-accent/50 transition-all outline-none text-white text-base placeholder:text-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-4 group hover:bg-white/10 transition-all">
                      <div className="w-10 h-10 bg-brand-accent/10 rounded-2xl flex items-center justify-center border border-brand-accent/20 group-hover:scale-110 transition-transform">
                        <Users className="w-4 h-4 text-brand-accent" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Público-Alvo</p>
                        <select
                          value={targetAudience}
                          onChange={(event) => setTargetAudience(event.target.value)}
                          className="w-full bg-transparent text-base font-black text-white outline-none"
                        >
                          <option className="bg-slate-900 text-white">Eleitorado Geral</option>
                          <option className="bg-slate-900 text-white">Imprensa Local</option>
                          <option className="bg-slate-900 text-white">Base Aliada</option>
                          <option className="bg-slate-900 text-white">Servidores Públicos</option>
                        </select>
                      </div>
                    </label>

                    <label className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-4 group hover:bg-white/10 transition-all">
                      <div className="w-10 h-10 bg-brand-accent/10 rounded-2xl flex items-center justify-center border border-brand-accent/20 group-hover:scale-110 transition-transform">
                        <Globe className="w-4 h-4 text-brand-accent" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tom de Voz</p>
                        <select
                          value={voiceTone}
                          onChange={(event) => setVoiceTone(event.target.value)}
                          className="w-full bg-transparent text-base font-black text-white outline-none"
                        >
                          <option className="bg-slate-900 text-white">Equilibrado</option>
                          <option className="bg-slate-900 text-white">Firme</option>
                          <option className="bg-slate-900 text-white">Diplomático</option>
                          <option className="bg-slate-900 text-white">Combativo</option>
                        </select>
                      </div>
                    </label>
                  </div>

                  <button
                    onClick={generatePositioning}
                    disabled={!topic || isGenerating}
                    className="w-full py-4 bg-brand-accent text-white rounded-xl font-black text-lg hover:bg-brand-accent/90 transition-all shadow-[0_10px_30px_rgba(139,92,246,0.3)] flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Gerar Nota Oficial com IA
                  </button>
                </motion.div>
              ) : isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-6 relative z-10"
                >
                  <div className="relative mb-10">
                    <div className="w-16 h-16 bg-brand-accent/20 rounded-xl flex items-center justify-center border border-brand-accent/30 animate-pulse">
                      <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
                    </div>
                    <div className="absolute -top-4 -right-4">
                      <Sparkles className="w-5 h-5 text-brand-accent animate-bounce" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tighter mb-4">IA Redigindo Nota...</h3>
                  <p className="text-slate-400 text-lg font-medium max-w-md">Buscando o equilíbrio perfeito entre firmeza e diplomacia para o seu mandato.</p>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8 flex-1 flex flex-col relative z-10"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-brand-emerald/10 text-brand-emerald rounded-xl flex items-center justify-center border border-brand-emerald/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white tracking-tight">Nota Oficial Gerada</h3>
                          <p className="text-slate-500 font-medium">Revisada e otimizada pela IA estratégica.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button className="p-4 bg-white/5 text-slate-400 hover:text-brand-accent rounded-2xl transition-all border border-white/10 hover:bg-white/10">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-4 bg-white/5 text-slate-400 hover:text-brand-accent rounded-2xl transition-all border border-white/10 hover:bg-white/10">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs uppercase tracking-widest border border-white/10 hover:bg-white/20 transition">Editar Relatório</button>
                      <button className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs uppercase tracking-widest border border-white/10 hover:bg-white/20 transition">Anexar Documento</button>
                      <button className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs uppercase tracking-widest border border-white/10 hover:bg-white/20 transition">Mover para Pasta de Arquivo</button>
                      <button className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs uppercase tracking-widest border border-white/10 hover:bg-white/20 transition">Gerar Resumo IA</button>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-6 flex-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-brand-emerald/5 blur-[80px] -mr-32 -mt-32 pointer-events-none" />

                    <h4 className="text-base font-bold text-white relative z-10 tracking-tight">{positioning.title}</h4>
                    <p className="text-lg font-medium leading-relaxed text-slate-300 relative z-10">{positioning.content}</p>
                    <div className="flex flex-wrap gap-3 relative z-10">
                      {positioning.tags.map((tag, index) => (
                        <span key={`${tag}-${index}`} className="px-5 py-2.5 bg-brand-accent/10 border border-brand-accent/20 rounded-full text-[10px] font-black text-brand-accent uppercase tracking-widest">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-brand-amber/5 rounded-xl border border-brand-amber/20 group hover:bg-brand-amber/10 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="w-4 h-4 text-brand-amber" />
                        <span className="text-[10px] font-black text-brand-amber uppercase tracking-widest">Risco de Repercussão</span>
                      </div>
                      <p className="text-base font-semibold text-white mb-2">{positioning.risk}</p>
                      <p className="text-sm font-bold text-slate-500">Monitorar comentários nas redes sociais e grupos de oposição.</p>
                    </div>
                    <div className="p-5 bg-brand-accent/5 rounded-xl border border-brand-accent/20 group hover:bg-brand-accent/10 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <FileText className="w-4 h-4 text-brand-accent" />
                        <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">Formato Sugerido</span>
                      </div>
                      <p className="text-base font-semibold text-white mb-2">Comunicado PDF</p>
                      <p className="text-sm font-bold text-slate-500">Ideal para disparo em massa via WhatsApp e Telegram.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-white/5 rounded-xl border border-white/10 group hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <Users className="w-4 h-4 text-brand-accent" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Público-Alvo</span>
                      </div>
                      <p className="text-base font-semibold text-white">{positioning.audience}</p>
                    </div>
                    <div className="p-5 bg-white/5 rounded-xl border border-white/10 group hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <Globe className="w-4 h-4 text-brand-accent" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tom de Voz</span>
                      </div>
                      <p className="text-base font-semibold text-white">{voiceTone}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 pt-2">
                    <button className="flex-1 py-4 bg-brand-emerald text-white rounded-xl font-black text-lg hover:bg-brand-emerald/90 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-4 group">
                      <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      Publicar Agora
                    </button>
                    <button
                      onClick={() => setPositioning(null)}
                      className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black text-lg hover:bg-white/10 transition-all"
                    >
                      Novo Tópico
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
