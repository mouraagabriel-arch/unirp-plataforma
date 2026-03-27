import { useState } from 'react';
import { 
  MessageCircle, Search, Filter, Plus, 
  ChevronRight, FileText, TrendingUp,
  AlertTriangle, CheckCircle2, Clock,
  BarChart3, PieChart, Activity, Sparkles,
  Loader2, Share2, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";

interface Posicionamento {
  id: string;
  tema: string;
  status: 'rascunho' | 'aprovado' | 'publicado';
  data: string;
  autor: string;
  resumo: string;
  conteudo?: string;
}

const POSICIONAMENTOS_MOCK: Posicionamento[] = [
  {
    id: 'POS-001',
    tema: 'Reforma Administrativa',
    status: 'aprovado',
    data: '2024-03-24',
    autor: 'Estrategista Digital',
    resumo: 'Posicionamento oficial sobre a modernização dos cargos e salários.'
  },
  {
    id: 'POS-002',
    tema: 'Crise Hídrica',
    status: 'rascunho',
    data: '2024-03-23',
    autor: 'Assessoria de Imprensa',
    resumo: 'Medidas de contingenciamento e conscientização da população.'
  }
];

export function PosicionamentoModule({ isDarkMode }: { isDarkMode: boolean }) {
  const [posicionamentos, setPosicionamentos] = useState<Posicionamento[]>(POSICIONAMENTOS_MOCK);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const generateAIPosition = async (item: Posicionamento) => {
    setGeneratingId(item.id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Como porta-voz oficial, escreva um "Posicionamento Institucional" curto, transparente e propositivo sobre o tema: "${item.tema}". 
        O resumo base é: "${item.resumo}". 
        O tom deve ser de liderança e compromisso com o cidadão.`,
      });

      setPosicionamentos(prev => prev.map(p => p.id === item.id ? { ...p, conteudo: response.text } : p));
    } catch (error) {
      console.error("Erro ao gerar posicionamento:", error);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">
            Central de <span className="text-blue-600">Posicionamento</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Gestão de narrativas e comunicados oficiais da gestão.</p>
        </div>
        <button className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
          <Plus className="w-5 h-5" />
          Novo Posicionamento
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {posicionamentos.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "p-10 rounded-[3rem] shadow-xl border transition-all overflow-hidden",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
            )}
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                <MessageCircle className="w-8 h-8" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    item.status === 'aprovado' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                  )}>
                    {item.status}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {item.id} • {item.data}
                  </span>
                </div>
                <h3 className="text-2xl font-black">{item.tema}</h3>
                <p className="text-slate-500 font-medium">{item.resumo}</p>
              </div>

              <div className="flex items-center gap-4 lg:pl-8 lg:border-l border-slate-100">
                {!item.conteudo && (
                  <button 
                    onClick={() => generateAIPosition(item)}
                    disabled={generatingId === item.id}
                    className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
                  >
                    {generatingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Gerar com IA
                  </button>
                )}
                <button className="p-4 hover:bg-slate-100 rounded-2xl transition-all">
                  <ChevronRight className="w-6 h-6 text-slate-300" />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {item.conteudo && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-8 p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
                      <Sparkles className="w-4 h-4" />
                      Sugestão de Posicionamento (IA)
                    </div>
                    <div className="flex gap-2">
                      <button className="p-3 hover:bg-white rounded-xl transition-all">
                        <Share2 className="w-4 h-4 text-slate-400" />
                      </button>
                      <button className="p-3 hover:bg-white rounded-xl transition-all">
                        <FileText className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed italic text-lg">
                    "{item.conteudo}"
                  </p>
                  <div className="flex gap-4 pt-4">
                    <button className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                      Aprovar e Publicar
                    </button>
                    <button className="px-8 py-5 bg-white border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                      Editar Rascunho
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
