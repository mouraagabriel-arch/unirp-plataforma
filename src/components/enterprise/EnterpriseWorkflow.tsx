import { useState } from 'react';
import { 
  Trello, Plus, MoreVertical, Edit2, 
  Trash2, Search, Filter, Calendar,
  Clock, User, CheckCircle2, AlertCircle,
  ChevronRight, ArrowRight, X, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'alta' | 'media' | 'baixa';
  assignee: string;
  dueDate: string;
  tags: string[];
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const MOCK_COLUMNS: Column[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    tasks: [
      { id: '1', title: 'Revisar Release de Obras', description: 'Ajustar o tom para ser mais institucional.', priority: 'media', assignee: 'Ana Paula', dueDate: '26 Mar', tags: ['Release', 'Obras'] },
      { id: '2', title: 'Mapear Influenciadores Sul', description: 'Identificar perfis com mais de 10k seguidores.', priority: 'baixa', assignee: 'Ricardo', dueDate: '28 Mar', tags: ['Social'] },
    ]
  },
  {
    id: 'doing',
    title: 'Fazendo',
    tasks: [
      { id: '3', title: 'Resposta de Crise: Greve', description: 'Elaborar nota oficial sobre a paralisação.', priority: 'alta', assignee: 'Juliana', dueDate: 'Hoje', tags: ['Crise', 'Saúde'] },
      { id: '4', title: 'Planejamento Festival Inverno', description: 'Definir cronograma de postagens.', priority: 'media', assignee: 'Marcos', dueDate: '30 Mar', tags: ['Cultura'] },
    ]
  },
  {
    id: 'review',
    title: 'Revisão',
    tasks: [
      { id: '5', title: 'Pesquisa de Clima Q1', description: 'Consolidar dados da última pesquisa.', priority: 'media', assignee: 'Ana Paula', dueDate: 'Ontem', tags: ['Interno'] },
    ]
  },
  {
    id: 'done',
    title: 'Concluído',
    tasks: [
      { id: '6', title: 'Inauguração Posto Central', description: 'Cobertura completa realizada.', priority: 'alta', assignee: 'Ricardo', dueDate: '24 Mar', tags: ['Evento'] },
    ]
  }
];

export function EnterpriseWorkflow({ isDarkMode }: { isDarkMode: boolean }) {
  const [columns, setColumns] = useState<Column[]>(MOCK_COLUMNS);
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">
            Workflow & <span className="text-blue-600">Pautas</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Gestão ágil das tarefas da assessoria.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" />
            Novo Card
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-8 overflow-x-auto pb-8 min-h-[700px]">
        {columns.map((column) => (
          <div key={column.id} className="w-[350px] shrink-0 space-y-6">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-black">{column.title}</h3>
                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {column.tasks.length}
                </span>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <Plus className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className={cn(
              "p-4 rounded-[2.5rem] min-h-[600px] space-y-4",
              isDarkMode ? "bg-slate-900/50 border border-slate-800" : "bg-slate-50/50 border border-slate-100"
            )}>
              {column.tasks.map((task) => (
                <motion.div 
                  key={task.id}
                  layoutId={task.id}
                  className={cn(
                    "p-6 rounded-[2rem] shadow-sm border transition-all hover:shadow-xl hover:scale-[1.02] cursor-grab active:cursor-grabbing group",
                    isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                      task.priority === 'alta' ? "bg-rose-100 text-rose-600" : 
                      task.priority === 'media' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                    )}>
                      {task.priority}
                    </span>
                    <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-slate-50 rounded-xl transition-all">
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  <h4 className="text-lg font-black mb-2 leading-tight">{task.title}</h4>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6 line-clamp-2">
                    {task.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {task.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">#{tag}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black text-slate-400">
                        {task.assignee.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-400">{task.assignee}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-bold">{task.dueDate}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* New Card Modal Placeholder */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-2xl p-12 rounded-[3rem] shadow-2xl relative",
                isDarkMode ? "bg-slate-900" : "bg-white"
              )}
            >
              <button 
                onClick={() => setIsAdding(false)}
                className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-2xl transition-all"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
              
              <h2 className="text-4xl font-black mb-10">Nova Tarefa</h2>
              
              <div className="space-y-8 mb-10">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Título da Tarefa</label>
                  <input type="text" className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-bold border-none outline-none" placeholder="Ex: Revisar release..." />
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Responsável</label>
                    <select className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-bold text-slate-600 border-none outline-none appearance-none">
                      <option>Ana Paula</option>
                      <option>Ricardo</option>
                      <option>Juliana</option>
                      <option>Marcos</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Prioridade</label>
                    <select className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-bold text-slate-600 border-none outline-none appearance-none">
                      <option>Baixa</option>
                      <option>Média</option>
                      <option>Alta</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Descrição</label>
                  <textarea className="w-full h-32 px-8 py-6 bg-slate-50 rounded-2xl font-medium border-none outline-none resize-none" placeholder="Detalhes da tarefa..." />
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3">
                  <Save className="w-5 h-5" />
                  Criar Card
                </button>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="px-10 py-5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
