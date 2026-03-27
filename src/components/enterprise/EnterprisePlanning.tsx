import { useState } from 'react';
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

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'CMP-001',
    titulo: 'Campanha de Vacinação 2024',
    data_inicio: '2024-04-01',
    data_fim: '2024-04-30',
    progresso: 45,
    status: 'em_andamento',
    prioridade: 'alta',
    secretaria: 'Saúde'
  },
  {
    id: 'CMP-002',
    titulo: 'Inauguração Parque das Águas',
    data_inicio: '2024-05-15',
    data_fim: '2024-05-15',
    progresso: 10,
    status: 'planejado',
    prioridade: 'media',
    secretaria: 'Obras'
  },
  {
    id: 'CMP-003',
    titulo: 'Semana da Educação Municipal',
    data_inicio: '2024-03-20',
    data_fim: '2024-03-27',
    progresso: 90,
    status: 'em_andamento',
    prioridade: 'alta',
    secretaria: 'Educação'
  },
  {
    id: 'CMP-004',
    titulo: 'Festival de Inverno 2024',
    data_inicio: '2024-06-01',
    data_fim: '2024-06-30',
    progresso: 0,
    status: 'planejado',
    prioridade: 'baixa',
    secretaria: 'Cultura'
  }
];

export function EnterprisePlanning({ isDarkMode }: { isDarkMode: boolean }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">
            Planejamento <span className="text-blue-600">Estratégico</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Gestão de campanhas, eventos e marcos institucionais.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" />
            Nova Campanha
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                i + 1 === 25 ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "hover:bg-slate-50 text-slate-600"
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
                <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center font-black text-blue-600 shadow-sm">
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
        <div className="lg:col-span-2 space-y-6">
          {campaigns.map((item) => (
            <div key={item.id} className={cn(
              "p-8 rounded-[3rem] shadow-xl border transition-all hover:shadow-2xl group",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
            )}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-inner",
                    item.status === 'em_andamento' ? "bg-blue-50 text-blue-600" : 
                    item.status === 'planejado' ? "bg-slate-50 text-slate-400" : "bg-emerald-50 text-emerald-600"
                  )}>
                    <Flag className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                        item.prioridade === 'alta' ? "bg-rose-100 text-rose-600" : 
                        item.prioridade === 'media' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
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
                    <button className="p-4 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button className="p-4 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all">
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
              
              <h2 className="text-4xl font-black mb-10">Nova Campanha</h2>
              
              <div className="space-y-8 mb-10">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Título da Campanha</label>
                  <input type="text" className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-bold border-none outline-none" placeholder="Ex: Campanha de Agasalho..." />
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Data Início</label>
                    <input type="date" className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-bold border-none outline-none" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Data Fim</label>
                    <input type="date" className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-bold border-none outline-none" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Secretaria Responsável</label>
                  <select className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-bold text-slate-600 border-none outline-none appearance-none">
                    <option>Saúde</option>
                    <option>Educação</option>
                    <option>Obras</option>
                    <option>Cultura</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                  Salvar Campanha
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
