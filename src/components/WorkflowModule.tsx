import { useState } from 'react';
import { 
  CheckSquare, Search, Plus, Edit2, 
  Trash2, Save, X, FileText, 
  Clock, CheckCircle2, AlertCircle,
  ChevronRight, User, Calendar,
  MoreVertical, Filter, Download, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Task {
  id: string;
  titulo: string;
  responsavel: string;
  prazo: string;
  status: 'pendente' | 'em_progresso' | 'concluido' | 'atrasado';
  prioridade: 'baixa' | 'media' | 'alta';
}

const MOCK_TASKS: Task[] = [
  {
    id: 'TSK-001',
    titulo: 'Revisão do Release da Saúde',
    responsavel: 'Gabriel Moura',
    prazo: '2024-03-25 18:00',
    status: 'em_progresso',
    prioridade: 'alta'
  },
  {
    id: 'TSK-002',
    titulo: 'Agendar Coletiva de Imprensa',
    responsavel: 'Ana Paula',
    prazo: '2024-03-26 10:00',
    status: 'pendente',
    prioridade: 'media'
  }
];

export function WorkflowModule({ isDarkMode }: { isDarkMode: boolean }) {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

  const statusColors = {
    pendente: "bg-slate-100 text-slate-600",
    em_progresso: "bg-blue-100 text-blue-600",
    concluido: "bg-emerald-100 text-emerald-600",
    atrasado: "bg-rose-100 text-rose-600"
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">
            Workflow & <span className="text-blue-600">Pautas</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Gestão de tarefas e fluxo de trabalho da equipe.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <Plus className="w-5 h-5" />
            Nova Tarefa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tasks.map((task, index) => (
          <motion.div 
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "p-8 rounded-[2.5rem] border transition-all hover:shadow-xl cursor-pointer group",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
            )}
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                <CheckSquare className="w-6 h-6" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", statusColors[task.status])}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {task.id}
                  </span>
                </div>
                <h3 className="text-xl font-black group-hover:text-blue-600 transition-colors">{task.titulo}</h3>
                
                <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{task.responsavel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{task.prazo}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 lg:pl-8 lg:border-l border-slate-100">
                <button className="p-4 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button className="p-4 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
                <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-blue-600 transition-all" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
