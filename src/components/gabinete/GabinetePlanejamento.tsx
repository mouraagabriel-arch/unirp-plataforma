import { useState } from 'react';
import { 
  Target, Calendar, TrendingUp, 
  MapPin, Users, Zap, 
  Sparkles, Loader2, Plus, 
  Edit2, Trash2, ArrowRight,
  CheckCircle2, AlertCircle, 
  Flag, Activity, BarChart3,
  ChevronRight, Landmark, Shield,
  Archive, FileText, Radio, Megaphone, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const MOCK_GOALS = [
  { id: '1', title: 'Mapear 10.000 Eleitores', progress: 65, target: 10000, current: 6500, category: 'Electoral' },
  { id: '2', title: 'Aprovar 5 Projetos de Lei', progress: 40, target: 5, current: 2, category: 'Legislative' },
  { id: '3', title: 'Reduzir Reclamações (Saúde)', progress: 80, target: 100, current: 80, category: 'Management' },
];

const RP_SECTORS = [
  {
    title: 'Gestao de Crise',
    icon: Shield,
    health: 72,
    gantt: [78, 52, 64, 36],
    tasks: [
      { label: 'Protocolo de resposta para imprensa', owner: 'AM' },
      { label: 'Monitoramento de narrativa adversa', owner: 'LS' },
      { label: 'Banco de provas e entregas', owner: 'RC' },
    ],
  },
  {
    title: 'Relacionamento com a Midia',
    icon: Radio,
    health: 81,
    gantt: [65, 84, 58, 44],
    tasks: [
      { label: 'Briefing semanal com jornalistas-chave', owner: 'MP' },
      { label: 'Agenda de entrevistas e exclusivas', owner: 'TS' },
      { label: 'Sala de imprensa do mandato', owner: 'GF' },
    ],
  },
  {
    title: 'Cronograma de Inauguracoes',
    icon: Building2,
    health: 68,
    gantt: [32, 48, 77, 90],
    tasks: [
      { label: 'Confirmar presenca institucional', owner: 'CA' },
      { label: 'Roteiro de falas por territorio', owner: 'NL' },
      { label: 'Cobertura audiovisual coordenada', owner: 'DV' },
    ],
  },
  {
    title: 'Metas de Impacto Social',
    icon: Megaphone,
    health: 88,
    gantt: [55, 73, 86, 94],
    tasks: [
      { label: 'Painel de entregas por bairro', owner: 'EV' },
      { label: 'Meta de alcance comunitario', owner: 'AR' },
      { label: 'Workshop comunitário semanal', owner: 'TS' },
    ],
  },
];

export function GabinetePlanejamento({ isDarkMode }: { isDarkMode: boolean }) {
  const [goals, setGoals] = useState(MOCK_GOALS);
  const [isGenerating, setIsGenerating] = useState(false);

  const simulateAIStrategy = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2500);
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto py-8 px-4 overflow-x-hidden pb-20">
      {/* Lâmina 0: Cabeçalho */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
      >
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-black tracking-tight text-white"
            >
              Planejamento <span className="text-brand-accent drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">Estratégico</span>
            </motion.h1>
            <p className="text-sm text-slate-400">Sincronizar diretrizes, metas e RP em tempo real</p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-wrap gap-3 justify-start xl:justify-end xl:items-start"
          >
            <button className="flex items-center gap-3 px-5 py-3 bg-brand-accent text-white rounded-2xl font-bold hover:bg-brand-accent/90 transition-all shadow-[0_10px_30px_rgba(139,92,246,0.3)] text-sm">
              <Sparkles className="w-4 h-4" />
              Otimizar IA
            </button>
            <button className="flex items-center gap-3 px-5 py-3 bg-white/5 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all duration-300 text-sm">
              <Archive className="w-4 h-4" />
              Arquivar
            </button>
            <button className="flex items-center gap-3 px-5 py-3 bg-white/5 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all duration-300 text-sm">
              <FileText className="w-4 h-4" />
              Exportar PDF
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Lâmina 1: Painel Eleitoral */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {[
            { label: 'Dias para Eleição', value: '192', trend: '-14', icon: Calendar, color: 'brand-accent' },
            { label: '% do Mandato', value: '70%', trend: '+3%', icon: BarChart3, color: 'brand-emerald' },
            { label: 'Votos', value: '4.250', trend: '+12%', icon: Users, color: 'brand-rose' },
            { label: 'Territórios', value: '12/20', trend: '+2', icon: MapPin, color: 'brand-accent' },
            { label: 'Engajamento', value: '85%', trend: '+5%', icon: Activity, color: 'cyan-400' },
          ].map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-4 relative overflow-hidden group hover:border-white/20 transition-all"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">{metric.label}</p>
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center border',
                    metric.color === 'brand-accent' ? 'bg-brand-accent/10 text-brand-accent border-brand-accent/20' :
                    metric.color === 'brand-emerald' ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20' :
                    metric.color === 'brand-rose' ? 'bg-brand-rose/10 text-brand-rose border-brand-rose/20' :
                    'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                  )}>
                    <metric.icon className="w-4 h-4" />
                  </div>
                </div>
                <p className={cn(
                  'text-2xl font-black tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.08)]',
                  metric.color === 'brand-accent' ? 'text-brand-accent' :
                  metric.color === 'brand-emerald' ? 'text-brand-emerald' :
                  metric.color === 'brand-rose' ? 'text-brand-rose' :
                  'text-cyan-300'
                )}>
                  {metric.value}
                </p>
                <p className="text-[10px] font-bold text-slate-500 mt-2">{metric.trend}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Lâmina 2: Metas e IA */}
      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6 items-stretch">
        {/* Lado Esquerdo: Metas do Mandato */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)] relative overflow-hidden"
        >
          <h3 className="text-xl font-black text-white mb-6">Metas do Mandato</h3>
          <div className="space-y-4">
            {goals.map((goal, idx) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-white">{goal.title}</p>
                  <span className="text-xs font-black text-brand-accent">{goal.progress}%</span>
                </div>
                <motion.div
                  className="h-2.5 bg-slate-800/50 rounded-full overflow-hidden border border-white/5"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className={cn(
                      'h-full rounded-full transition-all',
                      goal.progress >= 80 ? 'bg-brand-emerald/80' :
                      goal.progress >= 60 ? 'bg-brand-accent/80' :
                      'bg-amber-500/80'
                    )}
                  />
                </motion.div>
                <p className="text-[10px] text-slate-400">{goal.current}/{goal.target} {goal.category}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Lado Direito: IA + Status */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-6"
        >
          {/* Mapa de Ação IA */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-accent" />
              Mapa de Ação IA
            </h3>
            <div className="space-y-3">
              {[
                { icon: MapPin, label: 'Expandir cobertura', detail: '+15% eleitores/mês' },
                { icon: TrendingUp, label: 'Aumentar engajamento', detail: 'Meta: 12.500 interações' },
                { icon: Landmark, label: 'Consolidar base', detail: '4 territórios estratégicos' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                  <item.icon className="w-4 h-4 text-brand-accent mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{item.label}</p>
                    <p className="text-[10px] text-slate-400">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status da Estratégia */}
          <div className="bg-gradient-to-br from-brand-emerald/20 via-slate-900/60 to-slate-900/60 backdrop-blur-xl border border-brand-emerald/30 rounded-[2rem] p-6 md:p-8 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-brand-emerald" />
              <h3 className="text-lg font-black text-brand-emerald">Mandato Seguro</h3>
            </div>
            <p className="text-xs text-slate-400">Todos os setores em sintonia. Engajamento acima da meta.</p>
          </div>
        </motion.div>
      </section>

      {/* Lâmina 3: Ecosistema de RP */}
      <section className="space-y-6">
        {/* Header com métricas de saúde */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Saúde da Marca', value: '84%', icon: Flag, color: 'brand-emerald' },
            { label: 'Exposição Midiática', value: '67%', icon: Radio, color: 'brand-accent' },
            { label: 'Risco de Ruído', value: '29%', icon: AlertCircle, color: 'amber-500' },
          ].map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{metric.label}</p>
                  <p className={cn(
                    'text-2xl font-black mt-1',
                    metric.color === 'brand-emerald' ? 'text-brand-emerald' :
                    metric.color === 'brand-accent' ? 'text-brand-accent' :
                    'text-amber-500'
                  )}>
                    {metric.value}
                  </p>
                </div>
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center border',
                  metric.color === 'brand-emerald' ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20' :
                  metric.color === 'brand-accent' ? 'bg-brand-accent/10 text-brand-accent border-brand-accent/20' :
                  'bg-amber-500/10 text-amber-500 border-amber-500/20'
                )}>
                  <metric.icon className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Setores de RP */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {RP_SECTORS.map((sector, sectorIdx) => (
            <motion.div
              key={sectorIdx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectorIdx * 0.1 }}
              className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)] relative overflow-hidden"
            >
              {/* Header do Setor */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center border',
                    sector.health >= 80 ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20' :
                    sector.health >= 70 ? 'bg-brand-accent/10 text-brand-accent border-brand-accent/20' :
                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  )}>
                    <sector.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm">{sector.title}</h4>
                    <p className={cn(
                      'text-xs font-bold',
                      sector.health >= 80 ? 'text-brand-emerald' :
                      sector.health >= 70 ? 'text-brand-accent' :
                      'text-amber-500'
                    )}>
                      {sector.health}% de saúde
                    </p>
                  </div>
                </div>
              </div>

              {/* Tarefas */}
              <div className="space-y-3 mb-6">
                {sector.tasks.map((task, taskIdx) => (
                  <div key={taskIdx} className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-accent/30 transition-all">
                      <span className="text-[9px] font-black text-brand-accent">{task.owner}</span>
                    </div>
                    <p className="text-xs text-slate-300">{task.label}</p>
                  </div>
                ))}
              </div>

              {/* Gantt Simplificado */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Timeline (Trimestres)</p>
                <div className="grid grid-cols-4 gap-2">
                  {sector.gantt.map((value, qIdx) => (
                    <div key={qIdx} className="flex flex-col items-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: '64px' }}
                        transition={{ duration: 0.6, delay: 0.2 + qIdx * 0.1 }}
                        className="w-2 rounded-full bg-gradient-to-t from-brand-accent to-brand-accent/50 relative shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                      />
                      <p className="text-[8px] font-bold text-slate-400 mt-1">{value}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Loading IA */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)] flex items-center justify-center gap-3"
          >
            <Loader2 className="w-5 h-5 text-brand-accent animate-spin" />
            <p className="text-sm font-bold text-slate-300">Sincronizando estratégia com IA...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
