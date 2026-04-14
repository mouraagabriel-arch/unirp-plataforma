import { useState } from 'react';
import { 
  MessageSquare, Send, Sparkles, 
  Loader2, Copy, Download, 
  History, Share2, AlertCircle,
  ShieldCheck, Globe, Users,
  CheckCircle2, XCircle, Landmark,
  Zap, FileText, Filter, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const MOCK_TOPICS = [
  { id: '1', title: 'Aumento do IPTU', date: '25 Mar, 2024', status: 'Publicado', sentiment: 'Crítico' },
  { id: '2', title: 'Reforma da Previdência Municipal', date: '24 Mar, 2024', status: 'Em Rascunho', sentiment: 'Sensível' },
  { id: '3', title: 'Greve dos Professores', date: '22 Mar, 2024', status: 'Publicado', sentiment: 'Alto Risco' },
];

export function GabinetePosicionamento({ isDarkMode }: { isDarkMode: boolean }) {
  const [toastMessage, setToastMessage] = useState<{text: string; type: 'success'|'error'}|null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [positioning, setPositioning] = useState<any>(null);

  // Toast auto-hide
  if (toastMessage) {
    setTimeout(() => setToastMessage(null), 3000);
  }

  const generatePositioning = () => {
    if (!topic) return;
    setIsGenerating(true);
    setTimeout(() => {
      setPositioning({
        title: `Nota Oficial: ${topic}`,
        content: `O Gabinete do Vereador vem a público esclarecer sua posição sobre ${topic}. Reafirmamos nosso compromisso com a transparência e o bem-estar da população. Entendemos as preocupações levantadas e estamos trabalhando para garantir que o interesse público prevaleça em todas as decisões legislativas.`,
        tags: ['Transparência', 'Compromisso', 'Diálogo'],
        audience: 'Eleitorado Geral',
        risk: 'Médio'
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6 pb-10 overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-black tracking-tighter text-white"
          >
            Central de <span className="text-brand-accent drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">Posicionamento</span>
          </motion.h1>
          <p className="text-slate-400 font-medium max-w-2xl">
            Gere notas oficiais, comunicados e posicionamentos estratégicos com o auxílio da IA, garantindo o tom de voz ideal para cada situação política.
          </p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex gap-4"
        >
          <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className="flex items-center gap-3 px-4 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all duration-300">
            <History className="w-3.5 h-3.5" />
            Histórico de Notas
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sidebar de Tópicos */}
        <div className="lg:col-span-1 space-y-8 h-fit">
          <div className="glass-card p-4 rounded-xl border border-white/5 shadow-2xl">
            <div className="space-y-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-accent/10 text-brand-accent rounded-xl flex items-center justify-center border border-brand-accent/20">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-white tracking-tight">Tópicos Quentes</h3>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 px-4 py-3 bg-white/5 rounded-xl flex items-center gap-2 border border-white/10 focus-within:border-brand-accent/50 transition-all">
                  <Search className="w-3 h-3 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Buscar tópico..." 
                    className="bg-transparent border-none outline-none text-xs font-medium w-full text-white placeholder:text-slate-600" 
                  />
                </div>
                <button className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-brand-accent border border-white/10 hover:bg-white/10 transition-all">
                  <Filter className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {MOCK_TOPICS.map((t, index) => (
                <motion.div 
                  key={t.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-[2rem] border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 blur-2xl -mr-12 -mt-12 group-hover:bg-brand-accent/10 transition-colors" />
                  
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <span className={cn(
                      "text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest border",
                      t.sentiment === 'Alto Risco' ? "bg-brand-rose/10 text-brand-rose border-brand-rose/20" :
                      t.sentiment === 'Crítico' ? "bg-brand-amber/10 text-brand-amber border-brand-amber/20" :
                      "bg-brand-accent/10 text-brand-accent border-brand-accent/20"
                    )}>
                      {t.sentiment}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.date}</span>
                  </div>
                  <p className="font-black text-sm text-white group-hover:text-brand-accent transition-all relative z-10">{t.title}</p>
                  <div className="flex items-center gap-2 mt-4 relative z-10">
                    <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ backgroundColor: t.status === 'Publicado' ? '#10b981' : t.status === 'Em Rascunho' ? '#f59e0b' : '#f43f5e' }} />
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border",
                      t.status === 'Publicado' ? 'bg-brand-emerald/20 text-brand-emerald border-brand-emerald/30' :
                      t.status === 'Em Rascunho' ? 'bg-brand-amber/20 text-brand-amber border-brand-amber/30' :
                      'bg-rose-500/20 text-rose-300 border-rose-400'
                    )}>
                      {t.status === 'Publicado' ? 'Aprovado' : t.status === 'Em Rascunho' ? 'Em Análise' : 'Conflito'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Gerador de Nota */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden min-h-[460px] flex flex-col"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/5 blur-[100px] -mr-48 -mt-48 pointer-events-none" />
            
            <AnimatePresence mode="wait">
              {!positioning && !isGenerating ? (
                <motion.div 
                  key="input"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-10 flex-1 flex flex-col relative z-10"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 bg-brand-accent/20 backdrop-blur-xl rounded-xl flex items-center justify-center border border-brand-accent/30 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                      <MessageSquare className="w-5 h-5 text-brand-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">Novo Posicionamento</h3>
                      <p className="text-slate-500 font-medium">Defina o tema para que a IA redija a nota ideal.</p>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1 flex flex-col">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Sobre qual polêmica ou tema deseja se posicionar?</label>
                    <textarea 
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Ex: Minha posição sobre a nova ciclovia no centro..."
                      className="w-full flex-1 p-5 rounded-xl font-medium leading-relaxed resize-none border-2 border-white/5 bg-white/5 focus:border-brand-accent/50 transition-all outline-none text-white text-base placeholder:text-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-5 group hover:bg-white/10 transition-all">
                      <div className="w-8 h-8 bg-brand-accent/10 rounded-2xl flex items-center justify-center border border-brand-accent/20 group-hover:scale-110 transition-transform">
                        <Users className="w-3 h-3 text-brand-accent" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Público-Alvo</p>
                        <p className="font-black text-white text-base">Eleitorado Geral</p>
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-5 group hover:bg-white/10 transition-all">
                      <div className="w-8 h-8 bg-brand-accent/10 rounded-2xl flex items-center justify-center border border-brand-accent/20 group-hover:scale-110 transition-transform">
                        <Globe className="w-3 h-3 text-brand-accent" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tom de Voz</p>
                        <p className="font-black text-white text-base">Equilibrado</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={generatePositioning}
                    disabled={!topic || isGenerating}
                    className="w-full py-4 bg-brand-accent text-white rounded-xl font-black text-xl hover:bg-brand-accent/90 transition-all shadow-[0_10px_30px_rgba(139,92,246,0.3)] flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                    Gerar Nota Oficial com IA
                  </button>
                </motion.div>
              ) : isGenerating ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-6 relative z-10"
                >
                  <div className="relative mb-12">
                    <div className="w-16 h-16 bg-brand-accent/20 rounded-xl flex items-center justify-center border border-brand-accent/30 animate-pulse">
                      <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
                    </div>
                    <div className="absolute -top-4 -right-4">
                      <Sparkles className="w-5 h-5 text-brand-accent animate-bounce" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tighter mb-4">IA Redigindo Nota...</h3>
                  <p className="text-slate-400 text-xl font-medium max-w-md">Buscando o equilíbrio perfeito entre firmeza e diplomacia para o seu mandato.</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10 flex-1 flex flex-col relative z-10"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 bg-brand-emerald/10 text-brand-emerald rounded-xl flex items-center justify-center border border-brand-emerald/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white tracking-tight">Nota Oficial Gerada</h3>
                          <p className="text-slate-500 font-medium">Revisada e otimizada pela IA estratégica.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button className="p-4 bg-white/5 text-slate-400 hover:text-brand-accent rounded-2xl transition-all border border-white/5 hover:bg-white/10">
                          <Copy className="w-3 h-3" />
                        </button>
                        <button className="p-4 bg-white/5 text-slate-400 hover:text-brand-accent rounded-2xl transition-all border border-white/5 hover:bg-white/10">
                          <Share2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs uppercase tracking-widest border border-white/10 hover:bg-white/20 transition">Editar Relatório</button>
                      <button className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs uppercase tracking-widest border border-white/10 hover:bg-white/20 transition">Anexar Documento</button>
                      <button className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs uppercase tracking-widest border border-white/10 hover:bg-white/20 transition">Mover para Pasta de Arquivo</button>
                      <button className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs uppercase tracking-widest border border-white/10 hover:bg-white/20 transition">Gerar Resumo IA</button>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-8 flex-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-brand-emerald/5 blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                    
                    <h4 className="text-base font-bold text-white relative z-10 tracking-tight">{positioning.title}</h4>
                    <p className="text-xl font-medium leading-relaxed text-slate-300 relative z-10">
                      {positioning.content}
                    </p>
                    <div className="flex flex-wrap gap-3 relative z-10">
                      {positioning.tags.map((tag: string, i: number) => (
                        <span key={i} className="px-5 py-2.5 bg-brand-accent/10 border border-brand-accent/20 rounded-full text-[10px] font-black text-brand-accent uppercase tracking-widest">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-brand-amber/5 rounded-xl border border-brand-amber/20 group hover:bg-brand-amber/10 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="w-3.5 h-3.5 text-brand-amber" />
                        <span className="text-[10px] font-black text-brand-amber uppercase tracking-widest">Risco de Repercussão</span>
                      </div>
                      <p className="text-base font-semibold text-white mb-2">{positioning.risk}</p>
                      <p className="text-sm font-bold text-slate-500">Monitorar comentários nas redes sociais e grupos de oposição.</p>
                    </div>
                    <div className="p-5 bg-brand-accent/5 rounded-xl border border-brand-accent/20 group hover:bg-brand-accent/10 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <FileText className="w-3.5 h-3.5 text-brand-accent" />
                        <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">Formato Sugerido</span>
                      </div>
                      <p className="text-base font-semibold text-white mb-2">Comunicado PDF</p>
                      <p className="text-sm font-bold text-slate-500">Ideal para disparo em massa via WhatsApp e Telegram.</p>
                    </div>
                  </div>

                  <div className="flex gap-6 pt-4">
                    <button onClick={() => {
                      setIsPublishing(true);
                      setTimeout(() => {
                        setIsPublishing(false);
                        setToastMessage({text: '✅ Nota publicada e disparada com sucesso!', type: 'success'});
                        setPositioning(null);
                      }, 2000);
                    }} disabled={isPublishing} className="flex-1 py-4 bg-brand-emerald text-white rounded-xl font-black text-xl hover:bg-brand-emerald/90 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-4 group disabled:opacity-70">
                      {isPublishing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Publicando...
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          Publicar Agora
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => setPositioning(null)}
                      className="px-12 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black text-xl hover:bg-white/10 transition-all"
                    >
                      Novo Tópico
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
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
