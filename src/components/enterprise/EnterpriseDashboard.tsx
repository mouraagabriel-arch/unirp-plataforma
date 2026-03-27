import { useState } from 'react';
import { 
  BarChart3, PieChart, TrendingUp, AlertCircle, 
  MessageSquare, Users, Zap, Bell, 
  ArrowUpRight, ArrowDownRight, Activity,
  Cloud, Search, Filter, MoreVertical
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePie, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

const SENTIMENT_DATA = [
  { name: 'Positivo', value: 65, color: '#10b981' },
  { name: 'Neutro', value: 20, color: '#f59e0b' },
  { name: 'Negativo', value: 15, color: '#ef4444' },
];

const EVOLUTION_DATA = [
  { name: 'Seg', mencoes: 400, alcance: 2400 },
  { name: 'Ter', mencoes: 300, alcance: 1398 },
  { name: 'Qua', mencoes: 200, alcance: 9800 },
  { name: 'Qui', mencoes: 278, alcance: 3908 },
  { name: 'Sex', mencoes: 189, alcance: 4800 },
  { name: 'Sab', mencoes: 239, alcance: 3800 },
  { name: 'Dom', mencoes: 349, alcance: 4300 },
];

const WORD_CLOUD = [
  { text: 'Transparência', size: 'text-4xl', color: 'text-blue-600' },
  { text: 'Inovação', size: 'text-3xl', color: 'text-emerald-600' },
  { text: 'Saúde Pública', size: 'text-5xl', color: 'text-slate-900' },
  { text: 'Obras', size: 'text-2xl', color: 'text-amber-600' },
  { text: 'Educação', size: 'text-4xl', color: 'text-indigo-600' },
  { text: 'Sustentabilidade', size: 'text-2xl', color: 'text-teal-600' },
  { text: 'Eficiência', size: 'text-3xl', color: 'text-blue-500' },
];

export function EnterpriseDashboard({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="space-y-12 pb-20 overflow-x-hidden min-h-full">
      {/* Header com Alertas Críticos */}
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        <div className="flex-1">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl font-black tracking-tighter leading-none text-white"
          >
            Visão <span className="text-blue-500 underline decoration-blue-500/30 decoration-8 underline-offset-8">Estratégica</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 font-bold mt-8 text-xl max-w-2xl leading-relaxed"
          >
            Monitoramento institucional de alto nível. Inteligência de dados para tomada de decisão em organizações complexas.
          </motion.p>
        </div>
        
        <div className="flex flex-wrap gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6 px-10 py-8 glass-card neon-glow-rose border-brand-rose/20"
          >
            <div className="w-14 h-14 bg-brand-rose/20 border border-brand-rose/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.2)]">
              <div className="w-4 h-4 bg-brand-rose rounded-full animate-ping" />
            </div>
            <div>
              <p className="text-[10px] font-black text-brand-rose uppercase tracking-[0.2em] mb-1">Crise Ativa</p>
              <p className="text-2xl font-black text-white leading-tight">Greve Saúde</p>
              <p className="text-[10px] font-bold text-brand-rose/70 mt-2">Impacto: Crítico</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-6 px-10 py-8 glass-card neon-glow-amber border-brand-amber/20"
          >
            <div className="w-14 h-14 bg-brand-amber/20 border border-brand-amber/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <AlertCircle className="w-7 h-7 text-brand-amber" />
            </div>
            <div>
              <p className="text-[10px] font-black text-brand-amber uppercase tracking-[0.2em] mb-1">Alerta Mídia</p>
              <p className="text-2xl font-black text-white leading-tight">Portal G1</p>
              <p className="text-[10px] font-bold text-brand-amber/70 mt-2">Matéria sobre Obras</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Alcance Total', value: '2.4M', trend: '+12.5%', up: true, icon: Users, color: 'blue-500', desc: 'Impacto digital' },
          { label: 'Sentimento Positivo', value: '68%', trend: '+5.2%', up: true, icon: Activity, color: 'emerald-500', desc: 'Aprovação institucional' },
          { label: 'Menções Críticas', value: '14', trend: '-2.1%', up: true, icon: AlertCircle, color: 'rose-500', desc: 'Alertas de risco' },
          { label: 'Pautas na Semana', value: '42', trend: '+8', up: true, icon: MessageSquare, color: 'indigo-500', desc: 'Engajamento de pautas' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-10 glass-card transition-all hover:translate-y-[-8px] group border-white/5 hover:border-white/10"
          >
            <div className="flex items-center justify-between mb-8">
              <div className={cn("p-5 rounded-2xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors shadow-inner")}>
                <stat.icon className={cn("w-7 h-7", `text-${stat.color}`)} />
              </div>
              <span className={cn(
                "text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase",
                stat.up ? "bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30" : "bg-brand-rose/20 text-brand-rose border border-brand-rose/30"
              )}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-5xl font-black tracking-tighter text-white mb-2">{stat.value}</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
            <div className="h-px w-full bg-white/5 my-6" />
            <p className="text-[11px] font-bold text-slate-600 flex items-center gap-2">
              <Zap className="w-3 h-3 text-blue-500" />
              {stat.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sentimento da Mídia */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-4 p-12 glass-card flex flex-col border-white/5"
        >
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-3xl font-black tracking-tighter text-white">Sentimento da Mídia</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Análise de humor institucional</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <div className="relative w-64 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePie>
                  <Pie
                    data={SENTIMENT_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {SENTIMENT_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="stroke-none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
                  />
                </RePie>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-5xl font-black text-white tracking-tighter">65%</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Positivo</span>
              </div>
            </div>
          </div>

          <div className="mt-10 p-8 glass-item border-emerald-500/20 bg-emerald-500/5 rounded-[2rem]">
            <p className="text-xs font-bold text-slate-400 leading-relaxed">
              <span className="text-emerald-500 font-black uppercase tracking-widest mr-2">Insight IA:</span> 
              O sentimento positivo cresceu 15% após a divulgação das novas metas da saúde.
            </p>
          </div>
        </motion.div>

        {/* Evolução de Alcance */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-8 p-12 glass-card border-white/5"
        >
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-3xl font-black tracking-tighter text-white">Evolução de Alcance</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Impacto das ações institucionais</p>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 glass-item text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 border-blue-500/30 hover:bg-blue-500/10 transition-all">7 Dias</button>
              <button className="px-6 py-3 glass-item text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-white/5 hover:text-white transition-all">30 Dias</button>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={EVOLUTION_DATA}>
                <defs>
                  <linearGradient id="colorAlcance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
                />
                <Area type="monotone" dataKey="alcance" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorAlcance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Word Cloud & Pautas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-12 glass-card border-white/5"
        >
          <h3 className="text-3xl font-black tracking-tighter text-white mb-12">Nuvem de Menções</h3>
          <div className="flex flex-wrap items-center justify-center gap-8 p-10 min-h-[300px] glass-item border-white/5 rounded-[3rem]">
            {WORD_CLOUD.map((word, i) => (
              <motion.span 
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.1, color: '#3b82f6' }}
                className={cn("font-black tracking-tighter cursor-default transition-all drop-shadow-lg", word.size, word.color.replace('text-', 'text-opacity-80 text-'))}
              >
                {word.text}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-12 glass-card border-white/5"
        >
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-black tracking-tighter text-white">Pautas da Semana</h3>
            <button className="text-blue-500 font-black text-[10px] uppercase tracking-[0.2em] hover:underline">Ver Todas</button>
          </div>
          <div className="space-y-6">
            {[
              { title: 'Inauguração Hospital Municipal', time: 'Amanhã, 10:00', status: 'confirmado', color: 'brand-emerald' },
              { title: 'Coletiva: Plano de Mobilidade', time: 'Quinta, 14:30', status: 'em_revisao', color: 'brand-amber' },
              { title: 'Live: Prestação de Contas Q1', time: 'Sexta, 19:00', status: 'pendente', color: 'brand-accent' },
            ].map((pauta, i) => (
              <motion.div 
                key={i} 
                whileHover={{ x: 10 }}
                className="flex items-center justify-between p-8 glass-item border-white/5 hover:border-blue-500/30 transition-all cursor-pointer rounded-[2.5rem] group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-blue-500/10 transition-colors">
                    <Calendar className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-white tracking-tight">{pauta.title}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">{pauta.time}</p>
                  </div>
                </div>
                <div className={cn("w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]", `bg-${pauta.color} text-${pauta.color}`)} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Calendar({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
  );
}
