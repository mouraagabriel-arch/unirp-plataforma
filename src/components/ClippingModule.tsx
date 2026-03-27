import { useState } from 'react';
import { 
  Globe, Search, Filter, AlertTriangle, 
  TrendingUp, TrendingDown, Minus, 
  Sparkles, FileText, Share2, MessageSquare,
  ChevronRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  content: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  analysis?: string;
  crisisAlert?: boolean;
  officialNote?: string;
}

const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: "Atraso nas obras da Praça Central gera reclamações de moradores",
    source: "Portal da Cidade",
    time: "Há 1 hora",
    content: "Moradores do bairro Jardim das Flores expressaram insatisfação com a paralisação das obras na Praça Central. Segundo relatos, o local está abandonado há duas semanas, gerando acúmulo de entulho e insegurança."
  },
  {
    id: '2',
    title: "Prefeitura anuncia novo programa de incentivo à tecnologia",
    source: "Diário Oficial",
    time: "Há 3 horas",
    content: "O novo programa 'TechRP' visa oferecer isenção fiscal para startups que se instalarem no polo tecnológico da cidade. A expectativa é gerar mais de 500 empregos diretos no primeiro ano."
  },
  {
    id: '3',
    title: "Vereador questiona gastos com publicidade institucional",
    source: "Redes Sociais",
    time: "Há 5 horas",
    content: "Em postagem que viralizou, o vereador da oposição critica o montante investido em campanhas de rádio e TV, alegando que os recursos deveriam ser destinados à saúde básica."
  }
];

