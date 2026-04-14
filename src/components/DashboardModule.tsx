import { ReactNode } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Inbox, Globe, FileSearch, TrendingUp, 
  FileText, ChevronRight, Activity, 
  AlertTriangle, CheckCircle2, Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { StatCard } from './StatCard';
import { cn } from '../lib/utils';

const SENTIMENT_DATA = [
  { name: 'Positivo', value: 65, color: '#10b981' },
  { name: 'Neutro', value: 20, color: '#94a3b8' },
  { name: 'Negativo', value: 15, color: '#f43f5e' },
];

const EVOLUTION_DATA = [
  { name: 'Seg', mencoes: 45, sentimento: 70 },
  { name: 'Ter', mencoes: 52, sentimento: 65 },
  { name: 'Qua', mencoes: 48, sentimento: 72 },
  { name: 'Qui', mencoes: 61, sentimento: 58 },
  { name: 'Sex', mencoes: 55, sentimento: 68 },
  { name: 'Sab', mencoes: 32, sentimento: 75 },
  { name: 'Dom', mencoes: 28, sentimento: 80 },
];

export function DashboardModule({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Visão <span className="text-brand-accent">Estratégica</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-2 max-w-2xl">Dados consolidados de todas as frentes da gestão.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm sm:text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 hover:shadow-md hover:-translate-y-0.5 transition transform duration-200">
            Exportar Relatório
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Demandas Ativas" value="24" icon={<Inbox className="w-5 h-5" />} color="blue" />
        <StatCard title="Menções Hoje" value="156" icon={<Globe className="w-5 h-5" />} color="emerald" />
        <StatCard title="Projetos em Análise" value="08" icon={<FileSearch className="w-5 h-5" />} color="amber" />
        <StatCard title="Saúde do Mandato" value="92%" icon={<TrendingUp className="w-5 h-5" />} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Chart */}
        <div className={cn(
          "flex flex-col rounded-2xl border border-slate-100 shadow-sm p-6",
          isDarkMode ? "bg-slate-900" : "bg-white"
        )}>
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Sentimento da Mídia</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SENTIMENT_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={70}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {SENTIMENT_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={30} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Insight Principal</p>
            <p className="text-sm font-medium text-slate-700 mt-1">Aprovação em alta devido ao programa TechRP.</p>
          </div>
        </div>

        {/* Evolution Chart */}
        <div className={cn(
          "lg:col-span-1 flex flex-col rounded-2xl border border-slate-100 shadow-sm p-6",
          isDarkMode ? "bg-slate-900" : "bg-white"
        )}>
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Evolução Semanal</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={EVOLUTION_DATA}>
                <defs>
                  <linearGradient id="colorMencoes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="mencoes" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMencoes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-5 border-t border-slate-100">
            <div className="flex gap-6">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Média Diária</p>
                <p className="text-lg font-extrabold">46.8</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Pico Semanal</p>
                <p className="text-lg font-extrabold text-brand-accent">61</p>
              </div>
            </div>
            <button className="text-brand-accent font-semibold text-sm hover:text-blue-800 hover:underline transition">Ver Detalhes</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cn(
          "lg:col-span-1 flex flex-col rounded-2xl border border-slate-100 shadow-sm p-6",
          isDarkMode ? "bg-slate-900" : "bg-white"
        )}>
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 hover:shadow-sm transition-all cursor-pointer group">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-brand-accent transition-all">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Novo release gerado: "Inauguração da Praça Central"</p>
                  <p className="text-xs text-slate-400 font-medium">Há 2 horas • Por Inteligência Artificial</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-accent transition-all" />
              </div>
            ))}
          </div>
        </div>

        <div className={cn(
          "flex flex-col rounded-2xl border border-slate-100 shadow-sm p-6",
          isDarkMode ? "bg-slate-900" : "bg-white"
        )}>
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Status de Demandas</h3>
          <div className="space-y-4">
            <StatusItem label="Em Aberto" value={12} total={24} color="blue" icon={<Clock className="w-4 h-4" />} />
            <StatusItem label="Em Execução" value={8} total={24} color="amber" icon={<Activity className="w-4 h-4" />} />
            <StatusItem label="Concluídas" value={4} total={24} color="emerald" icon={<CheckCircle2 className="w-4 h-4" />} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, value, total, color, icon }: { label: string, value: number, total: number, color: 'blue' | 'amber' | 'emerald', icon: ReactNode }) {
  const colors = {
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500"
  };

  const percentage = (value / total) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", 
            color === 'blue' ? "bg-blue-50 text-brand-accent" :
            color === 'amber' ? "bg-amber-50 text-amber-600" :
            "bg-emerald-50 text-emerald-600"
          )}>
            {icon}
          </div>
          <span className="font-bold text-sm">{label}</span>
        </div>
        <span className="text-sm font-black">{value}</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={cn("h-full", colors[color])}
        />
      </div>
    </div>
  );
}
