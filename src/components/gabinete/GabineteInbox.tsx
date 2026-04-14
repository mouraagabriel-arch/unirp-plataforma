import { useState } from 'react';
import { 
  Inbox, Search, Filter, 
  MessageSquare, User, MapPin, 
  Clock, AlertCircle, CheckCircle2, 
  MoreVertical, Edit2, Trash2, 
  Eye, FolderPlus, Bookmark,
  ArrowRight, Sparkles, Loader2,
  Phone, Mail, Share2, Send, Activity, RefreshCw,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { handleOpenmailto } from '../../lib/buttonHandlers';

const MOCK_DEMANDS = [
  { 
    id: '1', 
    voter: 'Maria Silva', 
    neighborhood: 'Vila Nova', 
    subject: 'Buraco na Rua das Flores', 
    priority: 'Alta', 
    category: 'Infraestrutura', 
    status: 'Pendente', 
    date: '25 Mar, 14:30',
    avatar: 'https://picsum.photos/seed/maria/100/100',
    message: 'Gostaria de solicitar o conserto de um buraco enorme na Rua das Flores, em frente ao número 450. Está perigoso para os carros e pedestres.',
    photo: 'https://picsum.photos/seed/pothole/800/600',
    urgencyTag: 'Risco de Acidente'
  },
  { 
    id: '2', 
    voter: 'João Pereira', 
    neighborhood: 'Centro', 
    subject: 'Falta de Iluminação na Praça Central', 
    priority: 'Média', 
    category: 'Segurança', 
    status: 'Em Análise', 
    date: '25 Mar, 11:15',
    avatar: 'https://picsum.photos/seed/joao/100/100',
    message: 'A praça central está muito escura à noite. As lâmpadas dos postes do lado leste estão queimadas há mais de uma semana.',
    photo: 'https://picsum.photos/seed/darkpark/800/600',
    urgencyTag: 'Insegurança Noturna'
  },
  { 
    id: '3', 
    voter: 'Ana Santos', 
    neighborhood: 'Jardim Sul', 
    subject: 'Agradecimento: Limpeza do Terreno', 
    priority: 'Baixa', 
    category: 'Relacionamento', 
    status: 'Concluído', 
    date: '24 Mar, 16:45',
    avatar: 'https://picsum.photos/seed/ana/100/100',
    message: 'Passando para agradecer o empenho do gabinete na limpeza do terreno baldio aqui da rua. Ficou ótimo!',
    photo: 'https://picsum.photos/seed/cleanland/800/600',
    urgencyTag: 'Feedback Positivo'
  },
  { 
    id: '4', 
    voter: 'Carlos Oliveira', 
    neighborhood: 'Bairro Alto', 
    subject: 'Falta de Vagas na Creche Municipal', 
    priority: 'Crítica', 
    category: 'Educação', 
    status: 'Pendente', 
    date: '24 Mar, 09:30',
    avatar: 'https://picsum.photos/seed/carlos/100/100',
    message: 'Estou há 6 meses na fila de espera por uma vaga na creche para meu filho de 2 anos. Preciso trabalhar e não tenho com quem deixá-lo.',
    photo: 'https://picsum.photos/seed/school/800/600',
    urgencyTag: 'Direito à Educação'
  },
];

export function GabineteInbox({ isDarkMode }: { isDarkMode: boolean }) {
  const [toastMessage, setToastMessage] = useState<{text: string; type: 'success'|'error'}|null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [selectedDemand, setSelectedDemand] = useState(MOCK_DEMANDS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Toast auto-hide
  if (toastMessage) {
    setTimeout(() => setToastMessage(null), 3000);
  }

  const simulateAIAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-12rem)] flex gap-4 overflow-hidden min-h-[500px]">
      {/* Sidebar de Demandas */}
      <div className="w-80 flex flex-col glass-card overflow-hidden border-white/5">
        <div className="px-4 py-3 border-b border-white/5 space-y-3 bg-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Caixa de Entrada</h2>
            <div className="flex items-center gap-2 px-2.5 py-1 glass-item border-brand-emerald/30 rounded-full">
              <span className="w-1.5 h-1.5 bg-brand-emerald rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-brand-emerald uppercase tracking-[0.15em]">Ao Vivo</span>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <input 
              type="text" 
              placeholder="Filtrar mensagens..." 
              className="w-full pl-8 pr-3 py-2 glass-item bg-white/5 border-white/5 focus:border-brand-accent/30 outline-none text-xs font-medium text-white placeholder:text-slate-600 transition-all rounded-lg" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {MOCK_DEMANDS.map((demand) => (
            <motion.div 
              key={demand.id}
              whileHover={{ x: 4 }}
              onClick={() => setSelectedDemand(demand)}
              className={cn(
                "p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden",
                selectedDemand.id === demand.id 
                  ? "bg-brand-accent/10 border-brand-accent/30" 
                  : "border-white/5 hover:bg-white/5"
              )}
            >
              {selectedDemand.id === demand.id && (
                <motion.div layoutId="active-indicator" className="absolute left-0 top-3 bottom-3 w-0.5 bg-brand-accent rounded-r-full" />
              )}
              
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <img src={demand.avatar} className="w-9 h-9 rounded-xl object-cover border border-white/10" alt={demand.voter} referrerPolicy="no-referrer" />
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-brand-bg",
                    demand.priority === 'Crítica' ? "bg-brand-rose" :
                    demand.priority === 'Alta' ? "bg-brand-amber" : "bg-brand-emerald"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-semibold text-sm text-white truncate">{demand.voter}</p>
                    <span className="text-[10px] text-slate-500 flex-shrink-0 ml-2">{demand.date.split(',')[0]}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mb-1.5">{demand.subject}</p>
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                      demand.priority === 'Crítica' ? "bg-rose-400/20 text-rose-300" :
                      demand.priority === 'Alta' ? "bg-brand-amber/20 text-brand-amber" :
                      demand.priority === 'Média' ? "bg-blue-400/20 text-blue-300" :
                      "bg-brand-emerald/20 text-brand-emerald"
                    )}>
                      {demand.priority}
                    </span>
                    <span className="text-[9px] text-slate-500 truncate">{demand.neighborhood}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detalhes da Demanda */}
      <div className="flex-1 flex flex-col glass-card overflow-hidden border-white/5 min-w-0">
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={selectedDemand.avatar} className="w-10 h-10 rounded-xl object-cover border border-white/10" alt={selectedDemand.voter} referrerPolicy="no-referrer" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{selectedDemand.voter}</h3>
              <div className="flex items-center gap-3 mt-0.5">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-brand-emerald" />
                  <span className="text-xs text-slate-400">{selectedDemand.neighborhood}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-brand-accent" />
                  <span className="text-xs text-slate-400">{selectedDemand.category}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => {
              setToastMessage({text: '📞 Iniciando chamada para ' + selectedDemand.voter, type: 'success'});
            }} className="p-2 glass-item text-slate-400 hover:text-brand-emerald hover:bg-brand-emerald/10 rounded-lg transition-all border-white/5 group">
              <Phone className="w-4 h-4" />
            </button>
            <button onClick={() => {
              handleOpenmailto(selectedDemand.voter.toLowerCase().replace(' ', '.') + '@email.com', 'Re: ' + selectedDemand.subject);
              setToastMessage({text: '✉️ Abrindo cliente de email...', type: 'success'});
            }} className="p-2 glass-item text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-all border-white/5 group">
              <Mail className="w-4 h-4" />
            </button>
            <button onClick={() => {
              setIsDeleting(true);
              setTimeout(() => {
                setIsDeleting(false);
                setToastMessage({text: '✅ Demanda deletada com sucesso!', type: 'success'});
                setSelectedDemand(MOCK_DEMANDS[1]);
              }, 1500);
            }} disabled={isDeleting} className="p-2 glass-item text-slate-400 hover:text-brand-rose hover:bg-brand-rose/10 rounded-lg transition-all border-white/5 group disabled:opacity-70">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* Mensagem e Foto */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                Relato do Eleitor
              </h4>
              <div className="p-4 glass-item border-white/5 rounded-xl bg-white/5">
                <p className="text-sm leading-relaxed text-slate-300 italic">
                  "{selectedDemand.message}"
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-rose" />
                Evidência Anexada
              </h4>
              <div className="relative group cursor-zoom-in overflow-hidden rounded-xl border border-white/10 aspect-video">
                <img 
                  src={selectedDemand.photo} 
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" 
                  alt="Evidência do problema" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-brand-bg/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <div className="px-4 py-2 glass-card border-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-white">Ampliar</div>
                </div>
              </div>
            </div>
          </div>

          {/* Análise IA com Urgência Tag */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-brand-accent" />
                Triagem por Inteligência Artificial
              </h4>
              <button 
                onClick={simulateAIAnalysis}
                className="flex items-center gap-1.5 text-[10px] font-bold text-brand-accent uppercase tracking-wider hover:text-white transition-colors"
              >
                {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Recalcular Análise
              </button>
            </div>

            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div 
                  key="analyzing"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="p-8 glass-card border-brand-accent/30 border-dashed flex flex-col items-center justify-center text-center gap-3 bg-brand-accent/5 rounded-xl"
                >
                  <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
                  <div>
                    <p className="text-sm font-bold text-white">IA Analisando Gravidade...</p>
                    <p className="text-slate-500 text-xs mt-1">Cruzando com histórico do bairro e impacto eleitoral.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-3 gap-3"
                >
                  <div className="p-3 glass-card border-brand-rose/30 bg-brand-rose/5 rounded-xl">
                    <p className="text-[9px] font-bold text-brand-rose uppercase tracking-wider mb-2">Urgência</p>
                    <p className="text-sm font-semibold text-white mb-1">{selectedDemand.urgencyTag}</p>
                    <p className="text-[9px] text-brand-rose/70">Nível: {selectedDemand.priority}</p>
                  </div>

                  <div className="p-3 glass-card border-brand-emerald/30 bg-brand-emerald/5 rounded-xl">
                    <p className="text-[9px] font-bold text-brand-emerald uppercase tracking-wider mb-2">Impacto</p>
                    <p className="text-sm font-semibold text-white mb-1">Alto</p>
                    <p className="text-[9px] text-brand-emerald/70">Influência direta</p>
                  </div>

                  <div className="p-3 glass-card border-brand-accent/30 bg-brand-accent/5 rounded-xl">
                    <p className="text-[9px] font-bold text-brand-accent uppercase tracking-wider mb-2">Resposta</p>
                    <p className="text-sm font-semibold text-white mb-1">Ofício</p>
                    <p className="text-[9px] text-brand-accent/70">Sec. Obras</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ações do Gabinete */}
          <div className="space-y-2 pt-2">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fluxo de Resolução</h4>
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 bg-brand-accent text-white rounded-lg font-semibold text-sm hover:bg-brand-accent/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                Protocolar Ofício
              </button>
              <button className="flex-1 py-2.5 glass-item border-white/10 text-white rounded-lg font-semibold text-sm hover:bg-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4 text-brand-emerald" />
                Notificar WhatsApp
              </button>
              <button className="px-4 py-2.5 glass-item border-white/5 text-slate-400 rounded-lg text-sm hover:text-white hover:bg-white/5 transition-all">
                Arquivar
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              'fixed bottom-6 left-6 px-6 py-4 rounded-xl font-bold text-white shadow-xl',
              toastMessage.type === 'success' ? 'bg-brand-emerald' : 'bg-brand-rose',
              'z-50'
            )}
          >
            {toastMessage.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
