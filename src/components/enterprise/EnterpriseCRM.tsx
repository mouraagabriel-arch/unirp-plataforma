import { useState } from 'react';
import { 
  Users, Search, Filter, Plus, 
  Mail, Phone, MapPin, Globe,
  Download, Upload, MoreVertical, Edit2,
  Trash2, MessageSquare, Newspaper, Star,
  ChevronRight, ArrowRight, CheckCircle2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface Journalist {
  id: string;
  nome: string;
  veiculo: string;
  cargo: string;
  email: string;
  telefone: string;
  localizacao: string;
  tags: string[];
  favorito: boolean;
  status: 'ativo' | 'inativo';
}

const MOCK_JOURNALISTS: Journalist[] = [
  {
    id: 'JRN-001',
    nome: 'Ana Paula Santos',
    veiculo: 'Portal G1',
    cargo: 'Editora de Política',
    email: 'ana.paula@g1.com',
    telefone: '(11) 98765-4321',
    localizacao: 'São Paulo, SP',
    tags: ['Política', 'Saúde', 'Cidades'],
    favorito: true,
    status: 'ativo'
  },
  {
    id: 'JRN-002',
    nome: 'Ricardo Oliveira',
    veiculo: 'Folha de S.Paulo',
    cargo: 'Repórter Especial',
    email: 'ricardo.oliveira@folha.com',
    telefone: '(11) 91234-5678',
    localizacao: 'Brasília, DF',
    tags: ['Economia', 'Gestão Pública'],
    favorito: false,
    status: 'ativo'
  },
  {
    id: 'JRN-003',
    nome: 'Juliana Mendes',
    veiculo: 'TV Globo',
    cargo: 'Produtora Executiva',
    email: 'juliana.mendes@globo.com',
    telefone: '(21) 99888-7766',
    localizacao: 'Rio de Janeiro, RJ',
    tags: ['Cultura', 'Eventos'],
    favorito: true,
    status: 'ativo'
  },
  {
    id: 'JRN-004',
    nome: 'Marcos Vinícius',
    veiculo: 'Rádio CBN',
    cargo: 'Âncora',
    email: 'marcos.v@cbn.com.br',
    telefone: '(11) 97766-5544',
    localizacao: 'São Paulo, SP',
    tags: ['Política', 'Educação'],
    favorito: false,
    status: 'ativo'
  }
];

export function EnterpriseCRM({ isDarkMode }: { isDarkMode: boolean }) {
  const [journalists, setJournalists] = useState<Journalist[]>(MOCK_JOURNALISTS);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">
            CRM de <span className="text-blue-600">Imprensa</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Gestão de relacionamento com veículos e jornalistas.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" />
            Adicionar Jornalista
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        <div className={cn(
          "flex-1 flex items-center gap-4 px-8 py-5 rounded-[2rem] border transition-all shadow-sm",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
        )}>
          <Search className="w-6 h-6 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, veículo ou tag..." 
            className="bg-transparent border-none outline-none text-lg font-medium w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 px-8 py-5 bg-white border border-slate-100 rounded-[2rem] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-5 h-5" />
            Filtros Avançados
          </button>
          <button className="p-5 bg-white border border-slate-100 rounded-[2rem] hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-6 h-6 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Journalist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {journalists.map((item) => (
          <motion.div 
            key={item.id}
            layout
            className={cn(
              "p-10 rounded-[3rem] shadow-xl border transition-all hover:shadow-2xl group relative overflow-hidden",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
            )}
          >
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center font-black text-3xl shadow-inner">
                  {item.nome.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-black">{item.nome}</h3>
                    {item.favorito && <Star className="w-5 h-5 fill-amber-400 text-amber-400" />}
                  </div>
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{item.veiculo}</p>
                </div>
              </div>
              <button className="p-3 hover:bg-slate-100 rounded-xl transition-all">
                <MoreVertical className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-6 mb-10">
              <div className="flex items-center gap-4 text-slate-500 font-medium">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                  <Newspaper className="w-5 h-5" />
                </div>
                <span>{item.cargo}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500 font-medium">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <span>{item.email}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500 font-medium">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <span>{item.telefone}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500 font-medium">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <span>{item.localizacao}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-10">
              {item.tags.map((tag, i) => (
                <span key={i} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-4 pt-8 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-all">
              <button className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                Ver Perfil
              </button>
              <button className="p-5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                <Edit2 className="w-5 h-5" />
              </button>
              <button className="p-5 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State / Add Modal Placeholder */}
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
              
              <h2 className="text-4xl font-black mb-10">Novo Jornalista</h2>
              
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                  <input type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Veículo</label>
                  <input type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">E-mail</label>
                  <input type="email" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Telefone</label>
                  <input type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" />
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                  Salvar Contato
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
