import { useState } from 'react';
import { 
  Users, Search, Filter, Plus, 
  TrendingUp, TrendingDown, Activity,
  MessageSquare, Share2, Globe,
  MoreVertical, Edit2, Trash2, Zap,
  BarChart3, PieChart, Star,
  ChevronRight, ArrowRight, CheckCircle2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface Influencer {
  id: string;
  nome: string;
  handle: string;
  plataforma: 'Instagram' | 'Facebook' | 'Twitter' | 'YouTube' | 'TikTok';
  seguidores: string;
  engajamento: string;
  alcance: string;
  status: 'ativo' | 'pausado' | 'mapeado';
  tags: string[];
  avatar: string;
}

const MOCK_INFLUENCERS: Influencer[] = [
  {
    id: 'INF-001',
    nome: 'Carlos Silva',
    handle: '@carlinhos_local',
    plataforma: 'Instagram',
    seguidores: '45K',
    engajamento: '5.2%',
    alcance: '120K',
    status: 'ativo',
    tags: ['Comunidade', 'Eventos', 'Bairro Centro'],
    avatar: 'https://picsum.photos/seed/carlos/200'
  },
  {
    id: 'INF-002',
    nome: 'Mariana Costa',
    handle: '@mari_saude_bemestar',
    plataforma: 'Instagram',
    seguidores: '120K',
    engajamento: '3.8%',
    alcance: '350K',
    status: 'ativo',
    tags: ['Saúde', 'Bem-estar', 'Fitness'],
    avatar: 'https://picsum.photos/seed/mari/200'
  },
  {
    id: 'INF-003',
    nome: 'João Pedro',
    handle: '@jp_noticias_locais',
    plataforma: 'Facebook',
    seguidores: '85K',
    engajamento: '2.1%',
    alcance: '200K',
    status: 'pausado',
    tags: ['Notícias', 'Política', 'Bairro Sul'],
    avatar: 'https://picsum.photos/seed/joao/200'
  },
  {
    id: 'INF-004',
    nome: 'Beatriz Lima',
    handle: '@bia_educacao',
    plataforma: 'YouTube',
    seguidores: '250K',
    engajamento: '4.5%',
    alcance: '1.2M',
    status: 'mapeado',
    tags: ['Educação', 'Infantil', 'Cultura'],
    avatar: 'https://picsum.photos/seed/bia/200'
  }
];

export function EnterpriseInfluenciadores({ isDarkMode }: { isDarkMode: boolean }) {
  const [influencers, setInfluencers] = useState<Influencer[]>(MOCK_INFLUENCERS);
  const [search, setSearch] = useState('');

  const toggleStatus = (id: string) => {
    setInfluencers(prev => prev.map(inf => {
      if (inf.id === id) {
        return { ...inf, status: inf.status === 'ativo' ? 'pausado' : 'ativo' };
      }
      return inf;
    }));
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">
            Gestão de <span className="text-blue-600">Influenciadores</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Mapeamento e monitoramento de perfis estratégicos.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <Plus className="w-5 h-5" />
            Mapear Novo Perfil
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
            placeholder="Pesquisar por nome, handle ou tag..." 
            className="bg-transparent border-none outline-none text-lg font-medium w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 px-8 py-5 bg-white border border-slate-100 rounded-[2rem] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-5 h-5" />
            Filtros
          </button>
        </div>
      </div>

      {/* Influencer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {influencers.map((item) => (
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
                <img 
                  src={item.avatar} 
                  alt={item.nome} 
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-[2rem] object-cover shadow-inner"
                />
                <div>
                  <h3 className="text-2xl font-black">{item.nome}</h3>
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{item.handle}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button className="p-3 hover:bg-slate-100 rounded-xl transition-all">
                  <MoreVertical className="w-5 h-5 text-slate-400" />
                </button>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                  item.status === 'ativo' ? "bg-emerald-100 text-emerald-600" : 
                  item.status === 'pausado' ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"
                )}>
                  {item.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className="text-center p-4 bg-slate-50 rounded-3xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Seguidores</p>
                <p className="text-lg font-black text-slate-900">{item.seguidores}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-3xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Engaj.</p>
                <p className="text-lg font-black text-slate-900">{item.engajamento}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-3xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Alcance</p>
                <p className="text-lg font-black text-slate-900">{item.alcance}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-10">
              {item.tags.map((tag, i) => (
                <span key={i} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-6 rounded-full p-1 transition-all cursor-pointer relative",
                  item.status === 'ativo' ? "bg-emerald-500" : "bg-slate-300"
                )} onClick={() => toggleStatus(item.id)}>
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                    item.status === 'ativo' ? "translate-x-6" : "translate-x-0"
                  )} />
                </div>
                <span className="text-xs font-bold text-slate-500">Parceria Ativa</span>
              </div>
              
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button className="p-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button className="p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
