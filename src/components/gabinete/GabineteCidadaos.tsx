import { useState } from 'react';
import { 
  Search, Filter, MapPin, Plus, Trash2, 
  Download, Eye, Edit3, ChevronLeft, ChevronRight,
  Activity, Clock, FolderPlus, CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useTerminologia } from '../../hooks/useTerminologia';

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
  const { termo } = useTerminologia();
  const termoPlural = termo('cidadaos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const notify = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2200);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 flex flex-col gap-6 min-h-[calc(100vh-12rem)] overflow-x-hidden">
      {/* Linha 1: Cabeçalho */}
      <div className="glass-card p-5">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold tracking-tight text-white"
            >
              Base de <span className="text-brand-emerald">{termoPlural}</span>
            </motion.h2>
            <p className="text-sm text-slate-500 font-medium mt-2">
              Gestão de relacionamento e lideranças comunitárias
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => notify('Exportacao de inteligencia iniciada.')} className="px-4 py-2.5 glass-item border-white/10 text-white rounded-xl font-semibold text-sm hover:bg-white/10 transition-all flex items-center gap-2">
              <Download className="w-4 h-4 text-brand-accent" />
              Exportar Inteligência
            </button>
            <button onClick={() => notify(`Novo cadastro de ${termo('cidadao').toLowerCase()} aberto.`)} className="px-4 py-2.5 bg-brand-accent text-white rounded-xl font-semibold text-sm hover:bg-brand-accent/90 transition-all shadow-lg shadow-brand-accent/20 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Cadastro
            </button>
          </div>
        </div>
      </div>

      {/* Linha 2: Busca e filtros */}
      <div className="glass-card p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome, bairro, CPF ou tag de interesse..."
              className="w-full pl-11 pr-4 py-2.5 glass-item bg-white/5 border-white/5 focus:border-brand-accent/30 outline-none text-sm font-medium text-white placeholder:text-slate-600 transition-all rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => notify('Filtro avancado aplicado.')} className="px-4 py-2.5 glass-item text-slate-300 font-semibold text-sm border-white/5 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 rounded-xl">
            <Filter className="w-4 h-4 text-brand-emerald" />
            Filtros Avançados
          </button>
        </div>
      </div>

      {/* Linha 3: Lista de contatos */}
      <div className="glass-card p-4 flex-1 min-h-0">
        <div className="flex flex-col gap-4 h-full overflow-auto custom-scrollbar pr-1">
          {MOCK_CITIZENS.map((citizen, i) => (
            <motion.div
              key={citizen.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className="w-full rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col xl:flex-row xl:items-center gap-4 hover:border-brand-accent/30 transition-all"
            >
              <div className="flex items-center gap-4 min-w-0 xl:min-w-[300px]">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-accent/30 to-brand-accent/10 border border-white/10 text-white flex items-center justify-center font-black text-lg shadow-[0_0_20px_rgba(16,185,129,0.25)] shrink-0">
                  {citizen.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white text-base leading-none tracking-tight truncate">{citizen.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      citizen.engagement === 'Crítico' ? "bg-rose-500/20 text-rose-300 border-rose-400" :
                      citizen.engagement === 'Alto' ? "bg-brand-emerald/20 text-brand-emerald border-brand-emerald" :
                      citizen.engagement === 'Médio' ? "bg-blue-400/20 text-blue-300 border-blue-400" :
                      "bg-slate-500/20 text-slate-200 border-slate-400"
                    )}>
                      {citizen.engagement === 'Crítico' ? 'Urgente' : citizen.engagement === 'Médio' ? 'Informação' : citizen.engagement}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
                      {citizen.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-slate-300 xl:min-w-[360px]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-rose" />
                  <span>{citizen.neighborhood}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>{citizen.lastContact}</span>
                </div>
                <div className="flex items-center gap-2 min-w-[140px]">
                  <Activity className="w-4 h-4 text-brand-emerald" />
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em]",
                    citizen.engagement === 'Alto' ? "text-brand-emerald" :
                    citizen.engagement === 'Médio' ? "text-brand-amber" :
                    citizen.engagement === 'Baixo' ? "text-slate-500" : "text-brand-rose"
                  )}>
                    {citizen.engagement}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2">
                  {citizen.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1.5 glass-item border-white/5 text-slate-300 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 xl:justify-end">
                <button onClick={() => notify('Detalhes da mensagem abertos.')} className="p-2.5 glass-item border-white/10 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Ver Mensagem">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => notify(`Edicao de ${termo('cidadao').toLowerCase()} iniciada.`)} className="p-2.5 glass-item border-white/10 text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-all" title="Editar">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => notify(`${termo('cidadao')} removido da listagem.`)} className="p-2.5 glass-item border-white/10 text-slate-400 hover:text-brand-rose hover:bg-brand-rose/10 rounded-lg transition-all" title="Excluir">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => notify('Contato salvo em pasta estrategica.')} className="p-2.5 glass-item border-white/10 text-slate-400 hover:text-brand-emerald hover:bg-brand-emerald/10 rounded-lg transition-all" title="Salvar em Pasta">
                  <FolderPlus className="w-4 h-4" />
                </button>
                <button onClick={() => notify('Contato marcado como lido.')} className="p-2.5 glass-item border-white/10 text-slate-400 hover:text-brand-emerald hover:bg-brand-emerald/10 rounded-lg transition-all" title="Marcar como Lido">
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Linha 4: Paginação */}
      <div className="glass-card p-4 mt-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Mostrando 6 de 1,240 {termoPlural.toLowerCase()} mapeados estrategicamente
          </p>
          <div className="flex gap-2">
            <button onClick={() => notify('Pagina anterior carregada.')} className="w-10 h-10 flex items-center justify-center rounded-xl glass-item border-white/5 text-slate-500 hover:text-white hover:bg-white/5 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => notify('Pagina 1 selecionada.')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-accent text-white font-black text-sm shadow-lg shadow-brand-accent/30">1</button>
            <button onClick={() => notify('Pagina 2 selecionada.')} className="w-10 h-10 flex items-center justify-center rounded-xl glass-item border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-all font-black text-sm">2</button>
            <button onClick={() => notify('Pagina 3 selecionada.')} className="w-10 h-10 flex items-center justify-center rounded-xl glass-item border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-all font-black text-sm">3</button>
            <button onClick={() => notify('Proxima pagina carregada.')} className="w-10 h-10 flex items-center justify-center rounded-xl glass-item border-white/5 text-slate-500 hover:text-white hover:bg-white/5 transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-emerald-300/30 bg-emerald-500/15 px-4 py-3 text-xs font-black uppercase tracking-widest text-emerald-200 shadow-xl">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
