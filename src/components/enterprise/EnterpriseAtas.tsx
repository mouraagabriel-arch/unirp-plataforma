import { useState, useEffect } from 'react';
import { 
  Mic, Upload, Download, FileText, 
  Sparkles, Loader2, Play, Pause, 
  Trash2, Save, X, CheckCircle2, 
  Clock, Calendar, User, Search,
  Filter, MoreVertical, Edit2, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { GoogleGenAI } from "@google/genai";

export function EnterpriseAtas({ isDarkMode }: { isDarkMode: boolean }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [summary, setSummary] = useState('');
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          simulateTranscription();
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const simulateTranscription = () => {
    setIsTranscribing(true);
    setTranscriptionProgress(0);
    const interval = setInterval(() => {
      setTranscriptionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTranscribing(false);
          generateSummary();
          return 100;
        }
        return prev + 2;
      });
    }, 150);
  };

  const generateSummary = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Gere um resumo executivo estruturado (Ata de Reunião) para uma reunião institucional fictícia sobre "Planejamento de Obras 2024". 
        Inclua: Participantes, Pautas Discutidas, Decisões Tomadas e Próximos Passos.`,
      });
      setSummary(response.text || '');
    } catch (error) {
      console.error("Erro ao gerar resumo:", error);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">
            Inteligência de <span className="text-blue-600">Atas</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Transcrição e resumos executivos automáticos via IA.</p>
        </div>
        
        <div className="flex gap-2 p-2 bg-slate-100 rounded-3xl w-fit">
          {[
            { id: 'new', label: 'Nova Ata', icon: Mic },
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
        {activeTab === 'new' && (
          <motion.div 
            key="new"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Upload Area */}
            <div className={cn(
              "lg:col-span-1 p-10 rounded-[3rem] shadow-xl border space-y-8",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
            )}>
              <h3 className="text-2xl font-black">Subir Áudio da Reunião</h3>
              
              <div 
                onClick={!isUploading && !isTranscribing ? simulateUpload : undefined}
                className={cn(
                  "p-12 border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center text-center transition-all",
                  isUploading || isTranscribing ? "border-blue-200 bg-blue-50/20" : "border-slate-100 bg-slate-50 hover:bg-slate-100/50 cursor-pointer"
                )}
              >
                {isUploading || isTranscribing ? (
                  <div className="space-y-6 w-full">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg animate-pulse">
                      <Mic className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-black text-blue-600 uppercase tracking-widest">
                        {isUploading ? 'Subindo Arquivo...' : 'Transcrevendo via IA...'}
                      </p>
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${isUploading ? uploadProgress : transcriptionProgress}%` }}
                          className="h-full bg-blue-600 rounded-full transition-all"
                        />
                      </div>
                      <p className="text-xs font-bold text-slate-400">{isUploading ? uploadProgress : transcriptionProgress}% concluído</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                      <Upload className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-black mb-2">Selecione o arquivo de áudio</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">MP3, WAV ou M4A (Máx 500MB)</p>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Dicas para melhor transcrição</h4>
                <ul className="space-y-3">
                  {[
                    'Evite ruídos de fundo excessivos',
                    'Fale próximo ao microfone',
                    'Identifique os participantes no início',
                    'Use áudio de alta qualidade (128kbps+)'
                  ].map((dica, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-500">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {dica}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Result Area */}
            <div className={cn(
              "lg:col-span-2 p-10 rounded-[3rem] shadow-xl border space-y-8",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
            )}>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black">Resumo Executivo Gerado</h3>
                <div className="flex gap-2">
                  <button className="p-3 bg-slate-100 text-slate-400 hover:text-blue-600 rounded-xl transition-all">
                    <Copy className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-slate-100 text-slate-400 hover:text-blue-600 rounded-xl transition-all">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className={cn(
                "w-full h-[500px] p-10 rounded-[2.5rem] font-medium leading-relaxed overflow-y-auto relative",
                isDarkMode ? "bg-slate-950 text-slate-300" : "bg-slate-50 text-slate-700"
              )}>
                {!summary && !isTranscribing && !isUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                    <Sparkles className="w-16 h-16 text-slate-200 mb-6" />
                    <p className="text-xl font-black text-slate-300">Aguardando áudio para processamento...</p>
                  </div>
                )}
                
                {isTranscribing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-white/50 backdrop-blur-sm z-10">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
                    <p className="text-xl font-black text-blue-600">A IA está ouvindo e resumindo...</p>
                  </div>
                )}

                {summary && (
                  <div className="space-y-6 whitespace-pre-wrap">
                    {summary}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3">
                  <Save className="w-5 h-5" />
                  Salvar Ata no Cérebro
                </button>
                <button className="px-10 py-5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                  Editar Resumo
                </button>
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
              { id: '1', title: 'Reunião: Planejamento Obras Q2', date: '25 Mar, 2024', duration: '45min', author: 'Ana Paula' },
              { id: '2', title: 'Coletiva: Novo Hospital Municipal', date: '24 Mar, 2024', duration: '1h 20min', author: 'Ricardo' },
              { id: '3', title: 'Reunião Interna: RH e TI', date: '22 Mar, 2024', duration: '30min', author: 'Juliana' },
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
                    <h3 className="text-xl font-black">{item.title}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.date}</p>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{item.duration}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Por {item.author}</p>
                    </div>
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
                    <Download className="w-5 h-5" />
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
