import { useState } from 'react';
import { 
  Swords, ShieldAlert, Zap, 
  Sparkles, Loader2, MessageSquare, 
  ArrowRight, Copy, Download, 
  History, Star, AlertCircle,
  HelpCircle, CheckCircle2, XCircle,
  TrendingUp, TrendingDown, Landmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { GoogleGenAI } from "@google/genai";

export function GabineteArsenal({ isDarkMode }: { isDarkMode: boolean }) {
  const [attack, setAttack] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [defense, setDefense] = useState<any>(null);

  const generateDefense = async () => {
    if (!attack) return;
    setIsGenerating(true);
    try {
      // Simular estrutura de resposta
      setTimeout(() => {
        setDefense({
          counter: "Os dados oficiais da Secretaria de Fazenda mostram que o investimento em saúde cresceu 15% no último ano, desmentindo a narrativa de cortes.",
          mandate: "Entregamos 3 novas UBS e reformamos o Hospital Municipal, beneficiando mais de 50 mil cidadãos diretamente.",
          question: "Se o nobre colega é tão preocupado com a saúde, por que votou contra o orçamento que previa a contratação de novos médicos?",
          tone: "Firme e Institucional"
        });
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error("Erro ao gerar defesa:", error);
      setIsGenerating(false);
    }
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
            Arsenal de <span className="text-brand-rose drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">Embate</span>
          </motion.h1>
          <p className="text-slate-400 font-medium max-w-2xl">
            Prepare-se para debates e tribuna com inteligência estratégica. Simule ataques da oposição e receba contra-argumentos baseados em dados reais do seu mandato.
          </p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex gap-4"
        >
          <button className="flex items-center gap-3 px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all duration-300">
            <History className="w-5 h-5" />
            Histórico de Embates
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Input Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 rounded-[4rem] border border-white/5 shadow-2xl space-y-10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-rose/5 blur-[80px] -mr-32 -mt-32 pointer-events-none" />
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 bg-brand-rose/10 text-brand-rose rounded-2xl flex items-center justify-center border border-brand-rose/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-white tracking-tight">Ataque da Oposição</h3>
              <p className="text-slate-500 font-medium">O que estão dizendo na tribuna ou redes?</p>
            </div>
          </div>
          
          <div className="space-y-4 relative z-10">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Argumento ou Crítica Recebida</label>
            <textarea 
              value={attack}
              onChange={(e) => setAttack(e.target.value)}
              placeholder="Ex: O vereador não faz nada pela saúde e só pensa em asfalto..."
              className="w-full h-64 p-10 rounded-[3rem] font-medium leading-relaxed resize-none border-2 border-white/5 bg-white/5 focus:border-brand-rose/50 transition-all outline-none text-white text-lg placeholder:text-slate-700 shadow-inner"
            />
          </div>

          <button 
            onClick={generateDefense}
            disabled={!attack || isGenerating}
            className="w-full py-8 bg-brand-rose text-white rounded-[2.5rem] font-black text-xl hover:bg-brand-rose/90 transition-all shadow-[0_10px_30px_rgba(244,63,94,0.3)] flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group relative z-10"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-7 h-7 animate-spin" />
                Gerando Contra-Ataque...
              </>
            ) : (
              <>
                <Zap className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                Preparar Defesa de Mandato
              </>
            )}
          </button>

          <div className="p-8 bg-brand-amber/5 rounded-[2.5rem] border border-brand-amber/20 flex items-start gap-5 relative z-10 group hover:bg-brand-amber/10 transition-all">
            <AlertCircle className="w-7 h-7 text-brand-amber shrink-0 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-bold text-slate-400 leading-relaxed">
              <span className="text-brand-amber font-black uppercase tracking-widest block mb-1">Dica do Estrategista</span>
              Ataques sobre "falta de presença" são melhor combatidos com registros visuais de visitas aos bairros e relatórios de votações em comissões.
            </p>
          </div>
        </motion.div>

        {/* Result Area */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {!defense && !isGenerating ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="glass-card h-full min-h-[600px] rounded-[4rem] border border-white/5 flex flex-col items-center justify-center text-center p-16 shadow-2xl"
              >
                <div className="w-32 h-32 bg-white/5 text-slate-700 rounded-[3rem] flex items-center justify-center mb-10 border border-white/5">
                  <Swords className="w-16 h-16" />
                </div>
                <h3 className="text-3xl font-black text-slate-500 tracking-tighter">Aguardando Ataque...</h3>
                <p className="text-slate-600 font-medium max-w-xs mt-4 text-lg">Insira o argumento da oposição ao lado para que a IA processe a melhor defesa estratégica.</p>
              </motion.div>
            ) : isGenerating ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card h-full min-h-[600px] rounded-[4rem] border border-brand-rose/30 flex flex-col items-center justify-center text-center p-16 shadow-2xl bg-gradient-to-br from-brand-rose/10 to-transparent"
              >
                <div className="relative mb-12">
                  <div className="w-32 h-32 bg-brand-rose/20 rounded-[3rem] flex items-center justify-center border border-brand-rose/30 animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                    <Sparkles className="w-16 h-16 text-brand-rose animate-spin-slow" />
                  </div>
                </div>
                <h3 className="text-4xl font-black text-white tracking-tighter mb-4">IA Estrategista Ativa</h3>
                <p className="text-slate-400 text-xl font-medium max-w-md">Cruzando dados do mandato com as falhas do oponente para gerar o contra-ataque perfeito...</p>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card p-12 rounded-[4rem] border border-white/5 shadow-2xl space-y-10 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/5 blur-[100px] -mr-48 -mt-48 pointer-events-none" />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-accent/10 text-brand-accent rounded-2xl flex items-center justify-center border border-brand-accent/20">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tight">Estratégia de Resposta</h3>
                  </div>
                  <div className="flex gap-3">
                    <button className="p-4 bg-white/5 text-slate-400 hover:text-brand-accent rounded-2xl transition-all border border-white/5 hover:bg-white/10">
                      <Copy className="w-6 h-6" />
                    </button>
                    <button className="p-4 bg-white/5 text-slate-400 hover:text-brand-accent rounded-2xl transition-all border border-white/5 hover:bg-white/10">
                      <Download className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6 relative z-10">
                  {/* Risco de Discurso */}
                  <div className="p-10 bg-brand-rose/5 rounded-[3rem] border border-brand-rose/20 relative overflow-hidden group hover:bg-brand-rose/10 transition-all">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <AlertCircle className="w-24 h-24 text-brand-rose" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <ShieldAlert className="w-5 h-5 text-brand-rose" />
                      <span className="text-[10px] font-black text-brand-rose uppercase tracking-widest">Análise de Risco de Discurso</span>
                    </div>
                    <p className="text-2xl font-black text-white leading-tight mb-3">
                      Risco de Interpretação: <span className="text-brand-rose drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]">Moderado</span>
                    </p>
                    <p className="text-sm font-medium text-slate-400 leading-relaxed">
                      Alerta: Seu discurso pode ser interpretado como agressivo se não houver ênfase nos dados técnicos. Recomendamos manter o foco no investimento em saúde para mitigar ataques de "falta de empatia".
                    </p>
                  </div>

                  <div className="p-10 bg-brand-emerald/5 rounded-[3rem] border border-brand-emerald/20 group hover:bg-brand-emerald/10 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-brand-emerald" />
                      <span className="text-[10px] font-black text-brand-emerald uppercase tracking-widest">Contra-Argumento (Fatos)</span>
                    </div>
                    <p className="text-xl font-bold text-white leading-relaxed">
                      {defense.counter}
                    </p>
                  </div>

                  <div className="p-10 bg-brand-accent/5 rounded-[3rem] border border-brand-accent/20 group hover:bg-brand-accent/10 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <Landmark className="w-5 h-5 text-brand-accent" />
                      <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">Defesa de Mandato</span>
                    </div>
                    <p className="text-xl font-bold text-white leading-relaxed">
                      {defense.mandate}
                    </p>
                  </div>

                  <div className="p-10 bg-brand-rose/10 rounded-[3rem] border border-brand-rose/30 group hover:bg-brand-rose/20 transition-all shadow-[0_10px_30px_rgba(244,63,94,0.1)]">
                    <div className="flex items-center gap-3 mb-4">
                      <HelpCircle className="w-5 h-5 text-brand-rose" />
                      <span className="text-[10px] font-black text-brand-rose uppercase tracking-widest">Pergunta Incisiva (Tribuna)</span>
                    </div>
                    <p className="text-2xl font-black text-white leading-relaxed italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                      "{defense.question}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-8 bg-white/5 rounded-[2.5rem] border border-white/10 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-brand-accent/10 rounded-2xl flex items-center justify-center border border-brand-accent/20">
                      <MessageSquare className="w-7 h-7 text-brand-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tom de Voz Sugerido</p>
                      <p className="text-xl font-black text-white">{defense.tone}</p>
                    </div>
                  </div>
                  <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-xs hover:bg-white/10 transition-all hover:border-brand-accent/50">
                    Ajustar Tom
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
