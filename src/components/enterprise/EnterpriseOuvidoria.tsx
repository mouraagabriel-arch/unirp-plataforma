import { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Inbox,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  User,
  Wrench,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { CHAMADOS_OUVIDORIA_MOCK, type ChamadoOuvidoria } from '../../lib/ouvidoriaMockApi';

export function EnterpriseOuvidoria({ isDarkMode }: { isDarkMode: boolean }) {
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState<ChamadoOuvidoria>(CHAMADOS_OUVIDORIA_MOCK[0]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const simulateTechnicalAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 1800);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-12rem)] min-h-[500px] flex flex-col xl:flex-row gap-4 overflow-hidden">
      <div className="w-full xl:w-80 xl:min-w-[20rem] flex flex-col glass-card overflow-hidden border-white/5 min-h-[220px] xl:min-h-0">
        <div className="px-4 py-3 border-b border-white/5 space-y-3 bg-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Caixa de Entrada - Ouvidoria</h2>
            <div className="flex items-center gap-2 px-2.5 py-1 glass-item border-brand-emerald/30 rounded-full">
              <span className="w-1.5 h-1.5 bg-brand-emerald rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-brand-emerald uppercase tracking-[0.15em]">Ao Vivo</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Filtrar chamados..."
              className="w-full pl-8 pr-3 py-2 glass-item bg-white/5 border-white/5 focus:border-brand-accent/30 outline-none text-xs font-medium text-white placeholder:text-slate-600 transition-all rounded-lg"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {CHAMADOS_OUVIDORIA_MOCK.map((demand) => (
            <motion.div
              key={demand.id}
              whileHover={{ x: 4 }}
              onClick={() => setSelectedDemand(demand)}
              className={cn(
                'p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden',
                selectedDemand.id === demand.id ? 'bg-brand-accent/10 border-brand-accent/30' : 'border-white/5 hover:bg-white/5'
              )}
            >
              {selectedDemand.id === demand.id && (
                <motion.div layoutId="active-indicator-ouvidoria" className="absolute left-0 top-3 bottom-3 w-0.5 bg-brand-accent rounded-r-full" />
              )}

              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <img src={demand.avatar} className="w-9 h-9 rounded-xl object-cover border border-white/10" alt={demand.cidadao} referrerPolicy="no-referrer" />
                  <div
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-brand-bg',
                      demand.prioridade === 'Crítica' ? 'bg-brand-rose' : demand.prioridade === 'Alta' ? 'bg-brand-amber' : 'bg-brand-emerald'
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-semibold text-sm text-white truncate">{demand.cidadao}</p>
                    <span className="text-[10px] text-slate-500 flex-shrink-0 ml-2">{demand.data.split(',')[0]}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mb-1.5">{demand.assunto}</p>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase',
                        demand.prioridade === 'Crítica'
                          ? 'bg-rose-400/20 text-rose-300'
                          : demand.prioridade === 'Alta'
                            ? 'bg-brand-amber/20 text-brand-amber'
                            : demand.prioridade === 'Média'
                              ? 'bg-blue-400/20 text-blue-300'
                              : 'bg-brand-emerald/20 text-brand-emerald'
                      )}
                    >
                      {demand.prioridade}
                    </span>
                    <span className="text-[9px] text-slate-500 truncate">{demand.bairro}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col glass-card overflow-hidden border-white/5 min-w-0 min-h-[320px] xl:min-h-0">
        <div className="px-5 py-3 border-b border-white/5 flex items-start sm:items-center justify-between gap-3 bg-white/5">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <img src={selectedDemand.avatar} className="w-10 h-10 rounded-xl object-cover border border-white/10" alt={selectedDemand.cidadao} referrerPolicy="no-referrer" />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{selectedDemand.cidadao}</h3>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-0.5">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-brand-emerald" />
                  <span className="text-xs text-slate-400">{selectedDemand.bairro}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-brand-accent" />
                  <span className="text-xs text-slate-400">{selectedDemand.categoria}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setToastMessage({ text: `✅ Detalhes do chamado ${selectedDemand.id} atualizados.`, type: 'success' })}
            className="p-2 glass-item text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-all border-white/5"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                Relato do Cidadão
              </h4>
              <div className="p-4 glass-item border-white/5 rounded-xl bg-white/5">
                <p className="text-sm leading-relaxed text-slate-300 italic">"{selectedDemand.relato}"</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-rose" />
                Evidência Anexada
              </h4>
              <div className="relative group cursor-zoom-in overflow-hidden rounded-xl border border-white/10 aspect-video">
                <img src={selectedDemand.foto} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" alt="Evidência do chamado" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-brand-bg/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <div className="px-4 py-2 glass-card border-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-white">Ampliar</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-brand-accent" />
                Triagem Técnica de Zeladoria
              </h4>
              <button
                onClick={simulateTechnicalAnalysis}
                className="flex items-center gap-1.5 text-[10px] font-bold text-brand-accent uppercase tracking-wider hover:text-white transition-colors"
              >
                {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Recalcular Análise
              </button>
            </div>

            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div
                  key="analyzing-ouvidoria"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="p-8 glass-card border-brand-accent/30 border-dashed flex flex-col items-center justify-center text-center gap-3 bg-brand-accent/5 rounded-xl"
                >
                  <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
                  <div>
                    <p className="text-sm font-bold text-white">IA avaliando urgência técnica...</p>
                    <p className="text-slate-500 text-xs mt-1">Cruzando risco de segurança e impacto operacional da via.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="results-ouvidoria" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 glass-card border-brand-rose/30 bg-brand-rose/5 rounded-xl">
                    <p className="text-[9px] font-bold text-brand-rose uppercase tracking-wider mb-2">Urgência Técnica</p>
                    <p className="text-sm font-semibold text-white mb-1">{selectedDemand.urgenciaTecnica}</p>
                    <p className="text-[9px] text-brand-rose/70">Nível: {selectedDemand.prioridade}</p>
                  </div>

                  <div className="p-3 glass-card border-brand-emerald/30 bg-brand-emerald/5 rounded-xl">
                    <p className="text-[9px] font-bold text-brand-emerald uppercase tracking-wider mb-2">Impacto</p>
                    <p className="text-sm font-semibold text-white mb-1">{selectedDemand.impactoComunitario}</p>
                    <p className="text-[9px] text-brand-emerald/70">Impacto Comunitário</p>
                  </div>

                  <div className="p-3 glass-card border-brand-accent/30 bg-brand-accent/5 rounded-xl">
                    <p className="text-[9px] font-bold text-brand-accent uppercase tracking-wider mb-2">Segurança</p>
                    <p className="text-sm font-semibold text-white mb-1">Alerta</p>
                    <p className="text-[9px] text-brand-accent/70">{selectedDemand.riscoSeguranca}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fluxo de Resolução</h4>
            <div className="flex flex-col lg:flex-row gap-3">
              <button
                onClick={() => setToastMessage({ text: `📌 Chamado encaminhado para ${selectedDemand.secretariaResponsavel}.`, type: 'success' })}
                className="w-full lg:flex-1 py-2.5 bg-brand-accent text-white rounded-lg font-semibold text-sm hover:bg-brand-accent/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-center px-3"
              >
                <Send className="w-4 h-4" />
                Encaminhar para Secretaria Responsável
              </button>
              <button
                onClick={() => setToastMessage({ text: `🧾 Protocolo oficial gerado para ${selectedDemand.id}.`, type: 'success' })}
                className="w-full lg:flex-1 py-2.5 glass-item border-white/10 text-white rounded-lg font-semibold text-sm hover:bg-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-center px-3"
              >
                <Inbox className="w-4 h-4 text-brand-emerald" />
                Gerar Protocolo Oficial
              </button>
              <button
                onClick={() => setToastMessage({ text: `💬 Notificação WhatsApp enviada ao cidadão ${selectedDemand.cidadao}.`, type: 'success' })}
                className="w-full lg:w-auto px-4 py-2.5 glass-item border-white/5 text-slate-300 rounded-lg text-sm hover:text-white hover:bg-white/5 transition-all"
              >
                Notificar Cidadão via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      <aside className="w-full xl:w-80 xl:min-w-[20rem] flex flex-col gap-4 glass-card border-white/5 p-4 overflow-y-auto custom-scrollbar min-h-[220px] xl:min-h-0">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Perfil do Munícipe</p>
          <p className="text-sm font-semibold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-300" />
            {selectedDemand.perfilMunicipe}
          </p>
          <p className="text-xs text-slate-400 break-words">Classificação relacional para priorização de retorno e acompanhamento recorrente.</p>
        </div>

        <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Status de Logística</p>
          <p className="text-sm font-semibold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-emerald-300" />
            {selectedDemand.statusLogistica}
          </p>
          <p className="text-xs text-emerald-100/90 break-words">{selectedDemand.logisticaDetalhe}</p>
        </div>

        <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 p-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-300">Histórico de Protocolos</p>
          <p className="text-2xl font-black text-white">{selectedDemand.historicoProtocolos}</p>
          <p className="text-xs text-amber-100/90 break-words">Chamados já abertos por este cidadão para a mesma secretaria.</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tags Técnicas</p>
          <div className="flex flex-wrap gap-2">
            {selectedDemand.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-400/20">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-rose-400/25 bg-rose-500/10 p-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-300">Risco de Segurança</p>
          <p className="text-sm text-white font-semibold break-words">{selectedDemand.riscoSeguranca}</p>
          <p className="text-xs text-rose-100/90 break-words">Triagem orientada por risco técnico: acidente, bloqueio de via e exposição de pedestres.</p>
        </div>
      </aside>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              'fixed bottom-6 left-6 px-6 py-4 rounded-xl font-bold text-white shadow-xl z-50 flex items-center gap-2',
              toastMessage.type === 'success' ? 'bg-brand-emerald' : 'bg-brand-rose'
            )}
          >
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toastMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      <span className="sr-only">Tema atual: {isDarkMode ? 'escuro' : 'claro'}</span>
    </section>
  );
}
