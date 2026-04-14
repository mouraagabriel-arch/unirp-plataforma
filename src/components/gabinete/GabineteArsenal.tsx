import { useState, type ChangeEvent } from 'react';
import { 
  Swords, ShieldAlert, Zap, 
  Sparkles, Loader2, MessageSquare, 
  ArrowRight, Copy, Download, 
  History, Star, AlertCircle,
  HelpCircle, CheckCircle2, XCircle,
  TrendingUp, TrendingDown, Landmark,
  Upload, Radar, Siren, FileWarning, Mic, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { handleCopyToClipboard, handleDownload } from '../../lib/buttonHandlers';
import { useTerminologia } from '../../hooks/useTerminologia';

const ANALYSIS_PRESETS = {
  baixo: {
    label: 'Baixo',
    compatibility: 81,
    imageRisk: 24,
    crisis: 18,
    volatility: 32,
    suggestion: 'Sustente o debate em entregas concretas do mandato e use tom sereno para não amplificar o ataque.',
    crisisPoints: ['Ruido limitado em redes locais', 'Necessidade de reforcar dado oficial', 'Baixo risco de viralizacao adversa'],
  },
  medio: {
    label: 'Medio',
    compatibility: 63,
    imageRisk: 58,
    crisis: 61,
    volatility: 54,
    suggestion: 'Reposicione a narrativa com comparativos de resultado, use porta-voz tecnico e responda antes que a oposicao defina o enquadramento.',
    crisisPoints: ['Ataque com apelo emocional', 'Base pode interpretar hesitacao', 'Tema sensivel para imprensa regional'],
  },
  critico: {
    label: 'Critico',
    compatibility: 38,
    imageRisk: 86,
    crisis: 91,
    volatility: 82,
    suggestion: 'Acione defesa coordenada, concentre a resposta em dano reputacional, estabeleca fato verificavel imediato e prepare nota oficial em paralelo.',
    crisisPoints: ['Alto potencial de desgaste de imagem', 'Risco de corte em video fora de contexto', 'Narrativa adversa com chance de viralizacao'],
  },
} as const;

const HISTORICO_ANALISE = [
  { titulo: 'Discurso sobre saude', risco: 'Medio', impacto: 'Regional', horario: 'Hoje, 08:40' },
  { titulo: 'Tribuna sobre mobilidade', risco: 'Baixo', impacto: 'Base local', horario: 'Ontem, 19:10' },
  { titulo: 'Entrevista sobre tributos', risco: 'Critico', impacto: 'Imprensa', horario: 'Ontem, 09:00' },
];

export function GabineteArsenal({ isDarkMode }: { isDarkMode: boolean }) {
  const [toastMessage, setToastMessage] = useState<{text: string; type: 'success'|'error'}|null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isToneMenuOpen, setIsToneMenuOpen] = useState(false);
  
  const { termo } = useTerminologia();
  const [attack, setAttack] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [defense, setDefense] = useState<any>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isSimulatingPress, setIsSimulatingPress] = useState(false);

  // Toast auto-hide
  if (toastMessage) {
    setTimeout(() => setToastMessage(null), 3000);
  }

  const resolvePreset = (content: string) => {
    const normalized = content.toLowerCase();

    if (
      normalized.includes('corrup') ||
      normalized.includes('escand') ||
      normalized.includes('crime') ||
      normalized.includes('desvio')
    ) {
      return ANALYSIS_PRESETS.critico;
    }

    if (
      normalized.includes('saude') ||
      normalized.includes('imposto') ||
      normalized.includes('educa') ||
      normalized.length > 180
    ) {
      return ANALYSIS_PRESETS.medio;
    }

    return ANALYSIS_PRESETS.baixo;
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    setAttack((current) => current || `Arquivo carregado: ${file.name}`);
  };

  const generateDefense = async () => {
    if (!attack) return;
    setIsGenerating(true);
    try {
      const preset = resolvePreset(attack);

      // Simular estrutura de resposta
      setTimeout(() => {
        setDefense({
          counter: "Os dados oficiais da Secretaria de Fazenda mostram que o investimento em saúde cresceu 15% no último ano, desmentindo a narrativa de cortes.",
          mandate: `Entregamos 3 novas UBS e reformamos o Hospital Municipal, beneficiando mais de 50 mil ${termo('cidadaos').toLowerCase()} diretamente.`,
          question: "Se o nobre colega é tão preocupado com a saúde, por que votou contra o orçamento que previa a contratação de novos médicos?",
          tone: "Firme e Institucional",
          analysis: preset,
          fileName: uploadedFileName,
        });
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error("Erro ao gerar defesa:", error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 flex flex-col gap-6 px-4 pb-10 overflow-x-hidden">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-black tracking-tighter text-white"
            >
              Arsenal de <span className="text-brand-rose drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">Embate</span>
            </motion.h1>
            <p className="text-slate-400 font-medium max-w-2xl">
              Prepare-se para debates e tribuna com inteligencia estrategica. Simule ataques da oposicao e receba contra-argumentos baseados em dados reais do seu mandato.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-4"
          >
            <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className="flex items-center gap-3 px-4 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all duration-300">
              <History className="w-3.5 h-3.5" />
              Historico de Embates
            </button>
          </motion.div>
        </div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6"
      >
        <div className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-rose/10 text-brand-rose rounded-xl flex items-center justify-center border border-brand-rose/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Ataque da Oposicao</h3>
            <p className="text-slate-400 text-sm">Lamina de entrada estrategica para mapear narrativa adversaria.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Argumento ou Critica Recebida</label>
            <textarea
              value={attack}
              onChange={(e) => setAttack(e.target.value)}
              placeholder="Ex: O vereador nao faz nada pela saude e so pensa em asfalto..."
              className="w-full h-40 p-5 rounded-xl font-medium leading-relaxed resize-none border border-white/10 bg-white/5 focus:border-brand-rose/50 transition-all outline-none text-white text-base placeholder:text-slate-600"
            />
          </div>

          <label className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 space-y-4 cursor-pointer hover:bg-white/10 transition-all block">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-accent/10 text-brand-accent border border-brand-accent/20 flex items-center justify-center">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <p className="text-white font-black text-base">Analise de Proposta/Discurso</p>
                <p className="text-slate-400 text-sm">Suba PDF, DOC ou briefing para leitura tatica de discurso.</p>
              </div>
            </div>
            <div className="text-xs font-black uppercase tracking-widest text-slate-300">
              {uploadedFileName || 'Nenhum arquivo carregado'}
            </div>
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 items-stretch">
          <button
            onClick={generateDefense}
            disabled={!attack || isGenerating}
            className="px-8 py-4 bg-brand-rose text-white rounded-xl font-black text-lg hover:bg-brand-rose/90 transition-all shadow-[0_10px_30px_rgba(244,63,94,0.3)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando Contra-Ataque...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Preparar Defesa
              </>
            )}
          </button>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-4 flex items-start gap-4">
            <AlertCircle className="w-4 h-4 text-brand-amber shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-slate-300 leading-relaxed">
              <span className="text-brand-amber font-black uppercase tracking-widest block mb-1">Dica do Estrategista</span>
              Ataques sobre falta de presenca sao melhor combatidos com registros visuais de visitas aos bairros e relatorios de votacoes em comissoes.
            </p>
          </div>
        </div>
      </motion.section>

      <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.35fr] gap-6 items-start">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Radar de Embates Recentes</p>
            <Swords className="w-4 h-4 text-slate-500" />
          </div>

          <div className="space-y-3">
            {HISTORICO_ANALISE.map((item) => (
              <div key={item.titulo} className="grid grid-cols-[1fr_auto] gap-3 items-center p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-sm font-black text-white">{item.titulo}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.horario}</p>
                </div>
                <span className={cn(
                  'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border',
                  item.risco === 'Critico' && 'bg-brand-rose/20 text-brand-rose border-brand-rose/30',
                  item.risco === 'Medio' && 'bg-brand-amber/20 text-brand-amber border-brand-amber/30',
                  item.risco === 'Baixo' && 'bg-brand-emerald/20 text-brand-emerald border-brand-emerald/30'
                )}>
                  {item.risco}
                </span>
              </div>
            ))}
          </div>

          {defense && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-brand-accent" />
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tom de Voz Sugerido</p>
                  <p className="text-sm font-bold text-white">{defense.tone}</p>
                </div>
              </div>
              <button onClick={() => setIsToneMenuOpen(!isToneMenuOpen)} className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg font-bold text-xs hover:bg-white/10 transition-all">
                Ajustar Tom
              </button>
            </div>
          )}
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-brand-accent" />
              <h3 className="text-lg font-black text-white tracking-tight">Painel de Resultados</h3>
            </div>
            <div className="flex gap-2">
              <button onClick={async () => {
                if (defense?.counter) {
                  await handleCopyToClipboard(defense.counter);
                  setToastMessage({text: '✅ Contra-argumento copiado!', type: 'success'});
                }
              }} className="p-2 bg-white/5 text-slate-300 hover:text-white rounded-lg transition-all border border-white/10 hover:bg-white/10">
                <Copy className="w-4 h-4" />
              </button>
              <button onClick={() => {
                if (defense?.counter) {
                  handleDownload(defense.counter, 'defesa-contra-ataque.txt', 'text/plain');
                  setToastMessage({text: '✅ Arquivo baixado!', type: 'success'});
                }
              }} className="p-2 bg-white/5 text-slate-300 hover:text-white rounded-lg transition-all border border-white/10 hover:bg-white/10">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-8 flex flex-col items-center text-center gap-4"
              >
                <div className="w-14 h-14 bg-brand-rose/20 rounded-xl flex items-center justify-center border border-brand-rose/40 shadow-[0_0_28px_rgba(244,63,94,0.25)]">
                  <Sparkles className="w-7 h-7 text-brand-rose animate-spin-slow" />
                </div>
                <p className="text-lg font-bold text-white">IA Estrategista em Processamento</p>
                <p className="text-sm text-slate-400 max-w-md">Mapeando o ataque, calibrando risco e preparando contra-argumentos para tribuna.</p>
              </motion.div>
            ) : defense ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Radar className="w-4 h-4 text-cyan-300" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-200">Interface de Guerra</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-widest text-slate-400 font-black">Compatibilidade</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.55)]">{defense.analysis.compatibility}%</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-widest text-slate-400 font-black">Risco</span>
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                      </div>
                      <p className="text-2xl font-black text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.55)]">{defense.analysis.imageRisk}%</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-widest text-slate-400 font-black">Pontos de Crise</span>
                        <XCircle className="w-4 h-4 text-red-400" />
                      </div>
                      <p className="text-2xl font-black text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]">{defense.analysis.crisis}%</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 border-t border-white/10 pt-3">
                    Arquivo em analise: <span className="text-white font-semibold">{defense.fileName || 'Entrada textual direta do gabinete'}</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Siren className="w-4 h-4 text-slate-200" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-200">Contra-argumentos da IA</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-2">Contra-Argumento (Fatos)</p>
                    <p className="text-sm text-white font-semibold leading-relaxed">{defense.counter}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-2">Defesa de Mandato</p>
                    <p className="text-sm text-white font-semibold leading-relaxed">{defense.mandate}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-2">Pergunta Incisiva</p>
                    <p className="text-sm text-white font-semibold leading-relaxed italic">"{defense.question}"</p>
                  </div>

                  <div className="space-y-2">
                    {defense.analysis.crisisPoints.map((point: string) => (
                      <div key={point} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                        <FileWarning className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-200">{point}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-2">Sugestao Estrategica</p>
                    <p className="text-sm font-semibold text-white leading-relaxed">{defense.analysis.suggestion}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Radar className="w-4 h-4 text-slate-300" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-300">Interface de Guerra</p>
                  </div>
                  <p className="text-sm text-slate-400">As metricas de Compatibilidade, Risco e Pontos de Crise serao exibidas aqui apos o processamento.</p>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Siren className="w-4 h-4 text-slate-300" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-300">Contra-argumentos da IA</p>
                  </div>
                  <p className="text-sm text-slate-400">A lamina de resposta estrategica sera liberada quando voce clicar em Preparar Defesa.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => {
              setIsSimulatingPress(true);
              setTimeout(() => {
                setIsSimulatingPress(false);
                setToastMessage({text: '✅ Coletiva simulada com sucesso!', type: 'success'});
              }, 2000);
            }} disabled={isSimulatingPress} className="w-full py-4 bg-brand-accent text-white rounded-xl font-black text-sm hover:bg-brand-accent/90 transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(99,102,241,0.25)] disabled:opacity-70">
              {isSimulatingPress ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Simulando...
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Simular Coletiva de Imprensa
                </>
              )}
            </button>
            <button onClick={() => {
              setToastMessage({text: '📄 Notas geradas em 5 segundos...', type: 'success'});
              setTimeout(() => {
                setToastMessage({text: '✅ Notas de esclarecimento prontas para envio!', type: 'success'});
              }, 1500);
            }} className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-3">
              <FileText className="w-4 h-4 text-brand-emerald" />
              Gerar Notas de Esclarecimento
            </button>
          </div>
        </div>
      </section>

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
