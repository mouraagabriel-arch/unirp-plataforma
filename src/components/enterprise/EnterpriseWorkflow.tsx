import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../supabaseClient';
import {
  Bell,
  CalendarDays,
  FileUp,
  MoreHorizontal,
  Paperclip,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useTenantService } from '../../services/useTenantService';

interface ChecklistItem {
  texto: string;
  checked: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'alta' | 'media' | 'baixa';
  assignee: string;
  dueDate: string; // ISO date YYYY-MM-DD
  tags: string[];
  attachments: number;
  checklist: ChecklistItem[];
}

interface Column {
  id: 'backlog' | 'doing' | 'review' | 'done';
  title: string;
  tasks: Task[];
}

const INITIAL_COLUMNS: Column[] = [
  { id: 'backlog', title: 'Ideação', tasks: [] },
  { id: 'doing', title: 'Em Redação', tasks: [] },
  { id: 'review', title: 'Aguardando Aprovação', tasks: [] },
  { id: 'done', title: 'Concluído', tasks: [] },
];

const COLUMN_LABEL: Record<Column['id'], string> = {
  backlog: 'Ideação',
  doing: 'Em Redação',
  review: 'Aguardando Aprovação',
  done: 'Concluído',
};

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { texto: 'Briefing aprovado', checked: false },
  { texto: 'Prazo validado', checked: false },
  { texto: 'Risco mapeado', checked: false },
];

const EMPTY_TASK: Task = {
  id: '',
  title: '',
  description: '',
  priority: 'media',
  assignee: '',
  dueDate: '',
  tags: ['Pauta'],
  attachments: 0,
  checklist: DEFAULT_CHECKLIST,
};

