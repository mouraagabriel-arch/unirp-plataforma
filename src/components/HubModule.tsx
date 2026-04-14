import { useState } from 'react';
import { 
  Newspaper, Search, Plus, Edit2, 
  Trash2, Save, X, FileText, 
  Sparkles, Loader2, Upload, Download,
  Share2, MessageSquare, Globe, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";

interface ContentItem {
  id: string;
  titulo: string;
  tipo: 'release' | 'post' | 'artigo';
  data: string;
  status: 'rascunho' | 'aprovado' | 'publicado';
  conteudo: string;
}

const MOCK_CONTENT: ContentItem[] = [
  {
    id: 'HUB-001',
    titulo: 'Inauguração da Nova Unidade de Saúde',
    tipo: 'release',
    data: '2024-03-24',
    status: 'aprovado',
    conteudo: 'A prefeitura inaugura amanhã a nova UBS do bairro Jardim das Flores.'
  },
  {
    id: 'HUB-002',
    titulo: 'Post: Dicas de Prevenção contra Dengue',
    tipo: 'post',
    data: '2024-03-23',
    status: 'publicado',
    conteudo: 'Confira 5 dicas essenciais para eliminar focos do mosquito.'
  }
];

export function HubModule({ isDarkMode }: { isDarkMode: boolean }) {
  const [items, setItems] = useState<ContentItem[]>(MOCK_CONTENT);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const generateAIContent = async (item: ContentItem) => {
    setGeneratingId(item.id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Como assessor de comunicação, escreva um ${item.tipo} profissional baseado no título: "${item.titulo}". 
        O conteúdo deve ser informativo, engajador e seguir as normas da gestão pública.`,
      });

      setItems(prev => prev.map(i => i.id === item.id ? { ...i, conteudo: response.text || i.conteudo } : i));
    } catch (error) {
      console.error("Erro ao gerar conteúdo:", error);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter">
            Hub de <span className="text-brand-accent">Conteúdo</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Criação, gestão e distribuição de conteúdo institucional.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 px-6 py-4 bg-brand-accent text-white rounded-2xl font-bold hover:bg-brand-accent/90 transition-all shadow-lg shadow-blue-500/20">
            <Plus className="w-5 h-5" />
            Novo Conteúdo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {items.map((item) => (
          <motion.div 
            key={item.id}
            layout
            className={cn(
              "p-8 rounded-[2.5rem] shadow-xl border transition-all",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
            )}
          >
            <div className="flex flex-col lg:flex-row lg:items-start gap-8">
              <div className="w-16 h-16 bg-blue-50 text-brand-accent rounded-2xl flex items-center justify-center shrink-0">
                <Newspaper className="w-8 h-8" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    item.status === 'publicado' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                  )}>
                    {item.status}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {item.id} • {item.tipo}
                  </span>
                </div>
                
                <h3 className="text-2xl font-black">{item.titulo}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{item.conteudo}</p>
                
                <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100">
                  <button className="flex items-center gap-2 text-slate-400 hover:text-brand-accent font-bold text-xs uppercase tracking-widest transition-all">
                    <ImageIcon className="w-4 h-4" />
                    Adicionar Mídia
                  </button>
                  <button className="flex items-center gap-2 text-slate-400 hover:text-brand-accent font-bold text-xs uppercase tracking-widest transition-all">
                    <Share2 className="w-4 h-4" />
                    Compartilhar
                  </button>
                  <button 
                    onClick={() => generateAIContent(item)}
                    disabled={generatingId === item.id}
                    className="flex items-center gap-2 text-brand-accent font-bold text-xs uppercase tracking-widest hover:underline"
                  >
                    {generatingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Refinar com IA
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 lg:pl-8 lg:border-l border-slate-100">
                <button className="p-4 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-brand-accent rounded-2xl transition-all">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button className="p-4 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all">
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
