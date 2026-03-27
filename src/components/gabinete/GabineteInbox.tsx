import { useState } from 'react';
import { 
  Inbox, Search, Filter, 
  MessageSquare, User, MapPin, 
  Clock, AlertCircle, CheckCircle2, 
  MoreVertical, Edit2, Trash2, 
  ArrowRight, Sparkles, Loader2,
  Phone, Mail, Share2, Send, Activity, RefreshCw,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

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
  const [selectedDemand, setSelectedDemand] = useState(MOCK_DEMANDS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const simulateAIAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  return (
    <div className="h-[calc(100vh-14rem)] flex gap-10 overflow-hidden min-h-[600px] pb-10">
      {/* Sidebar de Demandas */}
      <div className="w-[520px] flex flex-col glass-card overflow-hidden border-white/5">
        <div className="p-12 border-b border-white/5 space-y-10 bg-white/5 backdrop-blur-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-5xl font-black tracking-tighter text-white">Mensagens</h2>
            <div className="flex items-center gap-3 px-4 py-2 glass-item border-brand-emerald/30 rounded-full">
              <span className="w-2.5 h-2.5 bg-brand-emerald rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black text-brand-emerald uppercase tracking-[0.2em]">Ao Vivo</span>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-500 group-focus-within:text-brand-accent transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Filtrar por bairro ou assunto..." 
              className="w-full pl-16 pr-6 py-5 glass-item bg-white/5 border-white/5 focus:border-brand-accent/30 outline-none text-sm font-bold text-white placeholder:text-slate-600 transition-all rounded-2xl shadow-inner" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {MOCK_DEMANDS.map((demand) => (
            <motion.div 
              key={demand.id}
              whileHover={{ x: 4 }}
              onClick={() => setSelectedDemand(demand)}
              className={cn(
                "p-10 glass-card border-white/5 transition-all cursor-pointer relative overflow-hidden group",
                selectedDemand.id === demand.id 
                  ? "bg-brand-accent/10 border-brand-accent/30 shadow-[0_0_30px_rgba(99,102,241,0.1)]" 
                  : "hover:bg-white/5"
              )}
            >
              {selectedDemand.id === demand.id && (
                <motion.div layoutId="active-indicator" className="absolute left-0 top-10 bottom-10 w-1.5 bg-brand-accent rounded-r-full shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
              )}
              
              <div className="flex items-start gap-8">
                <div className="relative">
                  <img src={demand.avatar} className="w-20 h-20 rounded-3xl object-cover shadow-2xl border-2 border-white/10 group-hover:scale-105 transition-transform" alt={demand.voter} referrerPolicy="no-referrer" />
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-brand-bg shadow-lg",
                    demand.priority === 'Crítica' ? "bg-brand-rose" :
                    demand.priority === 'Alta' ? "bg-brand-amber" : "bg-brand-emerald"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-black text-xl truncate tracking-tight text-white">{demand.voter}</p>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{demand.date}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-400 mb-6 truncate leading-none">{demand.subject}</p>
                  
                  <div className="flex flex-wrap gap-3">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm",
                      demand.priority === 'Crítica' ? "bg-brand-rose/20 text-brand-rose border-brand-rose/30" :
                      demand.priority === 'Alta' ? "bg-brand-amber/20 text-brand-amber border-brand-amber/30" :
                      "bg-brand-emerald/20 text-brand-emerald border-brand-emerald/30"
                    )}>
                      {demand.priority}
                    </span>
                    <span className="px-4 py-1.5 glass-item text-slate-500 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border-white/5">
                      {demand.neighborhood}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detalhes da Demanda */}
      <div className="flex-1 flex flex-col glass-card overflow-hidden border-white/5">
        <div className="p-12 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-3xl">
          <div className="flex items-center gap-10">
            <div className="relative">
              <img src={selectedDemand.avatar} className="w-28 h-28 rounded-[3rem] object-cover shadow-2xl border-4 border-white/10" alt={selectedDemand.voter} referrerPolicy="no-referrer" />
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 p-3 bg-brand-accent rounded-2xl shadow-xl"
              >
                <User className="w-5 h-5 text-white" />
              </motion.div>
            </div>
            <div>
              <h3 className="text-5xl font-black tracking-tighter text-white">{selectedDemand.voter}</h3>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-3 px-5 py-2.5 glass-item border-white/10 rounded-2xl shadow-inner">
                  <MapPin className="w-4 h-4 text-brand-emerald" />
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{selectedDemand.neighborhood}</span>
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 glass-item border-white/10 rounded-2xl shadow-inner">
                  <Activity className="w-4 h-4 text-brand-accent" />
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{selectedDemand.category}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="p-6 glass-item text-slate-400 hover:text-brand-emerald hover:bg-brand-emerald/10 rounded-[2rem] transition-all border-white/5 shadow-xl group">
              <Phone className="w-7 h-7 group-hover:scale-110 transition-transform" />
            </button>
            <button className="p-6 glass-item text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-[2rem] transition-all border-white/5 shadow-xl group">
              <Mail className="w-7 h-7 group-hover:scale-110 transition-transform" />
            </button>
            <button className="p-6 glass-item text-slate-400 hover:text-brand-rose hover:bg-brand-rose/10 rounded-[2rem] transition-all border-white/5 shadow-xl group">
              <Trash2 className="w-7 h-7 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-16 space-y-16 custom-scrollbar">
          {/* Mensagem e Foto */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-accent shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                Relato do Eleitor
              </h4>
              <div className="p-12 glass-item border-white/5 rounded-[4rem] relative bg-white/5 shadow-inner group">
                <p className="text-2xl font-medium leading-relaxed text-slate-300 italic">
                  "{selectedDemand.message}"
                </p>
                <div className="absolute -bottom-6 -right-6 p-6 glass-card border-white/10 shadow-2xl bg-brand-surface/90">
                  <Clock className="w-6 h-6 text-brand-accent" />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-rose shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                Evidência Anexada
              </h4>
              <div className="relative group cursor-zoom-in overflow-hidden rounded-[4rem] border-4 border-white/10 shadow-2xl aspect-video">
                <img 
                  src={selectedDemand.photo} 
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" 
                  alt="Evidência do problema" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-brand-bg/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <div className="px-10 py-5 glass-card border-white/20 rounded-full font-black text-[10px] uppercase tracking-[0.3em] text-white shadow-2xl">Ampliar Evidência</div>
                </div>
              </div>
            </div>
          </div>

          {/* Análise IA com Urgência Tag */}
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-brand-accent" />
                Triagem por Inteligência Artificial
              </h4>
              <button 
                onClick={simulateAIAnalysis}
                className="flex items-center gap-3 text-[10px] font-black text-brand-accent uppercase tracking-[0.2em] hover:text-white transition-colors group"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />}
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
                  className="p-20 glass-card border-brand-accent/30 border-dashed flex flex-col items-center justify-center text-center gap-8 bg-brand-accent/5 rounded-[4rem]"
                >
                  <div className="relative">
                    <Loader2 className="w-16 h-16 text-brand-accent animate-spin" />
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-brand-accent animate-pulse" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white tracking-tighter">IA Analisando Gravidade...</p>
                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">Cruzando com histórico do bairro e impacto eleitoral.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                  <div className="p-12 glass-card border-brand-rose/30 bg-brand-rose/5 relative overflow-hidden group hover:bg-brand-rose/10 transition-colors rounded-[3rem]">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <AlertCircle className="w-24 h-24 text-brand-rose" />
                    </div>
                    <p className="text-[10px] font-black text-brand-rose uppercase tracking-[0.2em] mb-6">Classificação de Urgência</p>
                    <p className="text-4xl font-black text-white tracking-tighter mb-3">{selectedDemand.urgencyTag}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-rose" />
                      <p className="text-[10px] font-black text-brand-rose/70 uppercase tracking-widest">Nível: {selectedDemand.priority}</p>
                    </div>
                  </div>

                  <div className="p-12 glass-card border-brand-emerald/30 bg-brand-emerald/5 relative overflow-hidden group hover:bg-brand-emerald/10 transition-colors rounded-[3rem]">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <TrendingUp className="w-24 h-24 text-brand-emerald" />
                    </div>
                    <p className="text-[10px] font-black text-brand-emerald uppercase tracking-[0.2em] mb-6">Impacto Eleitoral</p>
                    <p className="text-4xl font-black text-white tracking-tighter mb-3">Alto</p>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
                      <p className="text-[10px] font-black text-brand-emerald/70 uppercase tracking-widest">Zona de influência direta</p>
                    </div>
                  </div>

                  <div className="p-12 glass-card border-brand-accent/30 bg-brand-accent/5 relative overflow-hidden group hover:bg-brand-accent/10 transition-colors rounded-[3rem]">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Send className="w-24 h-24 text-brand-accent" />
                    </div>
                    <p className="text-[10px] font-black text-brand-accent uppercase tracking-[0.2em] mb-6">Sugestão de Resposta</p>
                    <p className="text-4xl font-black text-white tracking-tighter mb-3">Ofício</p>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                      <p className="text-[10px] font-black text-brand-accent/70 uppercase tracking-widest">Encaminhar p/ Sec. Obras</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ações do Gabinete */}
          <div className="space-y-10 pt-8">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Fluxo de Resolução</h4>
            <div className="flex gap-8">
              <button className="flex-1 py-8 bg-brand-accent text-white rounded-[2rem] font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-brand-accent/30 flex items-center justify-center gap-5 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Send className="w-7 h-7 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Protocolar Ofício Oficial
              </button>
              <button className="flex-1 py-8 glass-item border-white/10 text-white rounded-[2rem] font-black text-xl hover:bg-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-5 shadow-xl">
                <Share2 className="w-7 h-7 text-brand-emerald" />
                Notificar p/ WhatsApp
              </button>
              <button className="px-16 py-8 glass-item border-white/5 text-slate-500 rounded-[2rem] font-black text-xl hover:text-white hover:bg-white/5 active:scale-[0.98] transition-all">
                Arquivar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
