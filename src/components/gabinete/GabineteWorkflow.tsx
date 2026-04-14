import { useState, useEffect } from 'react';
import { 
  Layout, Plus,
  Filter, MoreVertical,
  User, Landmark,
  Calendar, Zap,
  ChevronRight, Trash2, Edit2, X, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useTenantService } from '../../services/useTenantService';
import toast from 'react-hot-toast';

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  responsavel: string;
  prioridade: 'alta' | 'media' | 'baixa';
  status_coluna: 'todo' | 'doing' | 'review' | 'done';
  data: string;
}

type ColumnId = 'todo' | 'doing' | 'review' | 'done';

const COLUMNS: { id: ColumnId; title: string; accent: string; border: string }[] = [
  { id: 'todo', title: 'Ideação', accent: 'text-slate-300', border: 'border-slate-600/50' },
  { id: 'doing', title: 'Em Execução', accent: 'text-brand-accent', border: 'border-brand-accent/40' },
  { id: 'review', title: 'Revisão/Jurídico', accent: 'text-amber-400', border: 'border-amber-500/40' },
  { id: 'done', title: 'Concluído', accent: 'text-emerald-400', border: 'border-emerald-500/40' },
];

const COLUMN_LABEL: Record<ColumnId, string> = {
  todo: 'Ideação',
  doing: 'Em Execução',
  review: 'Revisão/Jurídico',
  done: 'Concluído',
};

const EMPTY_FORM: Omit<Tarefa, 'id'> = {
  titulo: '',
  descricao: '',
  responsavel: 'Vereador',
  prioridade: 'media',
  status_coluna: 'todo',
  data: '',
};

function getPriorityStyle(p: Tarefa['prioridade']) {
  if (p === 'alta') return 'bg-rose-500/15 text-rose-300 border-rose-400/30';
  if (p === 'media') return 'bg-amber-500/15 text-amber-300 border-amber-400/30';
  return 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30';
}


