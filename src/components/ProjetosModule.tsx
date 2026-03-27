import { useState } from 'react';
import { 
  FileSearch, Search, Filter, Plus, 
  ChevronRight, FileText, TrendingUp,
  AlertTriangle, CheckCircle2, Clock,
  BarChart3, PieChart, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Projeto {
  id: string;
  titulo: string;
  autor: string;
  data: string;
  status: 'em_analise' | 'aprovado' | 'rejeitado' | 'arquivado';
  impacto: 'baixo' | 'medio' | 'alto';
  categoria: string;
  resumo: string;
}

const PROJETOS_MOCK: Projeto[] = [
  {
    id: 'PL-001/2024',
    titulo: 'Programa de Incentivo à Tecnologia Local',
    autor: 'Gabinete Digital',
    data: '2024-03-20',
    status: 'em_analise',
    impacto: 'alto',
    categoria: 'Desenvolvimento',
    resumo: 'Cria incentivos fiscais para startups que se instalarem no município.'
  },
  {
    id: 'PL-002/2024',
    titulo: 'Reforma do Código de Posturas',
    autor: 'Secretaria de Urbanismo',
    data: '2024-03-18',
    status: 'aprovado',
    impacto: 'medio',
    categoria: 'Urbanismo',
    resumo: 'Atualiza as normas de convivência e uso do espaço público.'
  },
  {
    id: 'PL-003/2024',
    titulo: 'Criação do Parque Linear Norte',
    autor: 'Gabinete Digital',
    data: '2024-03-15',
    status: 'rejeitado',
    impacto: 'alto',
    categoria: 'Meio Ambiente',
    resumo: 'Projeto de revitalização da margem do rio com ciclovias e áreas de lazer.'
  }
];

export function ProjetosModule({ isDarkMode }: { isDarkMode: boolean }) {
  const [filter, setFilter] = useState('todos');

  const statusColors = {
    em_analise: "bg-blue-100 text-blue-600",
    aprovado: "bg-emerald-100 text-emerald-600",
    rejeitado: "bg-rose-100 text-rose-600",
    arquivado: "bg-slate-100 text-slate-600"
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">
            Análise de <span className="text-blue-600">Projetos</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Monitoramento e análise técnica de proposições legislativas.</p>
        </div>
        
        <button className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
          <Plus className="w-5 h-5" />
          <span>Novo Projeto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={cn("p-8 rounded-[2rem] border", isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100")}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total de Projetos</p>
          <p className="text-3xl font-black">124</p>
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-blue-500" />
          </div>
        </div>
        <div className={cn("p-8 rounded-[2rem] border", isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100")}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Aprovados (Mês)</p>
          <p className="text-3xl font-black text-emerald-600">12</p>
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-emerald-500" />
          </div>
        </div>
        <div className={cn("p-8 rounded-[2rem] border", isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100")}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Em Análise</p>
          <p className="text-3xl font-black text-amber-600">08</p>
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-1/4 bg-amber-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {PROJETOS_MOCK.map((projeto, index) => (
          <motion.div
            key={projeto.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "p-8 rounded-[2.5rem] border transition-all hover:shadow-xl cursor-pointer group",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
            )}
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                <FileText className="w-8 h-8" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", statusColors[projeto.status])}>
                    {projeto.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {projeto.id}
                  </span>
                </div>
                <h3 className="text-xl font-black">{projeto.titulo}</h3>
                <p className="text-sm text-slate-500 font-medium line-clamp-1">{projeto.resumo}</p>
              </div>

              <div className="flex items-center gap-8 lg:pl-8 lg:border-l border-slate-100">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Impacto</p>
                  <p className={cn(
                    "font-black uppercase text-sm",
                    projeto.impacto === 'alto' ? "text-rose-600" : "text-amber-600"
                  )}>{projeto.impacto}</p>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-blue-600 transition-all" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