export function EnterpriseWorkflow({ isDarkMode }: { isDarkMode: boolean }) {
  const tenantService = useTenantService();
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState<Task>(EMPTY_TASK);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskColumn, setTaskColumn] = useState<Column['id']>('backlog');
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [draggingFromColumn, setDraggingFromColumn] = useState<Column['id'] | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Column['id'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carrega pautas do Supabase na montagem
  useEffect(() => {
    const load = async () => {
      const { data, error } = await tenantService
        .from('enterprise_pautas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error(`Erro ao carregar pautas: ${error.message}`);
        setIsLoading(false);
        return;
      }

      const rows = data ?? [];
      setColumns(INITIAL_COLUMNS.map((col) => ({
        ...col,
        tasks: rows
          .filter((row) => row.status_coluna === col.id)
          .map((row) => ({
            id: row.id,
            title: row.titulo,
            description: row.descricao ?? '',
            priority: row.prioridade as Task['priority'],
            assignee: row.responsavel ?? '',
            dueDate: row.deadline ?? row.prazo_texto ?? '',
            tags: Array.isArray(row.tags) ? row.tags : [],
            attachments: row.attachments ?? 0,
            checklist: Array.isArray(row.checklist) ? (row.checklist as ChecklistItem[]) : DEFAULT_CHECKLIST.map((i) => ({ ...i })),
          })),
      })));
      setIsLoading(false);
    };

    void load();
  }, []);

  const openNewTask = (columnId: Column['id'] = 'backlog') => {
    setTaskForm({ ...EMPTY_TASK, checklist: DEFAULT_CHECKLIST.map((i) => ({ ...i })) });
    setTaskColumn(columnId);
    setEditingTaskId(null);
    setActiveDropdown(null);
    setAttachedFiles([]);
    setIsTaskModalOpen(true);
  };

  const openEditTask = (task: Task, columnId: Column['id']) => {
    setTaskForm(task);
    setTaskColumn(columnId);
    setEditingTaskId(task.id);
    setActiveDropdown(null);
    setAttachedFiles([]);
    setIsTaskModalOpen(true);
  };

  const duplicateTask = async (task: Task, columnId: Column['id']) => {
    const payload = {
      titulo: `${task.title} [Cópia]`,
      descricao: task.description,
      prioridade: task.priority,
      responsavel: task.assignee,
      tags: task.tags,
      status_coluna: columnId,
      deadline: task.dueDate || null,
      checklist: task.checklist,
    };

    const { data, error } = await tenantService
      .from('enterprise_pautas')
      .insert([payload])
      .select();

    if (error) {
      toast.error(`Erro ao duplicar: ${error.message}`);
      return;
    }

    if (!data?.length) return;

    const saved = data[0];
    const newTask: Task = {
      id: saved.id,
      title: saved.titulo,
      description: saved.descricao ?? '',
      priority: saved.prioridade as Task['priority'],
      assignee: saved.responsavel ?? '',
      dueDate: saved.deadline ?? '',
      tags: Array.isArray(saved.tags) ? saved.tags : [],
      attachments: saved.attachments ?? 0,
      checklist: Array.isArray(saved.checklist) ? saved.checklist : DEFAULT_CHECKLIST.map((i) => ({ ...i })),
    };

    setColumns((prev) => prev.map((column) => (
      column.id === columnId ? { ...column, tasks: [newTask, ...column.tasks] } : column
    )));
    setActiveDropdown(null);
    toast.success('Card duplicado com sucesso!');
  };

  const handleDropTask = async (targetColumnId: Column['id']) => {
    if (!draggingTaskId || !draggingFromColumn || draggingFromColumn === targetColumnId) {
      setDraggingTaskId(null);
      setDraggingFromColumn(null);
      return;
    }

    const previousColumns = columns;
    const sourceColumn = previousColumns.find((column) => column.id === draggingFromColumn);
    const movedTask = sourceColumn?.tasks.find((task) => task.id === draggingTaskId);

    if (!movedTask) {
      setDraggingTaskId(null);
      setDraggingFromColumn(null);
      return;
    }

    setColumns((prev) => prev.map((column) => {
      if (column.id === draggingFromColumn) {
        return { ...column, tasks: column.tasks.filter((task) => task.id !== draggingTaskId) };
      }
      if (column.id === targetColumnId) {
        return { ...column, tasks: [{ ...movedTask }, ...column.tasks] };
      }
      return column;
    }));

    const { error } = await tenantService
      .from('enterprise_pautas')
      .update({ status_coluna: targetColumnId })
      .eq('id', draggingTaskId);

    if (error) {
      console.error('[Workflow] Erro ao mover card:', error);
      toast.error(`Erro ao mover card: ${error.message}`);
      setColumns(previousColumns);
    } else {
      toast.success(`Status atualizado para "${COLUMN_LABEL[targetColumnId]}"`);
    }

    setDraggingTaskId(null);
    setDraggingFromColumn(null);
    setDragOverColumn(null);
  };

  const deleteTask = async (taskId: string, columnId: Column['id']) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      toast(
        (t) => (
          <div className="flex flex-col gap-3">
            <p className="font-bold text-sm">Excluir este card?</p>
            <div className="flex gap-2">
              <button
                onClick={() => { toast.dismiss(t.id); resolve(true); }}
                className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold"
              >
                Excluir
              </button>
              <button
                onClick={() => { toast.dismiss(t.id); resolve(false); }}
                className="px-3 py-1.5 bg-white/10 text-slate-200 rounded-lg text-xs font-bold"
              >
                Cancelar
              </button>
            </div>
          </div>
        ),
        { duration: 8000 },
      );
    });

    if (!confirmed) return;

    const { error } = await tenantService
      .from('enterprise_pautas')
      .delete()
      .eq('id', taskId);

    if (error) {
      toast.error(`Erro ao excluir: ${error.message}`);
      return;
    }

    setColumns((prev) => prev.map((column) => (
      column.id === columnId
        ? { ...column, tasks: column.tasks.filter((task) => task.id !== taskId) }
        : column
    )));
    setActiveDropdown(null);
    toast.success('Card excluído.');
  };

  const uploadAttachments = async (taskId: string): Promise<number> => {
    if (!attachedFiles.length) return 0;
    let uploaded = 0;
    for (const file of attachedFiles) {
      const path = `enterprise_pautas/${taskId}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('attachments').upload(path, file, { upsert: true });
      if (!error) uploaded++;
    }
    return uploaded;
  };

  const handleSaveTask = async () => {
    if (!taskForm.title.trim()) return;

    setIsUploading(true);

    const basePayload = {
      titulo: taskForm.title,
      descricao: taskForm.description,
      prioridade: taskForm.priority,
      responsavel: taskForm.assignee,
      tags: taskForm.tags,
      status_coluna: taskColumn,
      deadline: taskForm.dueDate || null,
      checklist: taskForm.checklist,
    };

    if (editingTaskId) {
      const uploadedCount = await uploadAttachments(editingTaskId);

      const { error } = await tenantService
        .from('enterprise_pautas')
        .update({
          ...basePayload,
          attachments: taskForm.attachments + uploadedCount,
        })
        .eq('id', editingTaskId);

      setIsUploading(false);

      if (error) {
        toast.error(`Erro ao atualizar: ${error.message}`);
        return;
      }

      const updatedTask: Task = {
        ...taskForm,
        id: editingTaskId,
        attachments: taskForm.attachments + uploadedCount,
      };

      setColumns((prev) => prev.map((column) => {
        const filteredTasks = column.tasks.filter((task) => task.id !== editingTaskId);
        if (column.id === taskColumn) {
          return { ...column, tasks: [updatedTask, ...filteredTasks] };
        }
        return { ...column, tasks: filteredTasks };
      }));

      toast.success('Card atualizado!');
    } else {
      const { data, error } = await tenantService
        .from('enterprise_pautas')
        .insert([basePayload])
        .select();

      if (error) {
        setIsUploading(false);
        toast.error(`Erro ao salvar: ${error.message}`);
        return;
      }

      if (!data?.length) { setIsUploading(false); return; }

      const saved = data[0];
      const uploadedCount = await uploadAttachments(saved.id);

      if (uploadedCount > 0) {
        await tenantService.from('enterprise_pautas').update({ attachments: uploadedCount }).eq('id', saved.id);
      }

      setIsUploading(false);

      const savedTask: Task = {
        id: saved.id,
        title: saved.titulo,
        description: saved.descricao ?? '',
        priority: saved.prioridade as Task['priority'],
        assignee: saved.responsavel ?? '',
        dueDate: saved.deadline ?? '',
        tags: Array.isArray(saved.tags) ? saved.tags : [],
        attachments: uploadedCount,
        checklist: Array.isArray(saved.checklist) ? saved.checklist : DEFAULT_CHECKLIST.map((i) => ({ ...i })),
      };

      setColumns((prev) => prev.map((column) => (
        column.id === taskColumn ? { ...column, tasks: [savedTask, ...column.tasks] } : column
      )));

      toast.success('Card criado com sucesso!');
    }

    setIsTaskModalOpen(false);
    setEditingTaskId(null);
    setTaskForm({ ...EMPTY_TASK, checklist: DEFAULT_CHECKLIST.map((i) => ({ ...i })) });
    setAttachedFiles([]);
    setTaskColumn('backlog');
  };

  const getPriorityStyles = (priority: Task['priority']) => {
    if (priority === 'alta') return 'bg-rose-500/15 text-rose-200 border-rose-400/30';
    if (priority === 'media') return 'bg-amber-500/15 text-amber-200 border-amber-400/30';
    return 'bg-cyan-500/15 text-cyan-200 border-cyan-400/30';
  };

  return (
    <section className={cn('flex flex-col gap-6 w-full max-w-7xl mx-auto py-8 text-slate-100', isDarkMode ? 'text-slate-100' : 'text-slate-100')}>
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.2),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.1),transparent_30%)] pointer-events-none" />
        <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 text-[11px] font-black uppercase tracking-[0.25em] text-brand-accent">
              <Sparkles className="w-4 h-4" />
              Operacao Agil de Pautas
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mt-4">
              Workflow & <span className="text-brand-accent">Pautas</span>
            </h1>
            <p className="text-slate-400 font-medium mt-3 max-w-3xl">
              Board inteligente para planejamento, execucao e entrega com profundidade de UX para equipes publicas de comunicacao.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-full xl:min-w-[480px] xl:max-w-[520px]">
            {[
              { label: 'Cards totais', value: String(columns.reduce((acc, c) => acc + c.tasks.length, 0)), tone: 'text-cyan-300' },
              { label: 'Em redação', value: String(columns.find((c) => c.id === 'doing')?.tasks.length ?? 0), tone: 'text-amber-300' },
              { label: 'Risco alto', value: String(columns.flatMap((c) => c.tasks).filter((t) => t.priority === 'alta').length), tone: 'text-rose-300' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                <p className={cn('text-2xl font-black mt-2', item.tone)}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-black text-white">Kanban estrategico com acao rapida por card</h2>
          <p className="text-slate-500 font-medium mt-2">Criacao e edicao de pautas com briefing completo, metadados e anexos.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => openNewTask('backlog')}
            className="flex items-center gap-3 px-6 py-4 bg-brand-accent text-white rounded-2xl font-bold hover:bg-brand-accent/90 transition-all shadow-[0_10px_30px_rgba(99,102,241,0.35)]"
          >
            <Plus className="w-5 h-5" />
            Novo Card
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 min-h-[700px]">
          {INITIAL_COLUMNS.map((col) => (
            <div key={col.id} className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <div className="h-5 w-24 rounded-lg bg-white/10 animate-pulse" />
                <div className="h-5 w-8 rounded-full bg-white/10 animate-pulse" />
              </div>
              <div className="p-3 rounded-xl min-h-[620px] space-y-3 bg-slate-900/40 border border-white/5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-2xl border border-white/10 bg-slate-800/60 space-y-3">
                    <div className="h-4 w-16 rounded-full bg-white/10 animate-pulse" />
                    <div className="h-5 w-3/4 rounded-lg bg-white/10 animate-pulse" />
                    <div className="h-3 w-full rounded-lg bg-white/5 animate-pulse" />
                    <div className="h-3 w-2/3 rounded-lg bg-white/5 animate-pulse" />
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="h-3 w-12 rounded-lg bg-white/10 animate-pulse" />
                      <div className="w-7 h-7 rounded-full bg-white/10 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 min-h-[700px]">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-black text-white">{column.title}</h3>
                <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-full text-[10px] font-black uppercase tracking-[0.18em]">
                  {column.tasks.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => openNewTask(column.id)}
                className="p-2 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"
              >
                <Plus className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div
              className={cn(
                'p-3 rounded-xl min-h-[620px] space-y-3 border transition-colors duration-150',
                dragOverColumn === column.id
                  ? 'bg-indigo-500/10 border-indigo-500/40'
                  : 'bg-slate-900/40 border-white/5',
              )}
              onDragOver={(event) => { event.preventDefault(); setDragOverColumn(column.id); }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={() => void handleDropTask(column.id)}
            >
              {column.tasks.map((task, index) => (
                <motion.article
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  draggable
                  onDragStart={() => {
                    setDraggingTaskId(task.id);
                    setDraggingFromColumn(column.id);
                  }}
                  onDragEnd={() => {
                    setDraggingTaskId(null);
                    setDraggingFromColumn(null);
                  }}
                  className={cn(
                    'p-4 rounded-2xl border border-white/10 bg-slate-800/80 backdrop-blur-md transition-all hover:border-indigo-500/50 cursor-pointer relative',
                    activeDropdown === task.id ? 'z-50' : 'z-0',
                  )}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className={cn('px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.16em] border', getPriorityStyles(task.priority))}>
                      {task.priority}
                    </span>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setActiveDropdown((current) => (current === task.id ? null : task.id));
                        }}
                        className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                      >
                        <MoreHorizontal className="w-4 h-4 text-slate-300" />
                      </button>

                      {activeDropdown === task.id && (
                        <div className="absolute right-0 top-11 z-[200] min-w-[160px] rounded-xl border border-white/10 bg-slate-900 p-1.5 shadow-2xl" style={{ isolation: 'isolate' }}>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setActiveDropdown(null);
                              openEditTask(task, column.id);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/10 transition-all"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setActiveDropdown(null);
                              void duplicateTask(task, column.id);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/10 transition-all"
                          >
                            📋 Duplicar
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setActiveDropdown(null);
                              void deleteTask(task.id, column.id);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-200 hover:bg-rose-500/15 transition-all"
                          >
                            🗑️ Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEditTask(task, column.id)}
                    className="w-full text-left"
                  >
                    <h4 className="text-base font-black text-white mb-2 leading-snug">{task.title}</h4>
                    <p className="text-sm font-medium text-slate-300 leading-relaxed mb-4 line-clamp-2">
                      {task.description}
                    </p>
                  </button>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 shrink-0">
                        <Paperclip className="w-3.5 h-3.5" />
                        {task.attachments}
                      </span>
                      <div className="flex flex-wrap gap-1 min-w-0">
                        {task.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-[10px] font-black text-cyan-300 uppercase tracking-[0.16em]">#{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-slate-400">{task.dueDate}</span>
                      <button
                        type="button"
                        title="Ativar notificações"
                        onClick={(event) => {
                          event.stopPropagation();
                          toast.success('Notificações ativadas para esta pauta!');
                        }}
                        className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-slate-400 hover:text-amber-300 hover:border-amber-300/40 hover:bg-amber-300/10 transition-all"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px] font-black text-white">
                        {task.assignee.charAt(0)}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        ))}
      </div>
      )}

      <AnimatePresence>
        {activeDropdown && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveDropdown(null)}
            className="fixed inset-0 z-10 cursor-default"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 18 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 18 }}
              className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-slate-900/95 backdrop-blur-2xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="absolute top-6 right-6 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5 text-slate-300" />
              </button>

              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Formulario de pauta</p>
                <h2 className="text-3xl font-black text-white mt-3">
                  {editingTaskId ? 'Editar Card' : 'Nova Tarefa'}
                </h2>
                <p className="text-sm text-slate-400 mt-2">Briefing completo com anexos e metadados para execucao fluida.</p>
              </div>

              {/* input file oculto */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  setAttachedFiles((prev) => [...prev, ...files]);
                  e.target.value = '';
                }}
              />

              <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_0.95fr] gap-5 mb-6 max-h-[60vh] overflow-y-auto pr-1">
                {/* Coluna esquerda */}
                <div className="space-y-4">
                  <label className="space-y-2 block">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Titulo da Pauta</span>
                    <input
                      type="text"
                      value={taskForm.title}
                      onChange={(event) => setTaskForm((prev) => ({ ...prev, title: event.target.value }))}
                      className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-slate-100 font-bold outline-none focus:border-brand-accent/50 transition-colors"
                      placeholder="Ex: Pauta da coletiva da saude"
                    />
                  </label>

                  <label className="space-y-2 block">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Briefing / Descricao</span>
                    <textarea
                      value={taskForm.description}
                      onChange={(event) => setTaskForm((prev) => ({ ...prev, description: event.target.value }))}
                      className="w-full min-h-[140px] px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-slate-100 font-medium outline-none resize-none focus:border-brand-accent/50 transition-colors"
                      placeholder="Objetivo, mensagem-chave, canais de distribuicao e referencias estrategicas."
                    />
                  </label>

                  {/* Upload de Arquivos */}
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-2">Anexos</span>
                    <div
                      className="rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-5 cursor-pointer hover:border-brand-accent/40 hover:bg-brand-accent/5 transition-all"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const files = Array.from(e.dataTransfer.files);
                        setAttachedFiles((prev) => [...prev, ...files]);
                      }}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <FileUp className="w-7 h-7 text-brand-accent" />
                        <p className="text-sm font-bold text-white">Clique ou arraste arquivos aqui</p>
                        <p className="text-xs text-slate-500">Imagens, PDFs, DOCX (max 10 MB cada)</p>
                      </div>
                    </div>
                    {attachedFiles.length > 0 && (
                      <ul className="mt-2 space-y-1.5">
                        {attachedFiles.map((f, i) => (
                          <li key={i} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                            <span className="text-xs text-slate-300 truncate max-w-[200px]">{f.name}</span>
                            <button
                              type="button"
                              onClick={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                              className="text-rose-400 hover:text-rose-300 transition-colors shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Checklist dinâmico */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Checklist</span>
                      <button
                        type="button"
                        onClick={() => setTaskForm((prev) => ({
                          ...prev,
                          checklist: [...prev.checklist, { texto: '', checked: false }],
                        }))}
                        className="text-[10px] font-black text-brand-accent hover:text-brand-accent/80 uppercase tracking-[0.15em] flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Adicionar
                      </button>
                    </div>
                    <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
                      {taskForm.checklist.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setTaskForm((prev) => ({
                              ...prev,
                              checklist: prev.checklist.map((c, idx) => idx === i ? { ...c, checked: !c.checked } : c),
                            }))}
                            className="shrink-0 text-brand-accent"
                          >
                            {item.checked
                              ? <CheckSquare className="w-4 h-4" />
                              : <Square className="w-4 h-4 text-slate-500" />}
                          </button>
                          <input
                            type="text"
                            value={item.texto}
                            onChange={(e) => setTaskForm((prev) => ({
                              ...prev,
                              checklist: prev.checklist.map((c, idx) => idx === i ? { ...c, texto: e.target.value } : c),
                            }))}
                            className={cn(
                              'flex-1 bg-transparent text-sm font-medium outline-none border-b border-white/10 pb-0.5 focus:border-brand-accent/40 transition-colors',
                              item.checked ? 'line-through text-slate-600' : 'text-slate-300',
                            )}
                            placeholder="Item do checklist..."
                          />
                          <button
                            type="button"
                            onClick={() => setTaskForm((prev) => ({
                              ...prev,
                              checklist: prev.checklist.filter((_, idx) => idx !== i),
                            }))}
                            className="shrink-0 text-slate-600 hover:text-rose-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {taskForm.checklist.length === 0 && (
                        <p className="text-xs text-slate-600 text-center py-2">Nenhum item. Clique em "Adicionar".</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Coluna direita */}
                <div className="space-y-4">
                  <label className="space-y-2 block">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Responsavel (livre)</span>
                    <input
                      type="text"
                      value={taskForm.assignee}
                      onChange={(event) => setTaskForm((prev) => ({ ...prev, assignee: event.target.value }))}
                      placeholder="Nome do responsavel"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-100 font-bold outline-none focus:border-brand-accent/50 transition-colors"
                    />
                  </label>

                  <label className="space-y-2 block">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Prioridade</span>
                    <select
                      value={taskForm.priority}
                      onChange={(event) => setTaskForm((prev) => ({ ...prev, priority: event.target.value as Task['priority'] }))}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-800 text-slate-100 font-bold outline-none focus:border-brand-accent/50 transition-colors"
                    >
                      <option value="baixa" className="bg-slate-800 text-slate-100">Baixa</option>
                      <option value="media" className="bg-slate-800 text-slate-100">Média</option>
                      <option value="alta" className="bg-slate-800 text-slate-100">Alta</option>
                    </select>
                    <div className={cn('inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.16em] border', getPriorityStyles(taskForm.priority))}>
                      {taskForm.priority}
                    </div>
                  </label>

                  <label className="space-y-2 block">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status / Coluna</span>
                    <select
                      value={taskColumn}
                      onChange={(event) => setTaskColumn(event.target.value as Column['id'])}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-800 text-slate-100 font-bold outline-none focus:border-brand-accent/50 transition-colors"
                    >
                      <option value="backlog" className="bg-slate-800 text-slate-100">Ideação</option>
                      <option value="doing" className="bg-slate-800 text-slate-100">Em Redação</option>
                      <option value="review" className="bg-slate-800 text-slate-100">Aguardando Aprovação</option>
                      <option value="done" className="bg-slate-800 text-slate-100">Concluído</option>
                    </select>
                  </label>

                  <label className="space-y-2 block">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Data de Prazo</span>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(event) => setTaskForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-800 text-slate-100 font-bold outline-none focus:border-brand-accent/50 transition-colors [color-scheme:dark]"
                    />
                  </label>

                  {taskForm.dueDate && (
                    <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                      <CalendarDays className="w-4 h-4 text-amber-300 shrink-0" />
                      <span className="text-xs font-bold text-amber-200">
                        Prazo: {new Date(taskForm.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  )}

                  {(taskForm.attachments > 0 || attachedFiles.length > 0) && (
                    <div className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3">
                      <Paperclip className="w-4 h-4 text-cyan-300 shrink-0" />
                      <span className="text-xs font-bold text-cyan-200">
                        {taskForm.attachments + attachedFiles.length} arquivo(s) vinculado(s)
                      </span>
                    </div>
                  )}

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Progresso Checklist</p>
                    {taskForm.checklist.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-400">
                            {taskForm.checklist.filter((c) => c.checked).length} / {taskForm.checklist.length} concluídos
                          </span>
                          <span className="text-xs font-bold text-brand-accent">
                            {Math.round((taskForm.checklist.filter((c) => c.checked).length / taskForm.checklist.length) * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 mt-1">
                          <div
                            className="h-full rounded-full bg-brand-accent transition-all duration-300"
                            style={{ width: `${Math.round((taskForm.checklist.filter((c) => c.checked).length / taskForm.checklist.length) * 100)}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-600 mt-1">Nenhum item no checklist.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-white/10">
                <button
                  onClick={() => void handleSaveTask()}
                  disabled={isUploading || !taskForm.title.trim()}
                  className="flex-1 py-4 bg-brand-accent text-white rounded-xl font-bold hover:bg-brand-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isUploading ? 'Enviando...' : editingTaskId ? 'Salvar Alterações' : 'Criar Card'}
                </button>
                <button
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-6 py-4 bg-white/5 border border-white/10 text-slate-300 rounded-xl font-bold hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
