import { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Search, Filter, Plus, 
  TrendingUp, TrendingDown, Activity,
  MessageSquare, Share2, Globe,
  MoreVertical, Edit2, Trash2, Zap,
  BarChart3, PieChart, Star,
  ChevronRight, ArrowRight, CheckCircle2, X,
  Clock, MapPin, Users, Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useTenantService } from '../../services/useTenantService';

interface Campaign {
  id: string;
  titulo: string;
  data_inicio: string;
  data_fim: string;
  progresso: number;
  status: 'planejado' | 'em_andamento' | 'concluido';
  prioridade: 'alta' | 'media' | 'baixa';
  secretaria: string;
}

export function EnterprisePlanning({ isDarkMode }: { isDarkMode: boolean }) {
  const tenantService = useTenantService();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [campaignForm, setCampaignForm] = useState({
    titulo: '',
    data_inicio: '',
    data_fim: '',
    secretaria: 'Saúde',
  });

  const tituloRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    tenantService
      .from('enterprise_campanhas')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error('[Planning] Erro ao carregar campanhas:', error); return; }
        setCampaigns((data ?? []).map((row) => ({
          id: row.id,
          titulo: row.titulo,
          data_inicio: row.data_inicio,
          data_fim: row.data_fim,
          progresso: row.progresso ?? 0,
          status: row.status as Campaign['status'],
          prioridade: row.prioridade as Campaign['prioridade'],
          secretaria: row.secretaria,
        })));
      });
  }, []);

  const resetCampaignForm = () => {
    setCampaignForm({ titulo: '', data_inicio: '', data_fim: '', secretaria: 'Saúde' });
    setEditingCampaignId(null);
  };

  const handleOpenNewCampaign = () => {
    resetCampaignForm();
    setIsAdding(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setCampaignForm({
      titulo: campaign.titulo,
      data_inicio: campaign.data_inicio,
      data_fim: campaign.data_fim,
      secretaria: campaign.secretaria,
    });
    setEditingCampaignId(campaign.id);
    setIsAdding(true);
  };

  const handleSaveCampaign = async () => {
    const titulo = campaignForm.titulo.trim();
    if (!titulo) return;
    const data_inicio = campaignForm.data_inicio;
    const data_fim = campaignForm.data_fim;
    const secretaria = campaignForm.secretaria;

    setIsSaving(true);
    if (editingCampaignId) {
      const { error } = await tenantService
        .from('enterprise_campanhas')
        .update({ titulo, data_inicio, data_fim, secretaria })
        .eq('id', editingCampaignId);

      if (error) {
        console.error('[Planning] Erro ao atualizar campanha:', error);
        alert(`Erro ao atualizar: ${error.message}`);
      } else {
        setCampaigns((prev) => prev.map((item) => (
          item.id === editingCampaignId
            ? { ...item, titulo, data_inicio, data_fim, secretaria }
            : item
        )));
      }
    } else {
      const { data, error } = await tenantService
        .from('enterprise_campanhas')
        .insert({ titulo, data_inicio, data_fim, secretaria, progresso: 0, status: 'planejado', prioridade: 'media' })
        .select()
        .single();

      if (error) { console.error('[Planning] Erro ao salvar campanha:', error); }
      else if (data) {
        setCampaigns((prev) => [{
          id: data.id, titulo, data_inicio, data_fim,
          progresso: 0, status: 'planejado', prioridade: 'media', secretaria,
        }, ...prev]);
      }
    }
    setIsSaving(false);
    setIsAdding(false);
    resetCampaignForm();
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    tenantService.from('enterprise_campanhas').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('[Planning] Erro ao deletar campanha:', error);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 pb-20 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white">
            Planejamento <span className="text-brand-accent">Estratégico</span>
          </h1>
          <p className="text-slate-400 font-medium mt-2">Gestão de campanhas, eventos e marcos institucionais.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleOpenNewCampaign}
            className="flex items-center gap-3 px-6 py-4 bg-brand-accent text-white rounded-2xl font-bold hover:bg-brand-accent/90 transition-all shadow-[0_10px_30px_rgba(139,92,246,0.3)]"
          >
            <Plus className="w-5 h-5" />
            Nova Campanha
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar Sidebar */}
        <div className={cn(
          "lg:col-span-1 p-10 rounded-[3rem] shadow-xl border",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
        )}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black">Calendário</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <ChevronRight className="w-5 h-5 text-slate-400 rotate-180" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-8">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
              <div key={i} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</div>
            ))}
            {Array.from({ length: 31 }).map((_, i) => (
              <div key={i} className={cn(
                "aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all cursor-pointer",
                i + 1 === 25 ? "bg-brand-accent text-white shadow-lg shadow-blue-500/20" : "hover:bg-slate-50 text-slate-600"
              )}>
                {i + 1}
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Próximos Eventos</h4>
            {[
              { title: 'Inauguração Hospital', date: '26 Mar', type: 'Evento' },
              { title: 'Live de Prestação', date: '28 Mar', type: 'Comunicação' },
              { title: 'Coletiva de Imprensa', date: '30 Mar', type: 'Imprensa' },
            ].map((event, i) => (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer">
                <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center font-black text-brand-accent shadow-sm">
                  {event.date.split(' ')[0]}
                </div>
                <div>
                  <p className="font-black text-sm">{event.title}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{event.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign List */}
        <div className="lg:col-span-1 space-y-6">
          {campaigns.map((item) => (
            <div key={item.id} className={cn(
              "p-8 rounded-[3rem] shadow-xl border transition-all hover:shadow-2xl group",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
            )}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-inner",
                    item.status === 'em_andamento' ? "bg-blue-50 text-brand-accent" : 
                    item.status === 'planejado' ? "bg-slate-50 text-slate-400" : "bg-emerald-50 text-emerald-600"
                  )}>
                    <Flag className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                        item.prioridade === 'alta' ? "bg-rose-100 text-rose-600" : 
                        item.prioridade === 'media' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-brand-accent"
                      )}>
                        Prioridade {item.prioridade}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.secretaria}</span>
                    </div>
                    <h3 className="text-2xl font-black">{item.titulo}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.data_inicio} até {item.data_fim}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleEditCampaign(item)} className="p-4 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-brand-accent rounded-2xl transition-all">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDeleteCampaign(item.id)} className="p-4 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="w-48">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                      <span>Progresso</span>
                      <span>{item.progresso}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progresso}%` }}
                        className={cn(
                          "h-full rounded-full transition-all",
                          item.progresso > 80 ? "bg-emerald-500" : "bg-blue-500"
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Campaign Modal Placeholder */}
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
              
              <h2 className="text-3xl font-black mb-10">{editingCampaignId ? 'Editar Campanha' : 'Nova Campanha'}</h2>
              
              <div className="space-y-8 mb-10">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Título da Campanha</label>
                  <input ref={tituloRef} type="text" value={campaignForm.titulo} onChange={(event) => setCampaignForm((prev) => ({ ...prev, titulo: event.target.value }))} className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-bold border-none outline-none" placeholder="Ex: Campanha de Agasalho..." />
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Data Início</label>
                    <input type="date" value={campaignForm.data_inicio} onChange={(event) => setCampaignForm((prev) => ({ ...prev, data_inicio: event.target.value }))} className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-bold border-none outline-none" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Data Fim</label>
                    <input type="date" value={campaignForm.data_fim} onChange={(event) => setCampaignForm((prev) => ({ ...prev, data_fim: event.target.value }))} className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-bold border-none outline-none" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Secretaria Responsável</label>
                  <select value={campaignForm.secretaria} onChange={(event) => setCampaignForm((prev) => ({ ...prev, secretaria: event.target.value }))} className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-bold text-slate-600 border-none outline-none appearance-none">
                    <option>Saúde</option>
                    <option>Educação</option>
                    <option>Obras</option>
                    <option>Cultura</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={handleSaveCampaign} disabled={isSaving} className="flex-1 py-5 bg-brand-accent text-white rounded-2xl font-bold hover:bg-brand-accent/90 transition-all shadow-lg shadow-blue-500/20">
                  {isSaving ? 'Salvando...' : editingCampaignId ? 'Atualizar Campanha' : 'Salvar Campanha'}
                </button>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    resetCampaignForm();
                  }}
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
