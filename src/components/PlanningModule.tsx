import { useState } from 'react';
import { 
  Calendar, Search, Plus, Edit2, 
  Trash2, Save, X, FileText, 
  Clock, CheckCircle2, AlertCircle,
  ChevronRight, ArrowRight, Target,
  TrendingUp, BarChart3, PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Milestone {
  id: string;
  titulo: string;
  data: string;
  status: 'pendente' | 'em_progresso' | 'concluido';
  progresso: number;
  descricao: string;
}

const MOCK_MILESTONES: Milestone[] = [
  {
    id: 'PLN-001',
    titulo: 'Lançamento do Programa TechRP',
    data: '2024-04-15',
    status: 'em_progresso',
    progresso: 65,
    descricao: 'Evento de lançamento e coletiva de imprensa com o prefeito.'
  },
  {
    id: 'PLN-002',
    titulo: 'Reforma da Praça Central',
    data: '2024-05-20',
    status: 'pendente',
    progresso: 0,
    descricao: 'Início das obras de revitalização e paisagismo.'
  }
];

export function PlanningModule({ isDarkMode }: { isDarkMode: boolean }) {
  const [milestones, setMilestones] = useState<Milestone[]>(MOCK_MILESTONES);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter">
            Planejamento <span className="text-brand-accent">Estratégico</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Linha do tempo e marcos fundamentais da gestão.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 px-6 py-4 bg-brand-accent text-white rounded-2xl font-bold hover:bg-brand-accent/90 transition-all shadow-lg shadow-blue-500/20">
            <Plus className="w-5 h-5" />
            Novo Marco
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-1 space-y-8">
          {milestones.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-10 rounded-[3rem] shadow-xl border transition-all relative overflow-hidden",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
              )}
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                <div className="flex flex-col items-center justify-center w-20 h-20 bg-blue-50 text-brand-accent rounded-3xl font-black shrink-0">
                  <span className="text-xs uppercase">{item.data.split('-')[1]}</span>
                  <span className="text-2xl">{item.data.split('-')[2]}</span>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                      item.status === 'concluido' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-brand-accent"
                    )}>
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {item.id}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-black">{item.titulo}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{item.descricao}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                      <span className="text-slate-400">Progresso</span>
                      <span>{item.progresso}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progresso}%` }}
                        className="h-full bg-brand-accent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 lg:pl-8 lg:border-l border-slate-100">
                  <button className="p-4 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-brand-accent rounded-2xl transition-all">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button className="p-4 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-8">
          <div className={cn(
            "p-10 rounded-[2.5rem] shadow-xl",
            isDarkMode ? "bg-slate-900" : "bg-white"
          )}>
            <h3 className="text-2xl font-black mb-6">Resumo do Plano</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">Marcos Concluídos</span>
                <span className="text-sm font-black">12/45</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-1/4 bg-emerald-500" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Atraso de 5% em relação ao cronograma original.</p>
            </div>
          </div>

          <div className="p-10 rounded-[2.5rem] shadow-xl bg-indigo-600 text-white">
            <Target className="w-12 h-12 mb-6 opacity-50" />
            <h3 className="text-2xl font-black mb-2">Foco da Semana</h3>
            <p className="text-indigo-100 font-medium leading-relaxed mb-6">
              O foco principal desta semana é a finalização do projeto executivo da Praça Central.
            </p>
            <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all">
              Ver Detalhes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