export function GabineteWorkflow({ isDarkMode: _isDarkMode }: { isDarkMode: boolean }) {
  const tenantService = useTenantService();
  const [tasks, setTasks] = useState<Tarefa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('kanban');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingFrom, setDraggingFrom] = useState<ColumnId | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ColumnId | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<Omit<Tarefa, 'id'>>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // ─── fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data, error } = await tenantService
        .from('gabinete_workflow_tarefas')
        .select('id, titulo, descricao, responsavel, prioridade, status_coluna, data')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error(`Erro ao carregar tarefas: ${error.message}`);
        setIsLoading(false);
        return;
      }

      setTasks(
        (data ?? []).map((row) => ({
          id: row.id,
          titulo: row.titulo ?? '',
          descricao: row.descricao ?? '',
          responsavel: row.responsavel ?? 'Vereador',
          prioridade: (row.prioridade as Tarefa['prioridade']) ?? 'media',
          status_coluna: (row.status_coluna as ColumnId) ?? 'todo',
          data: row.data ?? '',
        })),
      );
      setIsLoading(false);
    };
    void load();
  }, []);

  // ─── drag and drop ────────────────────────────────────────────────────────
  const handleDrop = async (targetCol: ColumnId) => {
    if (!draggingId || !draggingFrom || draggingFrom === targetCol) {
      setDraggingId(null);
      setDraggingFrom(null);
      setDragOverCol(null);
      return;
    }

    const previous = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.id === draggingId ? { ...t, status_coluna: targetCol } : t)),
    );

    const { error } = await tenantService
      .from('gabinete_workflow_tarefas')
      .update({ status_coluna: targetCol })
      .eq('id', draggingId);

    if (error) {
      toast.error(`Erro ao mover: ${error.message}`);
      setTasks(previous);
    } else {
      toast.success(`Status atualizado para "${COLUMN_LABEL[targetCol]}"`);
    }

    setDraggingId(null);
    setDraggingFrom(null);
    setDragOverCol(null);
  };

  // ─── save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.titulo.trim()) return;

    if (editingId) {
      const { error } = await tenantService
        .from('gabinete_workflow_tarefas')
        .update({
          titulo: form.titulo,
          descricao: form.descricao,
          responsavel: form.responsavel,
          prioridade: form.prioridade,
          status_coluna: form.status_coluna,
          data: form.data,
        })
        .eq('id', editingId);

      if (error) { toast.error(`Erro ao salvar: ${error.message}`); return; }

      setTasks((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, ...form, id: editingId } : t)),
      );
      toast.success('Tarefa atualizada!');
    } else {
      const { data, error } = await tenantService
        .from('gabinete_workflow_tarefas')
        .insert([{
          titulo: form.titulo,
          descricao: form.descricao,
          responsavel: form.responsavel,
          prioridade: form.prioridade,
          status_coluna: form.status_coluna,
          data: form.data,
        }])
        .select();

      if (error) { toast.error(`Erro ao criar: ${error.message}`); return; }
      if (!data?.length) return;

      const saved = data[0];
      setTasks((prev) => [
        { id: saved.id, titulo: saved.titulo, descricao: saved.descricao ?? '', responsavel: saved.responsavel ?? 'Vereador', prioridade: saved.prioridade ?? 'media', status_coluna: saved.status_coluna ?? 'todo', data: saved.data ?? '' },
        ...prev,
      ]);
      toast.success('Tarefa criada com sucesso!');
    }

    setIsModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  // ─── delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const { error } = await tenantService
      .from('gabinete_workflow_tarefas')
      .delete()
      .eq('id', id);

    if (error) { toast.error(`Erro ao excluir: ${error.message}`); return; }
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setActiveDropdown(null);
    toast.success('Tarefa excluída.');
  };

  const openNew = (col: ColumnId = 'todo') => {
    setForm({ ...EMPTY_FORM, status_coluna: col });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEdit = (t: Tarefa) => {
    setForm({ titulo: t.titulo, descricao: t.descricao, responsavel: t.responsavel, prioridade: t.prioridade, status_coluna: t.status_coluna, data: t.data });
    setEditingId(t.id);
    setActiveDropdown(null);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 pb-20 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white">
            Workflow e <span className="text-brand-accent">Pautas</span>
          </h1>
          <p className="text-slate-400 font-medium mt-2">Gestão de tarefas legislativas e agenda de sessões/comissões.</p>
        </div>
        <button
          onClick={() => openNew()}
          className="flex items-center gap-3 px-8 py-4 bg-brand-accent text-white rounded-2xl font-bold hover:bg-brand-accent/90 transition-all shadow-[0_10px_30px_rgba(139,92,246,0.3)]"
        >
          <Plus className="w-5 h-5" />
          Nova Tarefa
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] w-fit">
        {[
          { id: 'kanban', label: 'Kanban Legislativo', icon: Layout },
          { id: 'agenda', label: 'Agenda de Sessões', icon: Calendar },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all',
              activeTab === tab.id
                ? 'bg-brand-accent text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5',
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
          >
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {COLUMNS.map((col) => (
                  <div key={col.id} className="space-y-4">
                    <div className="h-12 rounded-2xl bg-white/10 animate-pulse" />
                    {[1, 2].map((i) => (
                      <div key={i} className="p-5 rounded-2xl border border-white/10 bg-slate-800/60 space-y-3">
                        <div className="h-3 w-14 rounded-full bg-white/10 animate-pulse" />
                        <div className="h-4 w-3/4 rounded-lg bg-white/10 animate-pulse" />
                        <div className="h-3 w-full rounded-lg bg-white/5 animate-pulse" />
                        <div className="flex justify-between pt-2 border-t border-white/5">
                          <div className="h-3 w-16 rounded-lg bg-white/10 animate-pulse" />
                          <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {COLUMNS.map((col) => {
                  const colTasks = tasks.filter((t) => t.status_coluna === col.id);
                  return (
                    <div key={col.id} className="space-y-4">
                      {/* Column header */}
                      <div
                        className={cn(
                          'p-4 rounded-2xl flex items-center justify-between border bg-white/5',
                          col.border,
                        )}
                      >
                        <h3 className={cn('text-sm font-black uppercase tracking-widest', col.accent)}>
                          {col.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black px-2 py-0.5 bg-white/10 rounded-lg text-slate-300">
                            {colTasks.length}
                          </span>
                          <button
                            onClick={() => openNew(col.id)}
                            className="p-1 hover:bg-white/10 rounded-lg transition-all"
                          >
                            <Plus className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>
                      </div>

                      {/* Drop zone */}
                      <div
                        className={cn(
                          'space-y-3 min-h-[500px] p-2 rounded-2xl border transition-colors duration-150',
                          dragOverCol === col.id
                            ? 'bg-brand-accent/10 border-brand-accent/40'
                            : 'border-transparent',
                        )}
                        onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id); }}
                        onDragLeave={() => setDragOverCol(null)}
                        onDrop={() => void handleDrop(col.id)}
                      >
                        {colTasks.length === 0 && (
                          <div className="h-24 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center text-slate-600 text-xs font-bold">
                            Solte aqui
                          </div>
                        )}

                        {colTasks.map((task, idx) => (
                          <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            draggable
                            onDragStart={() => { setDraggingId(task.id); setDraggingFrom(col.id); }}
                            onDragEnd={() => { setDraggingId(null); setDraggingFrom(null); }}
                            className={cn(
                              'p-5 rounded-2xl border bg-slate-900/80 backdrop-blur-md cursor-grab active:cursor-grabbing transition-all hover:border-brand-accent/40',
                              draggingId === task.id ? 'opacity-40 scale-95' : 'border-white/10',
                            )}
                          >
                            {/* Priority + menu */}
                            <div className="flex items-center justify-between mb-3">
                              <span className={cn('px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.16em] border', getPriorityStyle(task.prioridade))}>
                                {task.prioridade}
                              </span>
                              <div className="relative">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setActiveDropdown((c) => (c === task.id ? null : task.id)); }}
                                  className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                                >
                                  <MoreVertical className="w-4 h-4 text-slate-400" />
                                </button>
                                {activeDropdown === task.id && (
                                  <div className="absolute right-0 top-9 z-20 min-w-[140px] rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl p-1.5 shadow-2xl">
                                    <button onClick={() => openEdit(task)} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/10 flex items-center gap-2">
                                      <Edit2 className="w-3.5 h-3.5" /> Editar
                                    </button>
                                    <button onClick={() => void handleDelete(task.id)} className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-300 hover:bg-rose-500/15 flex items-center gap-2">
                                      <Trash2 className="w-3.5 h-3.5" /> Excluir
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Title */}
                            <p className="font-black text-sm text-white leading-snug mb-3">{task.titulo}</p>
                            {task.descricao && (
                              <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">{task.descricao}</p>
                            )}

                            {/* Footer: responsavel + data */}
                            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center text-[9px] font-black text-brand-accent">
                                  {task.responsavel.charAt(0)}
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 truncate max-w-[80px]">{task.responsavel}</span>
                              </div>
                              {task.data && (
                                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />{task.data}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="agenda"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Próximas Sessões */}
            <div className="lg:col-span-1 p-10 rounded-[3rem] shadow-xl border space-y-8 bg-slate-900 border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-accent/10 text-brand-accent rounded-2xl flex items-center justify-center">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-white">Próximas Sessões</h3>
                </div>
                <button className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-brand-accent border border-white/10">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Sessão Ordinária', date: '26 Abr, 14:00', type: 'Plenário', status: 'Confirmado' },
                  { title: 'Comissão de Saúde', date: '27 Abr, 09:00', type: 'Comissão', status: 'Confirmado' },
                  { title: 'Audiência Pública: Orçamento', date: '28 Abr, 19:00', type: 'Audiência', status: 'Aguardando' },
                ].map((session, i) => (
                  <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between hover:border-brand-accent/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex flex-col items-center justify-center border border-white/10">
                        <span className="text-[9px] font-black text-brand-accent uppercase tracking-widest">{session.date.split(' ')[1]}</span>
                        <span className="text-lg font-black text-white">{session.date.split(' ')[0]}</span>
                      </div>
                      <div>
                        <p className="font-black text-white text-sm">{session.title}</p>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{session.type} · {session.date.split(', ')[1]}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn('text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest', session.status === 'Confirmado' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300')}>
                        {session.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alertas IA */}
            <div className="lg:col-span-1 p-10 rounded-[3rem] shadow-xl border space-y-8 bg-indigo-600/90 text-white border-indigo-500/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black">Alertas IA</h3>
              </div>
              <div className="space-y-5">
                <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-2">Conflito de Agenda</p>
                  <p className="text-sm font-bold leading-relaxed">A Comissão de Saúde coincide com a visita técnica. Sugerimos reagendar a visita.</p>
                </div>
                <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-2">Pauta Prioritária</p>
                  <p className="text-sm font-bold leading-relaxed">O PL 145 será votado amanhã. O roteiro de fala está disponível no Arsenal.</p>
                </div>
              </div>
              <button
                onClick={() => toast.success('Agenda otimizada com sucesso.')}
                className="w-full py-5 bg-white text-indigo-600 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/20"
              >
                Otimizar Agenda
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close dropdown overlay */}
      <AnimatePresence>
        {activeDropdown && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setActiveDropdown(null)}
            className="fixed inset-0 z-10 cursor-default"
          />
        )}
      </AnimatePresence>

      {/* Modal Nova/Editar Tarefa */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 18 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 18 }}
              className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-900/95 backdrop-blur-2xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4 text-slate-300" />
              </button>

              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-1">Tarefa legislativa</p>
              <h2 className="text-2xl font-black text-white mb-5">{editingId ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>

              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Título</span>
                  <input
                    type="text"
                    value={form.titulo}
                    onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                    placeholder="Ex: Redigir PL da Creche"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-100 font-bold outline-none focus:border-brand-accent/50 transition-colors"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Descrição</span>
                  <textarea
                    value={form.descricao}
                    onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-100 font-medium outline-none resize-none focus:border-brand-accent/50 transition-colors"
                  />
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Responsável</span>
                    <select value={form.responsavel} onChange={(e) => setForm((p) => ({ ...p, responsavel: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-100 font-bold outline-none">
                      <option>Vereador</option>
                      <option>Dra. Helena</option>
                      <option>Ricardo</option>
                      <option>Dr. Marcos</option>
                      <option>Bia</option>
                    </select>
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Prioridade</span>
                    <select value={form.prioridade} onChange={(e) => setForm((p) => ({ ...p, prioridade: e.target.value as Tarefa['prioridade'] }))} className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-100 font-bold outline-none">
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                    </select>
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Coluna</span>
                    <select value={form.status_coluna} onChange={(e) => setForm((p) => ({ ...p, status_coluna: e.target.value as ColumnId }))} className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-100 font-bold outline-none">
                      {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Data / Prazo</span>
                    <input type="text" value={form.data} onChange={(e) => setForm((p) => ({ ...p, data: e.target.value }))} placeholder="Ex: 10 Abr" className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-100 font-bold outline-none" />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-5 border-t border-white/10">
                <button
                  onClick={() => void handleSave()}
                  className="flex-1 py-3.5 bg-brand-accent text-white rounded-xl font-bold hover:bg-brand-accent/90 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Salvar Alterações' : 'Criar Tarefa'}
                </button>
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-3.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl font-bold hover:bg-white/10 transition-all">
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
