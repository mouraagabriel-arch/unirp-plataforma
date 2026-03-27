import { useState } from 'react';
import { 
  Target, Calendar, TrendingUp, 
  MapPin, Users, Zap, 
  Sparkles, Loader2, Plus, 
  Edit2, Trash2, ArrowRight,
  CheckCircle2, AlertCircle, 
  Flag, Activity, BarChart3,
  ChevronRight, Landmark, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const MOCK_GOALS = [
  { id: '1', title: 'Mapear 10.000 Eleitores', progress: 65, target: 10000, current: 6500, category: 'Electoral' },
  { id: '2', title: 'Aprovar 5 Projetos de Lei', progress: 40, target: 5, current: 2, category: 'Legislative' },
  { id: '3', title: 'Reduzir Reclamações (Saúde)', progress: 80, target: 100, current: 80, category: 'Management' },
];

export function GabinetePlanejamento({ isDarkMode }: { isDarkMode: boolean }) {
  const [goals, setGoals] = useState(MOCK_GOALS);
  const [isGenerating, setIsGenerating] = useState(false);

  const simulateAIStrategy = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2500);
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-black tracking-tighter text-white"
          >
            Planejamento <span className="text-brand-accent drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">Estratégico</span>
          </motion.h1>
          <p className="text-slate-400 font-medium max-w-2xl">
            Metas do mandato, contagem regressiva eleitoral e inteligência de campo. Gerencie o futuro do seu mandato com precisão cirúrgica.
          </p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex gap-4"
        >
          <button 
            onClick={simulateAIStrategy}
            className="flex items-center gap-3 px-8 py-4 bg-brand-accent text-white rounded-2xl font-bold hover:bg-brand-accent/90 transition-all shadow-[0_10px_30px_rgba(139,92,246,0.3)]"
          >
            <Sparkles className="w-5 h-5" />
            Otimizar Estratégia com IA
          </button>
          <button className="p-4 bg-white/5 text-white border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
            <Plus className="w-5 h-5" />
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Countdown Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 glass-card p-10 rounded-[4rem] border border-white/5 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Calendar className="w-40 h-40 text-brand-accent" />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Dias para a Eleição</p>
          <p className="text-8xl font-black text-brand-accent tracking-tighter drop-shadow-[0_0_20px_rgba(139,92,246,0.4)]">192</p>
          <p className="text-sm font-bold text-slate-400 mt-4">Próximo Pleito: Out 2024</p>
          <div className="w-full h-3 bg-white/5 rounded-full mt-10 overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '70%' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-brand-accent rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]" 
            />
          </div>
          <p className="text-[10px] font-black text-brand-accent mt-4 uppercase tracking-widest">70% do Mandato Concluído</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Votos Estimados', value: '4.250', trend: '+12%', icon: Users, color: 'brand-emerald' },
            { label: 'Territórios Dominados', value: '12/20', trend: '+2', icon: MapPin, color: 'brand-accent' },
            { label: 'Engajamento Digital', value: '85%', trend: '+5%', icon: Activity, color: 'brand-rose' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-10 rounded-[3rem] border border-white/5 shadow-2xl flex items-center gap-8 group hover:bg-white/10 transition-all"
            >
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110",
                stat.color === 'brand-emerald' ? "bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]" :
                stat.color === 'brand-accent' ? "bg-brand-accent/10 text-brand-accent border-brand-accent/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]" :
                "bg-brand-rose/10 text-brand-rose border-brand-rose/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
              )}>
                <stat.icon className="w-10 h-10" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-black text-white tracking-tight">{stat.value}</p>
                  <span className={cn(
                    "text-xs font-black mb-1.5 px-2 py-1 rounded-lg",
                    stat.trend.startsWith('+') ? "bg-brand-emerald/10 text-brand-emerald" : "bg-brand-rose/10 text-brand-rose"
                  )}>{stat.trend}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Metas e Objetivos */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-12 rounded-[4rem] border border-white/5 shadow-2xl space-y-10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 blur-[80px] -mr-32 -mt-32 pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-brand-accent/10 text-brand-accent rounded-2xl flex items-center justify-center border border-brand-accent/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                <Target className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">Metas do Mandato</h3>
                <p className="text-slate-500 font-medium">Acompanhamento de objetivos estratégicos</p>
              </div>
            </div>
            <button className="p-4 bg-white/5 text-slate-400 hover:text-brand-accent rounded-2xl transition-all border border-white/5 hover:bg-white/10">
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-8 relative z-10">
            {goals.map((goal) => (
              <div key={goal.id} className="space-y-4 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-black text-white group-hover:text-brand-accent transition-colors">{goal.title}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{goal.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-brand-accent drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]">{goal.progress}%</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{goal.current} / {goal.target}</p>
                  </div>
                </div>
                <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-brand-accent rounded-full shadow-[0_0_10px_rgba(139,92,246,0.4)]" 
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mapa Estratégico IA */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card h-full min-h-[600px] rounded-[4rem] border border-brand-accent/30 flex flex-col items-center justify-center text-center p-16 shadow-2xl bg-gradient-to-br from-brand-accent/10 to-transparent"
              >
                <div className="relative mb-12">
                  <div className="w-32 h-32 bg-brand-accent/20 rounded-[3rem] flex items-center justify-center border border-brand-accent/30 animate-pulse shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                    <Loader2 className="w-16 h-16 text-brand-accent animate-spin" />
                  </div>
                </div>
                <h3 className="text-4xl font-black text-white tracking-tighter mb-4">IA Estrategista</h3>
                <p className="text-slate-400 text-xl font-medium max-w-md">Calculando rotas de crescimento eleitoral e otimização de recursos em tempo real...</p>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card p-12 rounded-[4rem] border border-white/5 shadow-2xl space-y-10 relative overflow-hidden h-full"
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-amber/5 blur-[100px] -mr-48 -mt-48 pointer-events-none" />
                
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-16 h-16 bg-brand-amber/10 text-brand-amber rounded-2xl flex items-center justify-center border border-brand-amber/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                    <Zap className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tight">Mapa de Ação IA</h3>
                    <p className="text-slate-500 font-medium">Insights estratégicos de inteligência política</p>
                  </div>
                </div>

                <div className="space-y-6 relative z-10">
                  {[
                    { title: 'Focar no Bairro São José', desc: 'Potencial de 500 novos votos com pauta de segurança.', icon: MapPin, color: 'brand-accent' },
                    { title: 'Intensificar Redes Sociais', desc: 'Público jovem (18-24) está com baixo engajamento.', icon: TrendingUp, color: 'brand-rose' },
                    { title: 'Pauta Legislativa: Educação', desc: 'Aprovar o PL da Creche aumentará aprovação em 8%.', icon: Landmark, color: 'brand-emerald' },
                  ].map((action, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 10 }}
                      className="p-8 bg-white/5 rounded-[3rem] border border-white/5 flex items-start gap-6 hover:border-brand-accent/50 hover:bg-white/10 transition-all cursor-pointer group"
                    >
                      <div className={cn(
                        "p-4 rounded-2xl border transition-all duration-500 group-hover:scale-110",
                        action.color === 'brand-accent' ? "bg-brand-accent/10 text-brand-accent border-brand-accent/20" :
                        action.color === 'brand-rose' ? "bg-brand-rose/10 text-brand-rose border-brand-rose/20" :
                        "bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20"
                      )}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-black text-white mb-1 group-hover:text-brand-accent transition-colors">{action.title}</p>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed">{action.desc}</p>
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors self-center" />
                    </motion.div>
                  ))}
                </div>

                <div className="p-8 bg-brand-accent/10 rounded-[3rem] border border-brand-accent/20 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-brand-accent/20 rounded-2xl flex items-center justify-center border border-brand-accent/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                      <Shield className="w-7 h-7 text-brand-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest">Status da Estratégia</p>
                      <p className="text-xl font-black text-white tracking-tight">Mandato Seguro</p>
                    </div>
                  </div>
                  <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-xs hover:bg-white/10 transition-all hover:border-brand-accent/50">
                    Ver Detalhes
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
