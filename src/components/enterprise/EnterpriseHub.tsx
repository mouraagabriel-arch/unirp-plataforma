import { useState } from 'react';
import { 
  Newspaper, Sparkles, Loader2, Save, 
  X, FileText, Send, Calendar, 
  Facebook, Instagram, Twitter, Linkedin,
  Plus, Edit2, Trash2, Share2, 
  MessageSquare, Globe, Image as ImageIcon,
  CheckCircle2, Clock, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { GoogleGenAI } from "@google/genai";

export function EnterpriseHub({ isDarkMode }: { isDarkMode: boolean }) {
  const [activeTab, setActiveTab] = useState<'editor' | 'social' | 'history'>('editor');
  const [isGenerating, setIsGenerating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const generateAIContent = async () => {
    if (!title) return alert('Por favor, insira um título ou tema.');
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Como assessor de comunicação institucional, escreva um release profissional baseado no título: "${title}". 
        O conteúdo deve ser formal, informativo e estruturado para a imprensa.`,
      });
      setContent(response.text || '');
    } catch (error) {
      console.error("Erro ao gerar conteúdo:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">
            Hub de <span className="text-blue-600">Conteúdo</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Criação, gestão e distribuição multicanal.</p>
        </div>
        
        <div className="flex gap-2 p-2 bg-slate-100 rounded-3xl w-fit">
          {[
            { id: 'editor', label: 'Editor de Release', icon: Newspaper },
            { id: 'social', label: 'Redes Sociais', icon: Share2 },
            { id: 'history', label: 'Histórico', icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all",
                activeTab === tab.id 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'editor' && (
          <motion.div 
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Editor Area */}
            <div className={cn(
              "lg:col-span-2 p-10 rounded-[3rem] shadow-xl border space-y-8",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
            )}>
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Título do Release / Pauta</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Inauguração da Nova Unidade de Saúde..."
                  className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-black text-xl border-none outline-none focus:ring-2 ring-blue-500/20 transition-all"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Corpo do Texto</label>
                  <button 
                    onClick={generateAIContent}
                    disabled={isGenerating}
                    className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Gerar com IA
                  </button>
                </div>
                <div className="relative">
                  <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Escreva seu release aqui ou use a IA para gerar um rascunho..."
                    className="w-full h-[400px] px-8 py-8 bg-slate-50 rounded-[2.5rem] font-medium leading-relaxed border-none outline-none focus:ring-2 ring-blue-500/20 transition-all resize-none"
                  />
                  <div className="absolute bottom-6 right-8 flex gap-2">
                    <button className="p-3 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-all">
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                    </button>
                    <button className="p-3 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-all">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3">
                  <Send className="w-5 h-5" />
                  Publicar Release
                </button>
                <button className="px-8 py-5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                  Salvar Rascunho
                </button>
                <button className="px-8 py-5 bg-white border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                  Exportar PDF
                </button>
              </div>
            </div>

            {/* Sidebar Tools */}
            <div className="space-y-8">
              <div className={cn(
                "p-10 rounded-[2.5rem] shadow-xl border",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
              )}>
                <h3 className="text-2xl font-black mb-6">Checklist de Qualidade</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Título Impactante', done: title.length > 10 },
                    { label: 'Lead (Quem, Onde, Quando)', done: content.length > 100 },
                    { label: 'Citação de Autoridade', done: content.includes('"') },
                    { label: 'Informações de Contato', done: content.includes('assessoria') },
                    { label: 'Mídia Anexada', done: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center",
                        item.done ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-300"
                      )}>
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      <span className={cn("text-sm font-bold", item.done ? "text-slate-700" : "text-slate-400")}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-10 rounded-[2.5rem] shadow-xl bg-blue-600 text-white">
                <Sparkles className="w-12 h-12 mb-6 opacity-50" />
                <h3 className="text-2xl font-black mb-2">Sugestão de IA</h3>
                <p className="text-blue-100 font-medium leading-relaxed mb-6">
                  "O tom deste release está muito técnico. Que tal adicionar uma aspas do Secretário para humanizar a notícia?"
                </p>
                <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-all">
                  Aplicar Sugestão
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'social' && (
          <motion.div 
            key="social"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Social Media Connection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Facebook', icon: Facebook, color: 'blue', status: 'connected', user: '@prefeituradeexemplo' },
                { name: 'Instagram', icon: Instagram, color: 'rose', status: 'connected', user: '@prefeituradeexemplo' },
                { name: 'Twitter (X)', icon: Twitter, color: 'slate', status: 'disconnected', user: '-' },
                { name: 'LinkedIn', icon: Linkedin, color: 'indigo', status: 'connected', user: 'Prefeitura de Exemplo' },
              ].map((social, i) => (
                <div key={i} className={cn(
                  "p-8 rounded-[2.5rem] shadow-xl border transition-all hover:shadow-2xl",
                  isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
                )}>
                  <div className="flex items-center justify-between mb-6">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", `bg-${social.color}-50 text-${social.color}-600`)}>
                      <social.icon className="w-7 h-7" />
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                      social.status === 'connected' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                    )}>
                      {social.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-black mb-1">{social.name}</h3>
                  <p className="text-sm font-bold text-slate-400 mb-8">{social.user}</p>
                  <button className={cn(
                    "w-full py-4 rounded-2xl font-bold transition-all",
                    social.status === 'connected' ? "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600" : "bg-blue-600 text-white hover:bg-blue-700"
                  )}>
                    {social.status === 'connected' ? 'Desconectar' : 'Conectar'}
                  </button>
                </div>
              ))}
            </div>

            {/* Social Post Editor */}
            <div className={cn(
              "p-10 rounded-[3rem] shadow-xl border",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
            )}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <h3 className="text-2xl font-black">Criar Postagem Unificada</h3>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Legenda do Post</label>
                    <textarea 
                      placeholder="O que está acontecendo na instituição hoje?"
                      className="w-full h-48 px-8 py-8 bg-slate-50 rounded-[2.5rem] font-medium border-none outline-none focus:ring-2 ring-blue-500/20 transition-all resize-none"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3">
                      <Send className="w-5 h-5" />
                      Postar Agora
                    </button>
                    <button className="px-8 py-5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center gap-3">
                      <Calendar className="w-5 h-5" />
                      Agendar
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  <h3 className="text-2xl font-black">Preview Social</h3>
                  <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-blue-600 rounded-full" />
                      <div>
                        <p className="font-black">Prefeitura de Exemplo</p>
                        <p className="text-xs font-bold text-slate-400">Patrocinado • Agora</p>
                      </div>
                    </div>
                    <div className="aspect-video bg-slate-200 rounded-3xl mb-6 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-slate-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-slate-200 rounded" />
                      <div className="h-4 w-3/4 bg-slate-200 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div 
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 gap-4"
          >
            {[
              { id: '1', title: 'Release: Novo Parque Municipal', date: '2024-03-24', status: 'publicado', type: 'Release' },
              { id: '2', title: 'Post: Campanha de Vacinação', date: '2024-03-23', status: 'agendado', type: 'Social' },
              { id: '3', title: 'Artigo: Balanço da Gestão Q1', date: '2024-03-22', status: 'rascunho', type: 'Artigo' },
            ].map((item) => (
              <div key={item.id} className={cn(
                "p-8 rounded-[2.5rem] border flex items-center justify-between transition-all hover:shadow-lg",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
              )}>
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                        item.status === 'publicado' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                      )}>
                        {item.status}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.type}</span>
                    </div>
                    <p className="text-xl font-black">{item.title}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="p-4 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button className="p-4 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button className="p-4 bg-slate-50 text-slate-400 hover:bg-slate-100 rounded-2xl transition-all">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
