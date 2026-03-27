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
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">
            Visão <span className="text-blue-600">Estratégica</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Dados consolidados de todas as frentes da gestão.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm">
            Exportar Relatório
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Demandas Ativas" value="24" icon={<Inbox className="w-6 h-6" />} color="blue" />
        <StatCard title="Menções Hoje" value="156" icon={<Globe className="w-6 h-6" />} color="emerald" />
        <StatCard title="Projetos em Análise" value="08" icon={<FileSearch className="w-6 h-6" />} color="amber" />
        <StatCard title="Saúde do Mandato" value="92%" icon={<TrendingUp className="w-6 h-6" />} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sentiment Chart */}
        <div className={cn(
          "p-10 rounded-[2.5rem] shadow-xl flex flex-col",
          isDarkMode ? "bg-slate-900" : "bg-white"
        )}>
          <h3 className="text-2xl font-black mb-8">Sentimento da Mídia</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SENTIMENT_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {SENTIMENT_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Insight Principal</p>
            <p className="text-sm font-medium text-slate-700">Aprovação em alta devido ao programa TechRP.</p>
          </div>
        </div>

        {/* Evolution Chart */}
        <div className={cn(
          "lg:col-span-2 p-10 rounded-[2.5rem] shadow-xl flex flex-col",
          isDarkMode ? "bg-slate-900" : "bg-white"
        )}>
          <h3 className="text-2xl font-black mb-8">Evolução Semanal</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={EVOLUTION_DATA}>
                <defs>
                  <linearGradient id="colorMencoes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="mencoes" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorMencoes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100">
            <div className="flex gap-8">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Média Diária</p>
                <p className="text-xl font-black">46.8</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pico Semanal</p>
                <p className="text-xl font-black text-blue-600">61</p>
              </div>
            </div>
            <button className="text-blue-600 font-bold text-sm hover:underline">Ver Detalhes</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={cn(
          "lg:col-span-2 p-10 rounded-[2.5rem] shadow-xl",
          isDarkMode ? "bg-slate-900" : "bg-white"
        )}>
          <h3 className="text-2xl font-black mb-6">Atividade Recente</h3>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-6 p-4 rounded-3xl hover:bg-slate-50 transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">Novo release gerado: "Inauguração da Praça Central"</p>
                  <p className="text-xs text-slate-400 font-medium">Há 2 horas • Por Inteligência Artificial</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-all" />
              </div>
            ))}
          </div>
        </div>

        <div className={cn(
          "p-10 rounded-[2.5rem] shadow-xl",
          isDarkMode ? "bg-slate-900" : "bg-white"
        )}>
          <h3 className="text-2xl font-black mb-6">Status de Demandas</h3>
          <div className="space-y-6">
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
            color === 'blue' ? "bg-blue-50 text-blue-600" :
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
