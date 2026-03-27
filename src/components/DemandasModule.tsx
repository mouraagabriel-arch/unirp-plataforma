import { useState } from 'react';
import { 
  Inbox, Search, Filter, Plus, 
  MoreVertical, Clock, CheckCircle2, 
  AlertCircle, ChevronRight, User,
  MessageSquare, Paperclip, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Demanda {
  id: string;
  titulo: string;
  solicitante: string;
  data: string;
  status: 'aberto' | 'em_progresso' | 'concluido' | 'atrasado';
  prioridade: 'baixa' | 'media' | 'alta';
  categoria: string;
  descricao: string;
}

const DEMANDAS_MOCK: Demanda[] = [
  {
    id: 'DEM-001',
    titulo: 'Solicitação de Reparo na Iluminação - Rua das Flores',
    solicitante: 'Maria Silva',
    data: '2024-03-24 10:30',
    status: 'aberto',
    prioridade: 'alta',
    categoria: 'Infraestrutura',
    descricao: 'Moradores reclamam de escuridão total no trecho entre os números 100 e 500.'
  },
  {
    id: 'DEM-002',
    titulo: 'Pedido de Audiência com Secretário de Saúde',
    solicitante: 'Associação de Moradores do Bairro Novo',
    data: '2024-03-23 14:15',
    status: 'em_progresso',
    prioridade: 'media',
    categoria: 'Agenda',
    descricao: 'Pauta: Falta de medicamentos básicos na UBS local.'
  },
  {
    id: 'DEM-003',
    titulo: 'Denúncia de Descarte Irregular de Entulho',
    solicitante: 'João Pereira',
    data: '2024-03-22 09:00',
    status: 'atrasado',
    prioridade: 'alta',
    categoria: 'Meio Ambiente',
    descricao: 'Terreno baldio na Av. Central sendo usado como lixão clandestino.'
  },
  {
    id: 'DEM-004',
    titulo: 'Agradecimento por Reforma em Escola Municipal',
    solicitante: 'Diretoria Escola Estrela',
    data: '2024-03-21 16:45',
    status: 'concluido',
    prioridade: 'baixa',
    categoria: 'Educação',
    descricao: 'A comunidade escolar agradece a agilidade na reforma do telhado.'
  }
];

export function DemandasModule({ isDarkMode }: { isDarkMode: boolean }) {
  const [filter, setFilter] = useState('todos');
  const [search, setSearch] = useState('');

  const statusColors = {
    aberto: "bg-blue-100 text-blue-600",
    em_progresso: "bg-amber-100 text-amber-600",
    concluido: "bg-emerald-100 text-emerald-600",
    atrasado: "bg-rose-100 text-rose-600"
  };

  const priorityColors = {
    baixa: "bg-slate-100 text-slate-600",
    media: "bg-indigo-100 text-indigo-600",
    alta: "bg-rose-100 text-rose-600"
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">
            Caixa de <span className="text-blue-600">Entrada</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Gestão centralizada de todas as solicitações e contatos.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all",
            isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          )}>
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar demandas..." 
              className="bg-transparent border-none outline-none text-sm font-medium w-48 lg:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {['todos', 'aberto', 'em_progresso', 'atrasado', 'concluido'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all border",
              filter === s 
                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20" 
                : isDarkMode ? "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
            )}
          >
            {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {DEMANDAS_MOCK
            .filter(d => filter === 'todos' || d.status === filter)
            .filter(d => d.titulo.toLowerCase().includes(search.toLowerCase()) || d.solicitante.toLowerCase().includes(search.toLowerCase()))
            .map((demanda, index) => (
              <motion.div
                layout
                key={demanda.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-8 rounded-[2.5rem] border transition-all hover:shadow-xl cursor-pointer group",
                  isDarkMode ? "bg-slate-900 border-slate-800 hover:border-blue-500/30" : "bg-white border-slate-100 hover:border-blue-200"
                )}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", statusColors[demanda.status])}>
                        {demanda.status.replace('_', ' ')}
                      </span>
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", priorityColors[demanda.prioridade])}>
                        Prioridade {demanda.prioridade}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-auto lg:ml-0">
                        {demanda.id}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-black group-hover:text-blue-600 transition-colors">{demanda.titulo}</h3>
                    
                    <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-500">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{demanda.solicitante}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{demanda.data}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Inbox className="w-4 h-4" />
                        <span>{demanda.categoria}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 lg:pl-8 lg:border-l border-slate-100">
                    <div className="flex -space-x-3">
                      {[1, 2].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black">
                          U{i}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs font-bold">3</span>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-blue-600 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
