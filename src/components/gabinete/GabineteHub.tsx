import { useState } from 'react';
import { 
  Video, Instagram, Twitter, 
  Facebook, Calendar, Sparkles, 
  Loader2, Send, Copy, 
  Download, Share2, Plus,
  Layout, MessageSquare, Zap,
  Image as ImageIcon, Play, FileText,
  Search, Filter, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const MOCK_POSTS = [
  { id: '1', title: 'Visita à Obra da Vila Nova', platform: 'Instagram', date: '25 Mar, 10:00', status: 'Agendado' },
  { id: '2', title: 'Posicionamento sobre IPTU', platform: 'Twitter', date: '25 Mar, 14:00', status: 'Rascunho' },
  { id: '3', title: 'Live: Prestação de Contas', platform: 'Facebook', date: '26 Mar, 19:00', status: 'Agendado' },
];

export function GabineteHub({ isDarkMode }: { isDarkMode: boolean }) {
  const [activeTab, setActiveTab] = useState('generator');
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState<any>(null);

  const generateContent = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setContent({
        script: "Olá pessoal! Hoje estou aqui na Vila Nova para conferir de perto o andamento das obras de pavimentação que solicitamos. É gratificante ver o asfalto chegando onde antes só tinha lama. Seguimos trabalhando por você!",
        caption: "Trabalho que transforma! 🚀 Conferindo as obras na Vila Nova. Compromisso assumido, compromisso cumprido. #MandatoEmAção #VilaNova #Obras",
        hashtags: "#politica #vereador #trabalho #comunidade",
        suggestion: "Vídeo curto (Reels/TikTok) com trilha motivacional e cortes rápidos da obra."
      });
      setIsGenerating(false);
    }, 2500);
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-black tracking-tighter text-white"
          >
            Hub de <span className="text-brand-accent drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">Conteúdo</span>
          </motion.h1>
          <p className="text-slate-400 font-medium max-w-2xl">
            Criação estratégica de roteiros e posts com auxílio de IA. Transforme suas ações em narrativas de alto impacto para as redes sociais.
          </p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex gap-4"
        >
          <button className="flex items-center gap-3 px-8 py-4 bg-brand-accent text-white rounded-2xl font-bold hover:bg-brand-accent/90 transition-all shadow-[0_10px_30px_rgba(139,92,246,0.3)]">
            <Plus className="w-5 h-5" />
            Novo Conteúdo
          </button>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 p-2 bg-white/5 backdrop-blur-xl rounded-[2.5rem] w-fit border border-white/10">
        {[
          { id: 'generator', label: 'Gerador IA', icon: Sparkles },
          { id: 'calendar', label: 'Calendário', icon: Calendar },
          { id: 'history', label: 'Histórico', icon: Layout },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-3 px-8 py-4 rounded-[1.8rem] font-black text-sm transition-all duration-300 relative",
              activeTab === tab.id 
                ? "bg-brand-accent text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTabHub"
                className="absolute inset-0 bg-brand-accent rounded-[1.8rem] -z-10"
              />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Editor/Generator */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {!content && !isGenerating ? (
              <motion.div 
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card p-12 rounded-[4rem] border border-white/5 shadow-2xl space-y-10 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-16 h-16 bg-brand-accent/10 text-brand-accent rounded-2xl flex items-center justify-center border border-brand-accent/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                    <Video className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tight">O que vamos gravar hoje?</h3>
                    <p className="text-slate-500 font-medium">Descreva o evento ou a pauta do conteúdo</p>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Briefing do Conteúdo</label>
                  <textarea 
                    placeholder="Ex: Visita à obra da creche no bairro São José, mostrando os avanços..."
                    className="w-full h-48 p-10 rounded-[3rem] font-medium leading-relaxed resize-none border-2 border-white/5 bg-white/5 focus:border-brand-accent/50 transition-all outline-none text-white text-lg placeholder:text-slate-700 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  {[
                    { icon: Instagram, label: 'Reels', color: 'text-pink-500' },
                    { icon: Video, label: 'TikTok', color: 'text-brand-accent' },
                    { icon: FileText, label: 'Informativo', color: 'text-brand-emerald' },
                  ].map((platform, idx) => (
                    <button key={idx} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-4 hover:border-brand-accent/50 hover:bg-white/10 transition-all group">
                      <platform.icon className={cn("w-8 h-8 group-hover:scale-110 transition-transform", platform.color)} />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-white">{platform.label}</span>
                    </button>
                  ))}
                </div>

                <button 
                  onClick={generateContent}
                  className="w-full py-8 bg-brand-accent text-white rounded-[2.5rem] font-black text-xl hover:bg-brand-accent/90 transition-all shadow-[0_10px_30px_rgba(139,92,246,0.3)] flex items-center justify-center gap-4 group relative z-10"
                >
                  <Sparkles className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                  Gerar Roteiro e Legendas
                </button>
              </motion.div>
            ) : isGenerating ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card h-full min-h-[600px] rounded-[4rem] border border-brand-accent/30 flex flex-col items-center justify-center text-center p-16 shadow-2xl bg-gradient-to-br from-brand-accent/10 to-transparent"
              >
                <div className="relative mb-12">
                  <div className="w-32 h-32 bg-brand-accent/20 rounded-[3rem] flex items-center justify-center border border-brand-accent/30 animate-pulse shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                    <Loader2 className="w-16 h-16 text-brand-accent animate-spin" />
                  </div>
                </div>
                <h3 className="text-4xl font-black text-white tracking-tighter mb-4">IA Criativa em Ação</h3>
                <p className="text-slate-400 text-xl font-medium max-w-md">Estruturando roteiro persuasivo e legendas de alto engajamento para suas redes sociais...</p>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="glass-card p-12 rounded-[4rem] border border-white/5 shadow-2xl space-y-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/5 blur-[100px] -mr-48 -mt-48 pointer-events-none" />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-accent/10 text-brand-accent rounded-2xl flex items-center justify-center border border-brand-accent/20">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h3 className="text-3xl font-black text-white tracking-tight">Conteúdo Estratégico</h3>
                    </div>
                    <div className="flex gap-3">
                      <button className="p-4 bg-white/5 text-slate-400 hover:text-brand-accent rounded-2xl transition-all border border-white/5 hover:bg-white/10">
                        <Copy className="w-6 h-6" />
                      </button>
                      <button className="p-4 bg-white/5 text-slate-400 hover:text-brand-accent rounded-2xl transition-all border border-white/5 hover:bg-white/10">
                        <Share2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 space-y-6 group hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <Play className="w-5 h-5 text-brand-accent" />
                        <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">Roteiro de Vídeo Sugerido</span>
                      </div>
                      <p className="text-2xl font-medium leading-relaxed text-white italic">
                        "{content.script}"
                      </p>
                    </div>

                    <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 space-y-6 group hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-brand-accent" />
                        <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">Legenda Estratégica</span>
                      </div>
                      <p className="text-2xl font-medium leading-relaxed text-white">
                        {content.caption}
                      </p>
                      <p className="text-lg font-black text-brand-accent drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]">{content.hashtags}</p>
                    </div>

                    <div className="p-8 bg-brand-accent/10 rounded-[2.5rem] border border-brand-accent/20 flex items-start gap-5 group hover:bg-brand-accent/20 transition-all">
                      <Zap className="w-8 h-8 text-brand-accent shrink-0 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest mb-1">Dica de Produção</p>
                        <p className="text-lg font-bold text-white">{content.suggestion}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-6 relative z-10">
                    <button className="flex-1 py-8 bg-brand-accent text-white rounded-[2.5rem] font-black text-xl hover:bg-brand-accent/90 transition-all shadow-[0_10px_30px_rgba(139,92,246,0.3)] flex items-center justify-center gap-4">
                      <Calendar className="w-7 h-7" />
                      Agendar Postagem
                    </button>
                    <button 
                      onClick={() => setContent(null)}
                      className="px-12 py-8 bg-white/5 border-2 border-white/10 text-white rounded-[2.5rem] font-black text-xl hover:bg-white/10 transition-all"
                    >
                      Novo Roteiro
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar de Agendamentos */}
        <div className="lg:col-span-1 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-10 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col h-fit"
          >
            <div className="space-y-8 mb-10">
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black text-white tracking-tight">Próximos Posts</h3>
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                  <Calendar className="w-5 h-5 text-slate-400" />
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Buscar post..." 
                  className="w-full pl-16 pr-6 py-5 bg-white/5 rounded-2xl border border-white/5 text-white font-medium outline-none focus:border-brand-accent/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              {MOCK_POSTS.map((post) => (
                <motion.div 
                  key={post.id}
                  whileHover={{ x: 5 }}
                  className="p-8 rounded-[2.5rem] border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                        {post.platform === 'Instagram' ? <Instagram className="w-5 h-5 text-pink-500" /> :
                         post.platform === 'Twitter' ? <Twitter className="w-5 h-5 text-blue-400" /> :
                         <Facebook className="w-5 h-5 text-blue-600" />}
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{post.platform}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{post.date}</span>
                  </div>
                  <p className="font-black text-lg text-white group-hover:text-brand-accent transition-all leading-tight">{post.title}</p>
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full shadow-[0_0_8px]",
                        post.status === 'Agendado' ? "bg-brand-emerald shadow-brand-emerald/50" : "bg-brand-amber shadow-brand-amber/50"
                      )} />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{post.status}</span>
                    </div>
                    <button className="p-2 text-slate-500 hover:text-white transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <button className="w-full mt-10 py-6 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-3">
              Ver Calendário Completo
              <Share2 className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
