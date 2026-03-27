import { useState } from 'react';
import { 
  Swords, Search, Shield, Target, 
  Zap, AlertCircle, MessageSquare, 
  ChevronRight, Sparkles, FileText,
  TrendingUp, BarChart3, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";

interface Argumento {
  id: string;
  tema: string;
  ataque: string;
  defesa: string;
  dados_suporte: string[];
  nivel_risco: 'baixo' | 'medio' | 'alto';
  ia_rebuttal?: string;
}

const ARSENAL_MOCK: Argumento[] = [
  {
    id: 'ARS-001',
    tema: 'Gastos com Publicidade',
    ataque: 'A gestão gasta milhões em propaganda enquanto falta remédio nos postos.',
    defesa: 'O investimento em publicidade institucional é 15% menor que na gestão anterior e foca em campanhas de vacinação e utilidade pública.',
    dados_suporte: ['Relatório de Transparência 2023', 'Queda de 20% em casos de Dengue pós-campanha'],
    nivel_risco: 'alto'
  },
  {
    id: 'ARS-002',
    tema: 'Obras Atrasadas',
    ataque: 'A cidade é um canteiro de obras paradas que só servem para atrapalhar o trânsito.',
    defesa: '85% das obras estão no cronograma. Os atrasos pontuais devem-se ao excesso de chuvas no último trimestre.',
    dados_suporte: ['Cronograma de Obras Municipal', 'Relatório Meteorológico INMET'],
    nivel_risco: 'medio'
  }
];

export function ArsenalModule({ isDarkMode }: { isDarkMode: boolean }) {
  const [arsenal, setArsenal] = useState<Argumento[]>(ARSENAL_MOCK);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const generateAIRebuttal = async (item: Argumento) => {
    setGeneratingId(item.id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Como estrategista político, crie um "Contra-Argumento de Impacto" para o seguinte ataque: "${item.ataque}". 
        Use tom firme, mas baseado em dados. A defesa base é: "${item.defesa}". 
        O objetivo é desarmar a narrativa da oposição de forma elegante e técnica.`,
      });

      setArsenal(prev => prev.map(a => a.id === item.id ? { ...a, ia_rebuttal: response.text } : a));
    } catch (error) {
      console.error("Erro ao gerar contra-argumento:", error);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">
            Arsenal de <span className="text-blue-600">Embate</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Inteligência defensiva e contra-narrativas estratégicas.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg">
            <Zap className="w-5 h-5 text-amber-400" />
            Simular Crise
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {arsenal.map((item) => (
            <motion.div 
              key={item.id}
              layout
              className={cn(
                "p-10 rounded-[3rem] shadow-xl border transition-all",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
              )}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    item.nivel_risco === 'alto' ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                  )}>
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">{item.tema}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Risco: {item.nivel_risco}</p>
                  </div>
                </div>
                <button className="p-3 hover:bg-slate-100 rounded-xl transition-all">
                  <Target className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100">
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mb-3">Narrativa de Ataque</p>
                  <p className="text-rose-900 font-bold leading-relaxed italic">"{item.ataque}"</p>
                </div>
                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">Defesa Estratégica</p>
                  <p className="text-emerald-900 font-bold leading-relaxed">"{item.defesa}"</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Dados de Suporte (Check-Mate)</p>
                  {!item.ia_rebuttal && (
                    <button 
                      onClick={() => generateAIRebuttal(item)}
                      disabled={generatingId === item.id}
                      className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline"
                    >
                      {generatingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Refinar com IA
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {item.dados_suporte.map((d, i) => (
                    <span key={i} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {item.ia_rebuttal && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-8 p-8 bg-slate-900 text-white rounded-[2rem] space-y-4"
                  >
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest">
                      <Sparkles className="w-4 h-4" />
                      Contra-Argumento de Impacto (IA)
                    </div>
                    <p className="text-slate-300 font-medium leading-relaxed italic">
                      "{item.ia_rebuttal}"
                    </p>
                    <button className="w-full py-4 bg-blue-600 rounded-2xl font-bold hover:bg-blue-700 transition-all">
                      Copiar para Discurso
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="space-y-8">
          <div className={cn(
            "p-10 rounded-[2.5rem] shadow-xl",
            isDarkMode ? "bg-slate-900" : "bg-white"
          )}>
            <h3 className="text-2xl font-black mb-6">Monitor de Ataques</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">Volume de Críticas</span>
                <span className="text-sm font-black text-rose-500">+12%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-rose-500" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Principais temas: Saúde, Obras e Transparência.</p>
            </div>
          </div>

          <div className="p-10 rounded-[2.5rem] shadow-xl bg-blue-600 text-white">
            <Shield className="w-12 h-12 mb-6 opacity-50" />
            <h3 className="text-2xl font-black mb-2">Escudo Digital</h3>
            <p className="text-blue-100 font-medium leading-relaxed mb-6">
              Seu arsenal está 85% atualizado. Recomendamos revisar o tema "Educação" para o próximo debate.
            </p>
            <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-all">
              Atualizar Arsenal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
