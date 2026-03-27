import { useState } from 'react';
import { 
  Search, Filter, MapPin, Plus, Trash2, 
  Download, Eye, Edit3, ChevronLeft, ChevronRight,
  Users, Activity, Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

const MOCK_CITIZENS = [
  { id: '1', name: 'Maria Silva', neighborhood: 'Vila Nova', engagement: 'Alto', lastContact: '2 dias atrás', tags: ['Liderança', 'Saúde'], status: 'Apoiador' },
  { id: '2', name: 'João Pereira', neighborhood: 'Centro', engagement: 'Médio', lastContact: '1 semana atrás', tags: ['Comércio', 'Segurança'], status: 'Neutro' },
  { id: '3', name: 'Ana Santos', neighborhood: 'Jardim Sul', engagement: 'Baixo', lastContact: '1 mês atrás', tags: ['Educação'], status: 'Apoiador' },
  { id: '4', name: 'Carlos Oliveira', neighborhood: 'Bairro Alto', engagement: 'Crítico', lastContact: 'Hoje', tags: ['Infraestrutura'], status: 'Opositor' },
  { id: '5', name: 'Roberto Souza', neighborhood: 'Vila Nova', engagement: 'Alto', lastContact: '3 dias atrás', tags: ['Liderança', 'Esporte'], status: 'Apoiador' },
  { id: '6', name: 'Lucia Mendes', neighborhood: 'Centro', engagement: 'Médio', lastContact: '2 semanas atrás', tags: ['Cultura'], status: 'Neutro' },
];

export function GabineteCidadaos({ isDarkMode }: { isDarkMode: boolean }) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="h-[calc(100vh-14rem)] flex flex-col glass-card overflow-hidden min-h-[700px] pb-10 border-white/5">
      {/* Header do CRM */}
      <div className="p-12 border-b border-white/5 bg-white/5 space-y-10 backdrop-blur-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
          <Users className="w-64 h-64 text-brand-emerald" />
        </div>
        
        <div className="flex items-center justify-between relative z-10">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-6xl font-black tracking-tighter text-white leading-none"
            >
              Base de <span className="text-brand-emerald drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">Cidadãos</span>
            </motion.h2>
            <p className="text-slate-500 font-bold mt-4 uppercase text-xs tracking-[0.3em] flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
              Gestão de relacionamento e lideranças comunitárias
            </p>
          </div>
          <div className="flex gap-6">
            <button className="px-10 py-5 glass-item border-white/10 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center gap-4 group shadow-xl">
              <Download className="w-6 h-6 text-brand-accent group-hover:scale-110 transition-transform" />
              Exportar Inteligência
            </button>
            <button className="px-10 py-5 bg-brand-accent text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.05] active:scale-[0.98] transition-all shadow-2xl shadow-brand-accent/30 flex items-center gap-4 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              Novo Cadastro
            </button>
          </div>
        </div>

        <div className="flex gap-6 relative z-10">
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
              <Search className="w-6 h-6 text-slate-500 group-focus-within:text-brand-accent transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Buscar por nome, bairro, CPF ou tag de interesse..." 
              className="w-full pl-20 pr-8 py-6 glass-item bg-white/5 border-white/5 focus:border-brand-accent/30 outline-none text-base font-bold text-white placeholder:text-slate-600 transition-all rounded-[2rem] shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-10 py-6 glass-item text-slate-400 font-black text-xs uppercase tracking-[0.2em] border-white/5 hover:text-white hover:bg-white/5 transition-all flex items-center gap-4 rounded-[2rem] shadow-xl">
            <Filter className="w-5 h-5 text-brand-emerald" />
            Filtros Avançados
          </button>
        </div>
      </div>

      {/* Tabela CRM */}
      <div className="flex-1 overflow-auto custom-scrollbar p-10">
        <table className="w-full border-separate border-spacing-y-6">
          <thead>
            <tr className="text-left">
              <th className="px-10 py-4 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Cidadão / Perfil</th>
              <th className="px-10 py-4 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Território</th>
              <th className="px-10 py-4 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Engajamento</th>
              <th className="px-10 py-4 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Interesses</th>
              <th className="px-10 py-4 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Último Contato</th>
              <th className="px-10 py-4 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Status Político</th>
              <th className="px-10 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CITIZENS.map((citizen, i) => (
              <motion.tr 
                key={citizen.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.005, x: 5 }}
                className="group glass-card border-white/5 hover:border-brand-accent/30 transition-all cursor-pointer bg-white/[0.02]"
              >
                <td className="px-10 py-8 rounded-l-[3rem]">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-brand-accent/10 border border-brand-accent/20 text-brand-accent flex items-center justify-center font-black text-2xl shadow-2xl group-hover:scale-110 transition-transform">
                      {citizen.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-white text-xl leading-none tracking-tight">{citizen.name}</p>
                      <p className="text-[10px] font-black text-slate-500 mt-3 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Activity className="w-3 h-3 text-brand-accent" />
                        Liderança Local
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-brand-rose/10 rounded-lg">
                      <MapPin className="w-4 h-4 text-brand-rose" />
                    </div>
                    <span className="text-sm font-bold text-slate-300">{citizen.neighborhood}</span>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-6">
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden max-w-[140px] p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ 
                          width: citizen.engagement === 'Alto' ? "100%" :
                                 citizen.engagement === 'Médio' ? "66%" :
                                 citizen.engagement === 'Baixo' ? "33%" : "100%"
                        }}
                        className={cn(
                          "h-full rounded-full shadow-[0_0_15px_currentColor] transition-all duration-1000",
                          citizen.engagement === 'Alto' ? "bg-brand-emerald text-brand-emerald" :
                          citizen.engagement === 'Médio' ? "bg-brand-amber text-brand-amber" :
                          citizen.engagement === 'Baixo' ? "bg-slate-500 text-slate-500" : "bg-brand-rose text-brand-rose animate-pulse"
                        )}
                      />
                    </div>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-[0.2em]",
                      citizen.engagement === 'Alto' ? "text-brand-emerald" :
                      citizen.engagement === 'Médio' ? "text-brand-amber" :
                      citizen.engagement === 'Baixo' ? "text-slate-500" : "text-brand-rose"
                    )}>
                      {citizen.engagement}
                    </span>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex flex-wrap gap-3">
                    {citizen.tags.map(tag => (
                      <span key={tag} className="px-4 py-1.5 glass-item border-white/5 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-bold text-slate-400">{citizen.lastContact}</span>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <span className={cn(
                    "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-lg inline-block",
                    citizen.status === 'Apoiador' ? "bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20 shadow-brand-emerald/5" :
                    citizen.status === 'Opositor' ? "bg-brand-rose/10 text-brand-rose border-brand-rose/20 shadow-brand-rose/5" :
                    "bg-white/5 text-slate-400 border-white/10"
                  )}>
                    {citizen.status}
                  </span>
                </td>
                <td className="px-10 py-8 text-right rounded-r-[3rem]">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                    <button className="p-4 glass-item border-white/10 text-slate-400 hover:text-brand-emerald hover:bg-brand-emerald/10 rounded-2xl shadow-2xl transition-all group/btn">
                      <Eye className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button className="p-4 glass-item border-white/10 text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-2xl shadow-2xl transition-all group/btn">
                      <Edit3 className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button className="p-4 glass-item border-white/10 text-slate-400 hover:text-brand-rose hover:bg-brand-rose/10 rounded-2xl shadow-2xl transition-all group/btn">
                      <Trash2 className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer do CRM */}
      <div className="p-12 border-t border-white/5 bg-white/5 flex items-center justify-between backdrop-blur-3xl rounded-b-[3rem]">
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
          Mostrando 6 de 1,240 cidadãos mapeados estrategicamente
        </p>
        <div className="flex gap-4">
          <button className="w-14 h-14 flex items-center justify-center rounded-[1.5rem] glass-item border-white/5 text-slate-500 hover:text-white hover:bg-white/5 transition-all shadow-xl">
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button className="w-14 h-14 flex items-center justify-center rounded-[1.5rem] bg-brand-accent text-white font-black text-base shadow-2xl shadow-brand-accent/30 hover:scale-110 transition-transform">1</button>
          <button className="w-14 h-14 flex items-center justify-center rounded-[1.5rem] glass-item border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-all font-black text-base shadow-xl">2</button>
          <button className="w-14 h-14 flex items-center justify-center rounded-[1.5rem] glass-item border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-all font-black text-base shadow-xl">3</button>
          <button className="w-14 h-14 flex items-center justify-center rounded-[1.5rem] glass-item border-white/5 text-slate-500 hover:text-white hover:bg-white/5 transition-all shadow-xl">
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
}
