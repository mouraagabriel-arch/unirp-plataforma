import { useState } from 'react';
import { 
  Newspaper, Search, Filter, Plus, 
  Sparkles, Loader2, MessageSquare, 
  TrendingUp, TrendingDown, AlertCircle,
  CheckCircle2, X, Share2, Globe,
  MoreVertical, Edit2, Trash2, Zap,
  BarChart3, PieChart, Activity,
  ChevronRight, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { GoogleGenAI } from "@google/genai";

interface NewsItem {
  id: string;
  titulo: string;
  veiculo: string;
  data: string;
  sentimento?: 'positivo' | 'neutro' | 'negativo';
  resumo?: string;
  nota_gerada?: string;
  url: string;
  origem: 'imprensa' | 'redes_sociais';
}

const MOCK_NEWS: NewsItem[] = [
  {
    id: 'CLP-001',
    titulo: 'Prefeitura anuncia novo plano de mobilidade urbana para o centro.',
    veiculo: 'Folha de S.Paulo',
    data: '2024-03-25 09:30',
    url: 'https://folha.uol.com.br',
    origem: 'imprensa'
  },
  {
    id: 'CLP-002',
    titulo: 'Moradores reclamam de falta de iluminação no bairro Jardim das Flores.',
    veiculo: 'Twitter (X)',
    data: '2024-03-25 10:15',
    url: 'https://twitter.com',
    origem: 'redes_sociais'
  },
  {
    id: 'CLP-003',
    titulo: 'Hospital Municipal bate recorde de atendimentos no primeiro trimestre.',
    veiculo: 'Portal G1',
    data: '2024-03-25 11:00',
    url: 'https://g1.globo.com',
    origem: 'imprensa'
  },
  {
    id: 'CLP-004',
    titulo: 'Críticas à nova taxa de lixo ganham força em grupos locais.',
    veiculo: 'Facebook',
    data: '2024-03-25 11:45',
    url: 'https://facebook.com',
    origem: 'redes_sociais'
  }
];

export function EnterpriseClipping({ isDarkMode }: { isDarkMode: boolean }) {
  const [news, setNews] = useState<NewsItem[]>(MOCK_NEWS);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const analyzeSentiment = async (item: NewsItem) => {
    setAnalyzingId(item.id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analise o sentimento desta notícia institucional: "${item.titulo}". 
        Responda apenas com uma palavra: POSITIVO, NEUTRO ou NEGATIVO. 
        E forneça um breve resumo de 1 parágrafo sobre o impacto para a instituição.`,
      });
      
      const text = response.text || '';
      const sentiment = text.toUpperCase().includes('POSITIVO') ? 'positivo' : 
                        text.toUpperCase().includes('NEGATIVO') ? 'negativo' : 'neutro';
      
      setNews(prev => prev.map(n => n.id === item.id ? { ...n, sentimento: sentiment as any, resumo: text } : n));
    } catch (error) {
      console.error("Erro na análise de sentimento:", error);
    } finally {
      setAnalyzingId(null);
    }
  };

  const generateCrisisResponse = async (item: NewsItem) => {
    setGeneratingId(item.id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Como porta-voz oficial da instituição, escreva uma "Nota Oficial de Resposta" para a seguinte notícia negativa: "${item.titulo}". 
        A nota deve ser transparente, técnica e propositiva, focando na solução do problema.`,
      });
      
      setNews(prev => prev.map(n => n.id === item.id ? { ...n, nota_gerada: response.text } : n));
    } catch (error) {
      console.error("Erro ao gerar resposta:", error);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">
            Clipping & <span className="text-blue-600">Crise</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Monitoramento de menções e gestão de reputação.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 px-6 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20">
            <AlertCircle className="w-5 h-5" />
            Simular Crise
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        <div className={cn(
          "flex-1 flex items-center gap-4 px-8 py-5 rounded-[2rem] border transition-all shadow-sm",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
        )}>
          <Search className="w-6 h-6 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar notícias ou menções..." 
            className="bg-transparent border-none outline-none text-lg font-medium w-full"
          />
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 px-8 py-5 bg-white border border-slate-100 rounded-[2rem] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-5 h-5" />
            Filtros
          </button>
        </div>
      </div>

      {/* News Feed */}
      <div className="grid grid-cols-1 gap-8">
        {news.map((item, index) => (
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
            <div className="flex flex-col lg:flex-row lg:items-start gap-8">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0",
                item.origem === 'imprensa' ? "bg-blue-50 text-blue-600" : "bg-indigo-50 text-indigo-600"
              )}>
                {item.origem === 'imprensa' ? <Newspaper className="w-8 h-8" /> : <Globe className="w-8 h-8" />}
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {item.veiculo} • {item.data}
                  </span>
                  {item.sentimento && (
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                      item.sentimento === 'positivo' ? "bg-emerald-100 text-emerald-600" : 
                      item.sentimento === 'negativo' ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                    )}>
                      {item.sentimento}
                    </span>
                  )}
                </div>
                
                <h3 className="text-2xl font-black leading-tight">{item.titulo}</h3>
                
                {item.resumo && (
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                      {item.resumo}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  {!item.sentimento && (
                    <button 
                      onClick={() => analyzeSentiment(item)}
                      disabled={analyzingId === item.id}
                      className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                      {analyzingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Análise de Sentimento via IA
                    </button>
                  )}
                  
                  {item.sentimento === 'negativo' && !item.nota_gerada && (
                    <button 
                      onClick={() => generateCrisisResponse(item)}
                      disabled={generatingId === item.id}
                      className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20"
                    >
                      {generatingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      Gerar Nota Oficial
                    </button>
                  )}

                  <button className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Ver Original
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 lg:pl-8 lg:border-l border-slate-100">
                <button className="p-4 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-4 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {item.nota_gerada && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-8 p-10 bg-slate-900 text-white rounded-[2.5rem] space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-widest">
                      <Zap className="w-4 h-4" />
                      Resposta de Crise (IA)
                    </div>
                    <div className="flex gap-2">
                      <button className="p-3 hover:bg-white/10 rounded-xl transition-all">
                        <Share2 className="w-4 h-4 text-white/50" />
                      </button>
                      <button className="p-3 hover:bg-white/10 rounded-xl transition-all">
                        <Edit2 className="w-4 h-4 text-white/50" />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-300 font-medium leading-relaxed italic text-lg">
                    "{item.nota_gerada}"
                  </p>
                  <div className="flex gap-4 pt-4">
                    <button className="flex-1 py-5 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20">
                      Publicar Nota Oficial
                    </button>
                    <button className="px-8 py-5 bg-white/10 border border-white/10 rounded-2xl font-bold hover:bg-white/20 transition-all">
                      Salvar Rascunho
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
