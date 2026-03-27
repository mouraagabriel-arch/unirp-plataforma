import { useState } from 'react';
import { 
  Layout, Plus, Search, 
  Filter, MoreVertical, Clock, 
  User, MessageSquare, CheckCircle2, 
  AlertCircle, ArrowRight, Landmark,
  Calendar, Users, Zap,
  ChevronRight, Edit2, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const MOCK_COLUMNS = [
  { id: 'todo', title: 'A Fazer', color: 'bg-slate-100 text-slate-600' },
  { id: 'doing', title: 'Em Execução', color: 'bg-blue-100 text-blue-600' },
  { id: 'review', title: 'Revisão/Jurídico', color: 'bg-amber-100 text-amber-600' },
  { id: 'done', title: 'Concluído', color: 'bg-emerald-100 text-emerald-600' },
];

const MOCK_TASKS = [
  { id: '1', title: 'Redigir PL da Creche', column: 'doing', priority: 'Alta', category: 'Legislativo', assignee: 'Dra. Helena' },
  { id: '2', title: 'Oficiar Secretaria de Obras', column: 'todo', priority: 'Média', category: 'Gabinete', assignee: 'Ricardo' },
  { id: '3', title: 'Parecer Jurídico PL 145', column: 'review', priority: 'Alta', category: 'Jurídico', assignee: 'Dr. Marcos' },
  { id: '4', title: 'Postagem Visita Vila Nova', column: 'done', priority: 'Baixa', category: 'Comunicação', assignee: 'Bia' },
  { id: '5', title: 'Reunião com Liderança Centro', column: 'todo', priority: 'Média', category: 'Relacionamento', assignee: 'Vereador' },
];

export function GabineteWorkflow({ isDarkMode }: { isDarkMode: boolean }) {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [activeTab, setActiveTab] = useState('kanban');

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">
            Workflow e <span className="text-blue-600">Pautas</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Gestão de tarefas legislativas e agenda de sessões/comissões.</p>
        </div>
        
        <div className="flex gap-4">
          <button className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <Plus className="w-5 h-5" />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 p-2 bg-slate-100 rounded-[2rem] w-fit">
        {[
          { id: 'kanban', label: 'Kanban Legislativo', icon: Layout },
          { id: 'agenda', label: 'Agenda de Sessões', icon: Calendar },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all",
              activeTab === tab.id 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'kanban' ? (
          <motion.div 
            key="kanban"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {MOCK_COLUMNS.map((column) => (
              <div key={column.id} className="space-y-6">
                <div className={cn(
                  "p-4 rounded-2xl flex items-center justify-between",
                  column.color
                )}>
                  <h3 className="text-sm font-black uppercase tracking-widest">{column.title}</h3>
                  <span className="text-xs font-black px-2 py-0.5 bg-white/50 rounded-lg">
                    {tasks.filter(t => t.column === column.id).length}
                  </span>
                </div>

                <div className="space-y-4">
                  {tasks.filter(t => t.column === column.id).map((task) => (
                    <div 
                      key={task.id}
                      className={cn(
                        "p-6 rounded-[2rem] border transition-all cursor-pointer group hover:shadow-lg",
                        isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50 shadow-sm"
                      )}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <span className={cn(
                          "text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest",
                          task.priority === 'Alta' ? "bg-rose-100 text-rose-600" :
                          task.priority === 'Média' ? "bg-amber-100 text-amber-600" :
                          "bg-emerald-100 text-emerald-600"
                        )}>
                          {task.priority}
                        </span>
                        <button className="p-1 text-slate-300 hover:text-slate-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-black text-sm text-slate-800 mb-4">{task.title}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-slate-400" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.assignee}</span>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{task.category}</span>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Adicionar</span>
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="agenda"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Agenda de Sessões */}
            <div className={cn(
              "lg:col-span-2 p-10 rounded-[3rem] shadow-xl border space-y-8",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black">Próximas Sessões</h3>
                </div>
                <div className="flex gap-2">
                  <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 border border-slate-100">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { title: 'Sessão Ordinária', date: '26 Mar, 14:00', type: 'Plenário', status: 'Confirmado' },
                  { title: 'Comissão de Saúde', date: '27 Mar, 09:00', type: 'Comissão', status: 'Confirmado' },
                  { title: 'Audiência Pública: Orçamento', date: '28 Mar, 19:00', type: 'Audiência', status: 'Aguardando' },
                ].map((session, i) => (
                  <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between hover:border-blue-200 transition-all cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-white rounded-2xl flex flex-col items-center justify-center shadow-sm">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{session.date.split(' ')[1]}</span>
                        <span className="text-xl font-black text-slate-800">{session.date.split(' ')[0]}</span>
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-800">{session.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{session.type}</span>
                          <div className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{session.date.split(', ')[1]}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest",
                        session.status === 'Confirmado' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                      )}>
                        {session.status}
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alertas IA */}
            <div className={cn(
              "lg:col-span-1 p-10 rounded-[3rem] shadow-xl border space-y-8 bg-indigo-600 text-white border-indigo-500",
              isDarkMode ? "bg-slate-900 border-slate-800" : ""
            )}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black">Alertas IA</h3>
              </div>
              
              <div className="space-y-6">
                <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10">
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-2">Conflito de Agenda</p>
                  <p className="text-sm font-bold leading-relaxed">
                    A Comissão de Saúde coincide com a visita técnica agendada no Bairro Alto. Sugerimos reagendar a visita.
                  </p>
                </div>
                <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10">
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-2">Pauta Prioritária</p>
                  <p className="text-sm font-bold leading-relaxed">
                    O PL 145 será votado amanhã. O roteiro de fala já está disponível no Arsenal de Embate.
                  </p>
                </div>
              </div>

              <button className="w-full py-5 bg-white text-indigo-600 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/20">
                Otimizar Agenda
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
