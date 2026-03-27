import { useState } from 'react';
import { 
  BarChart3, TrendingUp, AlertCircle, 
  Users, Activity, MapPin, 
  MessageSquare, Calendar, ChevronRight,
  ArrowUpRight, ArrowDownRight, Zap,
  ThumbsUp, ThumbsDown, Landmark
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePie, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

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

export function GabineteDashboard({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="space-y-12 pb-20 overflow-x-hidden min-h-full">
      {/* Header com Termômetro e Alertas */}
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        <div className="flex-1">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl font-black tracking-tighter leading-none text-white"
          >
            Painel <span className="text-brand-accent underline decoration-brand-accent/30 decoration-8 underline-offset-8">Central</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 font-bold mt-8 text-xl max-w-2xl leading-relaxed"
          >
            Monitoramento em tempo real da performance política, aprovação popular e gestão de demandas territoriais com inteligência preditiva.
          </motion.p>
        </div>
        
        <div className="flex flex-wrap gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6 px-10 py-8 glass-card neon-glow-emerald border-brand-emerald/20"
          >
            <div className="w-14 h-14 bg-brand-emerald/20 border border-brand-emerald/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <TrendingUp className="w-7 h-7 text-brand-emerald" />
            </div>
            <div>
              <p className="text-[10px] font-black text-brand-emerald uppercase tracking-[0.2em] mb-1">Aprovação</p>
              <p className="text-4xl font-black text-white leading-none">72%</p>
              <p className="text-[10px] font-bold text-brand-emerald/70 mt-2 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> 2.4% este mês
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-6 px-10 py-8 glass-card neon-glow-rose border-brand-rose/20"
          >
            <div className="w-14 h-14 bg-brand-rose/20 border border-brand-rose/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.2)]">
              <AlertCircle className="w-7 h-7 text-brand-rose" />
            </div>
            <div>
              <p className="text-[10px] font-black text-brand-rose uppercase tracking-[0.2em] mb-1">Risco Crise</p>
              <p className="text-2xl font-black text-white leading-tight">Taxa do Lixo</p>
              <p className="text-[10px] font-bold text-brand-rose/70 mt-2">Votação amanhã</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Grid - More Political Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Base Eleitoral', value: '18.4K', trend: '+450', up: true, icon: Users, color: 'brand-accent', desc: 'Eleitores mapeados' },
          { label: 'Demandas Totais', value: '1.2K', trend: '85% ok', up: true, icon: MessageSquare, color: 'brand-emerald', desc: 'Taxa de resolução' },
          { label: 'Presença Digital', value: '45.2K', trend: '+15%', up: true, icon: Activity, color: 'brand-accent', desc: 'Alcance orgânico' },
          { label: 'Saldo Político', value: 'Positivo', trend: 'Estável', up: true, icon: Landmark, color: 'brand-amber', desc: 'Relação com base' },
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
              <Zap className="w-3 h-3 text-brand-accent" />
              {stat.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Termômetro de Aprovação - Unique View */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-4 p-12 glass-card flex flex-col border-white/5"
        >
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-3xl font-black tracking-tighter text-white">Termômetro Popular</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Sentimento das ruas</p>
            </div>
            <div className="p-3 bg-brand-emerald/10 rounded-xl">
              <ThumbsUp className="w-6 h-6 text-brand-emerald" />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="128" cy="128" r="110" stroke="currentColor" strokeWidth="24" fill="transparent" className="text-white/5" />
                <motion.circle 
                  initial={{ strokeDashoffset: 691 }}
                  animate={{ strokeDashoffset: 691 - (691 * 72) / 100 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  cx="128" cy="128" r="110" stroke="currentColor" strokeWidth="24" fill="transparent" 
                  strokeDasharray={691}
                  strokeLinecap="round"
                  className="text-brand-emerald drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-7xl font-black tracking-tighter text-white">72%</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Aprovação</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12">
            <div className="text-center group">
              <p className="text-2xl font-black text-brand-emerald group-hover:scale-110 transition-transform">72%</p>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Favorável</p>
            </div>
            <div className="text-center border-x border-white/5 group">
              <p className="text-2xl font-black text-brand-rose group-hover:scale-110 transition-transform">18%</p>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Contrário</p>
            </div>
            <div className="text-center group">
              <p className="text-2xl font-black text-brand-amber group-hover:scale-110 transition-transform">10%</p>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Neutro</p>
            </div>
          </div>
        </motion.div>

        {/* Mídia Online & Sentimento - New from screenshots */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-8 p-12 glass-card border-white/5"
        >
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-3xl font-black tracking-tighter text-white">Mídia Online & Sentimento</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Análise de menções e alcance digital</p>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 glass-item text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent border-brand-accent/30 hover:bg-brand-accent/10 transition-all">Urgência</button>
              <button className="p-3 glass-item text-slate-400 hover:text-white transition-all"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col items-center justify-center relative">
              <div className="relative w-64 h-64">
                <RePie width={256} height={256}>
                  <Pie
                    data={[
                      { name: 'Positivo', value: 432, color: '#10b981' },
                      { name: 'Neutro', value: 267, color: '#6366f1' },
                      { name: 'Negativo', value: 124, color: '#f43f5e' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {[
                      { color: '#10b981' },
                      { color: '#6366f1' },
                      { color: '#f43f5e' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="stroke-none" />
                    ))}
                  </Pie>
                </RePie>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-white tracking-tighter">823</span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Menções</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-10 gap-y-4 mt-10 w-full">
                {[
                  { label: 'Portais', value: 432, color: 'brand-emerald' },
                  { label: 'Twitter', value: 267, color: 'brand-accent' },
                  { label: 'TV / Rádio', value: 124, color: 'brand-rose' },
                  { label: 'Instagram', value: 85, color: 'brand-amber' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 glass-item border-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2.5 h-2.5 rounded-full", `bg-${item.color}`)} />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                    </div>
                    <span className="text-[11px] font-black text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-10">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Redes Sociais Impacto</h4>
              <div className="space-y-8">
                {[
                  { label: 'Alcance Orgânico', value: 345, color: '#6366f1', max: 500 },
                  { label: 'Engajamento Médio', value: 78, color: '#10b981', max: 100 },
                  { label: 'Compartilhamentos', value: 757, color: '#f59e0b', max: 1000 },
                ].map((item, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-black">
                      <span className="text-slate-400 uppercase tracking-widest">{item.label}</span>
                      <span className="text-white">{item.value}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.value / item.max) * 100}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="mt-10 p-8 glass-item border-brand-accent/20 bg-brand-accent/5 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Zap className="w-16 h-16 text-brand-accent" />
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-brand-accent/20 rounded-lg">
                    <Activity className="w-5 h-5 text-brand-accent" />
                  </div>
                  <p className="text-[10px] font-black text-brand-accent uppercase tracking-[0.2em]">Insights de IA</p>
                </div>
                <p className="text-sm font-bold text-slate-300 leading-relaxed">
                  Crescimento de <span className="text-brand-emerald font-black">12%</span> em menções positivas após o último posicionamento sobre educação. <span className="text-brand-accent underline decoration-brand-accent/30">Ver relatório completo</span>
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Heatmap Section - Updated Visual */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-12 glass-card border-white/5"
      >
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-3xl font-black tracking-tighter text-white">Mapa de Calor de Demandas</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Concentração de pedidos por território</p>
          </div>
          <button className="px-8 py-4 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-all rounded-2xl">
            Expandir Mapa
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="h-[500px] glass-item relative overflow-hidden group rounded-[3rem] border-white/5">
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80')] bg-cover grayscale invert" />
            
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-1/4 left-1/3 w-64 h-64 bg-brand-rose/30 blur-[80px] rounded-full" 
            />
            <motion.div 
              animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-brand-amber/20 blur-[100px] rounded-full" 
            />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="p-8 glass-card bg-brand-surface/90 border-brand-rose/30 text-center shadow-[0_0_50px_rgba(244,63,94,0.2)] backdrop-blur-2xl"
              >
                <div className="w-12 h-12 bg-brand-rose/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-brand-rose" />
                </div>
                <p className="text-[10px] font-black text-brand-rose uppercase tracking-[0.2em] mb-1">Zona Crítica</p>
                <p className="text-3xl font-black text-white tracking-tighter">Vila Nova</p>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">145 Demandas Ativas</p>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-6">
              {DEMANDS_BY_NEIGHBORHOOD.map((item, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ x: 5 }}
                  className="p-8 glass-item border-white/5 hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-black text-white tracking-tight">{item.neighborhood}</span>
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{item.count}</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / 150) * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full rounded-full shadow-lg" 
                      style={{ backgroundColor: item.color }} 
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="p-10 glass-item border-brand-rose/20 bg-brand-rose/5 rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-5">
                <AlertCircle className="w-48 h-48 text-brand-rose" />
              </div>
              <div className="flex items-center gap-5 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-brand-rose/20 flex items-center justify-center shadow-lg">
                  <AlertCircle className="w-7 h-7 text-brand-rose" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-brand-rose uppercase tracking-[0.2em] mb-1">Alerta de Território</p>
                  <p className="text-xl font-black text-white tracking-tighter">Crise em Vila Nova</p>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-md">
                O bairro <span className="text-white font-black">Vila Nova</span> concentra 40% das reclamações de infraestrutura. Recomendamos agenda de rua imediata para conter desgaste e apresentar soluções.
              </p>
              <button className="mt-8 px-8 py-4 bg-brand-rose text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-brand-rose/20">
                Gerar Plano de Ação
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