export function ClippingModule({ isDarkMode }: { isDarkMode: boolean }) {
  const [news, setNews] = useState<NewsItem[]>(MOCK_NEWS);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [generatingNoteId, setGeneratingNoteId] = useState<string | null>(null);

  const analyzeSentiment = async (item: NewsItem) => {
    setAnalyzingId(item.id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analise o sentimento desta notícia sobre a gestão pública: "${item.title}. ${item.content}". 
        Responda em JSON com os campos: 
        "sentiment" (positive, negative ou neutral), 
        "analysis" (um resumo curto do impacto político),
        "crisisAlert" (boolean, true se for uma ameaça imediata à reputação).`,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      
      setNews(prev => prev.map(n => n.id === item.id ? { 
        ...n, 
        sentiment: result.sentiment,
        analysis: result.analysis,
        crisisAlert: result.crisisAlert
      } : n));
    } catch (error) {
      console.error("Erro na análise de IA:", error);
    } finally {
      setAnalyzingId(null);
    }
  };

  const generateOfficialNote = async (item: NewsItem) => {
    setGeneratingNoteId(item.id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Como assessor de comunicação de um órgão público, escreva uma "Nota Oficial" curta e profissional em resposta a esta notícia negativa: "${item.title}". 
        A nota deve ser conciliadora, técnica e informativa.`,
      });

      setNews(prev => prev.map(n => n.id === item.id ? { 
        ...n, 
        officialNote: response.text 
      } : n));
    } catch (error) {
      console.error("Erro ao gerar nota:", error);
    } finally {
      setGeneratingNoteId(null);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">Clipping & <span className="text-rose-600">Gestão de Crise</span></h1>
          <p className="text-slate-500 font-medium mt-2">Monitoramento inteligente de menções e análise de sentimento via IA.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-5 h-5" />
            Filtrar Fontes
          </button>
          <button className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg">
            <Search className="w-5 h-5" />
            Nova Busca
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* News Feed */}
        <div className="lg:col-span-2 space-y-6">
          {news.map((item) => (
            <motion.div 
              key={item.id}
              layout
              className={cn(
                "p-8 rounded-[2.5rem] shadow-xl border transition-all overflow-hidden",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50",
                item.crisisAlert && "border-rose-500/50 ring-2 ring-rose-500/10"
              )}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-lg leading-tight">{item.title}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {item.source} • {item.time}
                    </p>
                  </div>
                </div>
                
                {item.sentiment ? (
                  <div className={cn(
                    "px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-xs uppercase tracking-wider",
                    item.sentiment === 'positive' ? "bg-emerald-100 text-emerald-700" :
                    item.sentiment === 'negative' ? "bg-rose-100 text-rose-700" :
                    "bg-slate-100 text-slate-600"
                  )}>
                    {item.sentiment === 'positive' ? <TrendingUp className="w-4 h-4" /> :
                     item.sentiment === 'negative' ? <TrendingDown className="w-4 h-4" /> :
                     <Minus className="w-4 h-4" />}
                    {item.sentiment}
                  </div>
                ) : (
                  <button 
                    onClick={() => analyzeSentiment(item)}
                    disabled={analyzingId === item.id}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
                  >
                    {analyzingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Analisar IA
                  </button>
                )}
              </div>

              <p className="text-slate-500 font-medium leading-relaxed mb-6">
                {item.content}
              </p>

              <AnimatePresence>
                {item.analysis && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mb-6 p-6 bg-slate-50 rounded-3xl border border-slate-100"
                  >
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">
                      <Sparkles className="w-4 h-4" />
                      Análise de Impacto
                    </div>
                    <p className="text-slate-700 font-medium">{item.analysis}</p>
                  </motion.div>
                )}

                {item.crisisAlert && (
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="mb-6 p-6 bg-rose-50 rounded-3xl border border-rose-100 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/30">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-rose-900">Alerta de Crise Identificado</p>
                      <p className="text-rose-700 text-sm font-medium">Esta menção tem alto potencial de viralização negativa.</p>
                    </div>
                    {!item.officialNote && (
                      <button 
                        onClick={() => generateOfficialNote(item)}
                        disabled={generatingNoteId === item.id}
                        className="ml-auto px-6 py-3 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all flex items-center gap-2 shadow-md"
                      >
                        {generatingNoteId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        Gerar Nota Oficial
                      </button>
                    )}
                  </motion.div>
                )}

                {item.officialNote && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="p-8 bg-slate-900 text-white rounded-3xl space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest">
                        <FileText className="w-4 h-4" />
                        Sugestão de Nota Oficial
                      </div>
                      <button className="p-2 hover:bg-white/10 rounded-xl transition-all">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-slate-300 font-medium leading-relaxed italic">
                      "{item.officialNote}"
                    </p>
                    <div className="flex gap-4 pt-4">
                      <button className="flex-1 py-4 bg-blue-600 rounded-2xl font-bold hover:bg-blue-700 transition-all">
                        Aprovar e Publicar
                      </button>
                      <button className="px-6 py-4 bg-white/10 rounded-2xl font-bold hover:bg-white/20 transition-all">
                        Editar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-8">
          <div className={cn(
            "p-10 rounded-[2.5rem] shadow-xl",
            isDarkMode ? "bg-slate-900" : "bg-white"
          )}>
            <h3 className="text-2xl font-black mb-6">Resumo de Sentimento</h3>
            <div className="space-y-6">
              <SentimentBar label="Positivo" value={65} color="emerald" />
              <SentimentBar label="Neutro" value={20} color="slate" />
              <SentimentBar label="Negativo" value={15} color="rose" />
            </div>
          </div>

          <div className={cn(
            "p-10 rounded-[2.5rem] shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white"
          )}>
            <Sparkles className="w-10 h-10 mb-6 opacity-50" />
            <h3 className="text-2xl font-black mb-2">Insight da IA</h3>
            <p className="text-blue-100 font-medium leading-relaxed mb-6">
              O sentimento geral subiu 12% após o anúncio do programa TechRP. No entanto, a paralisação das obras na Praça Central é o principal detrator hoje.
            </p>
            <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-all">
              Ver Relatório Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SentimentBar({ label, value, color }: { label: string, value: number, color: 'emerald' | 'slate' | 'rose' }) {
  const colors = {
    emerald: "bg-emerald-500",
    slate: "bg-slate-400",
    rose: "bg-rose-500"
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
        <span className="text-slate-400">{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={cn("h-full", colors[color])}
        />
      </div>
    </div>
  );
}
