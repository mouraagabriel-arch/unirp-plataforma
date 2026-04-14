import { useEffect, useState } from 'react';
import { BarChart3, Calendar, Download, Loader2, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useTenantService } from '../../services/useTenantService';
import { GoogleGenAI } from '@google/genai';
import { callGeminiWithRetry } from '../../lib/utils';

interface ClippingAnalytics {
  positivos: number;
  neutros: number;
  negativos: number;
  total: number;
}

interface ReportData {
  mes: number;
  ano: number;
  analytics: ClippingAnalytics;
  analiseQualitativa?: string;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function SimpleBarChart({ data }: { data: ClippingAnalytics }) {
  const max = Math.max(data.positivos, data.neutros, data.negativos);
  const scale = max > 0 ? 200 / max : 1;

  return (
    <div className="flex items-end justify-around gap-4 h-[260px]">
      {[
        { label: 'Positivas', value: data.positivos, color: 'bg-emerald-500' },
        { label: 'Neutras', value: data.neutros, color: 'bg-amber-500' },
        { label: 'Negativas', value: data.negativos, color: 'bg-red-500' }
      ].map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-2">
          <div className="text-xs font-black text-slate-300 uppercase tracking-wider">{item.value}</div>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(20, item.value * scale)}px` }}
            transition={{ duration: 0.6 }}
            className={cn('w-12 rounded-t-lg shadow-lg', item.color)}
          />
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function SimplePieChart({ data }: { data: ClippingAnalytics }) {
  const total = data.total || 1;
  const p_positivos = (data.positivos / total) * 100;
  const p_neutros = (data.neutros / total) * 100;
  const p_negativos = (data.negativos / total) * 100;

  const circumference = 2 * Math.PI * 45;
  const offset_pos = circumference - (p_positivos / 100) * circumference;
  const offset_neu = circumference - (p_neutros / 100) * circumference;

  return (
    <div className="flex items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r="45"
          fill="none"
          stroke="#10b981"
          strokeWidth="18"
          strokeDasharray={circumference}
          strokeDashoffset={offset_pos}
          transform="rotate(-90 100 100)"
        />
        <circle
          cx="100"
          cy="100"
          r="45"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="18"
          strokeDasharray={(p_neutros / 100) * circumference}
          strokeDashoffset={-(p_positivos / 100) * circumference}
          transform="rotate(-90 100 100)"
        />
        <circle
          cx="100"
          cy="100"
          r="45"
          fill="none"
          stroke="#ef4444"
          strokeWidth="18"
          strokeDasharray={(p_negativos / 100) * circumference}
          strokeDashoffset={-((p_positivos + p_neutros) / 100) * circumference}
          transform="rotate(-90 100 100)"
        />
        <text x="100" y="105" textAnchor="middle" className="text-lg font-black" fill="#ffffff">
          {data.total}
        </text>
      </svg>
      <div className="ml-6 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-slate-300">
            Positivas: {Math.round(p_positivos)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs font-semibold text-slate-300">
            Neutras: {Math.round(p_neutros)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs font-semibold text-slate-300">
            Negativas: {Math.round(p_negativos)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function EnterpriseReports({ isDarkMode }: { isDarkMode: boolean }) {
  const tenantService = useTenantService();
  const [mes, setMes] = useState(new Date().getMonth());
  const [ano, setAno] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [chartType, setChartType] = useState<'bars' | 'pie'>('pie');

  const loadReport = async () => {
    setLoading(true);
    try {
      const { data, error } = await tenantService.getClippingAnalyticsByPeriod(mes + 1, ano);
      if (error) {
        alert(`Erro ao carregar relatório: ${error.message}`);
        setLoading(false);
        return;
      }

      setReport({
        mes: mes + 1,
        ano,
        analytics: data || { positivos: 0, neutros: 0, negativos: 0, total: 0 }
      });
    } catch (error) {
      console.error('[EnterpriseReports] Erro ao carregar:', error);
      alert('Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = async () => {
    if (!report) return;

    setGeneratingAnalysis(true);
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const institutionalPrompt = await tenantService.getInstitutionalPrompt();
      
      const response = await callGeminiWithRetry(
        () => ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${institutionalPrompt}\n\nAnalise os dados de percepção pública baseado neste resumo de clipping de ${meses[mes]} de ${ano}:\n\nTotal de matérias: ${report.analytics.total}\nPositivas: ${report.analytics.positivos}\nNeutras: ${report.analytics.neutros}\nNegativas: ${report.analytics.negativos}\n\nEscreva exatamente 3 parágrafos (300-400 palavras) sobre a "Percepção Pública da Marca" no período. Considere: tendências narrativas, ânimo geral da imprensa, riscos de reputação, oportunidades de posicionamento. Não inclua números, use análise qualitativa e contextual.`,
        }),
        setStatusMsg
      );

      const texto = (response.text ?? '').trim();
      if (!texto) throw new Error('Resposta vazia da IA');

      setReport(prev => prev ? { ...prev, analiseQualitativa: texto } : null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[generateAnalysis] Erro:', error);
      alert(`Erro na análise com IA:\n${msg}`);
    } finally {
      setGeneratingAnalysis(false);
      setStatusMsg('');
    }
  };

  const handleDownloadReport = () => {
    if (!report) return;

    const content = `RELATÓRIO DE ANÁLISE EDITORIAL
Data: ${new Date().toLocaleDateString('pt-BR')}
Período: ${meses[report.mes - 1]} de ${report.ano}

=== RESUMO EXECUTIVO ===
Total de Matérias: ${report.analytics.total}
Positivas: ${report.analytics.positivos} (${((report.analytics.positivos / report.analytics.total) * 100).toFixed(1)}%)
Neutras: ${report.analytics.neutros} (${((report.analytics.neutros / report.analytics.total) * 100).toFixed(1)}%)
Negativas: ${report.analytics.negativos} (${((report.analytics.negativos / report.analytics.total) * 100).toFixed(1)}%)

=== ANÁLISE QUALITATIVA DA PERCEPÇÃO PÚBLICA ===
${report.analiseQualitativa || 'Análise não foi gerada ainda. Clique em "Gerar Análise com IA".'}

---
Relatório gerado automaticamente pela plataforma uniRP
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_editorial_${meses[report.mes - 1].toLowerCase()}_${report.ano}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    void loadReport();
  }, [mes, ano]);

  return (
    <section className="w-full max-w-7xl mx-auto py-8 text-slate-100 space-y-6">
      {statusMsg && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm font-medium animate-pulse">
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Controles */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Relatórios Editoriais</h1>
            <p className="text-sm text-slate-400">Análise de percepção pública e indicadores de reputação</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-black">Mês</label>
            <select
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-accent/40"
            >
              {meses.map((nome, idx) => (
                <option key={idx} value={idx} className="bg-slate-900">
                  {nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-black">Ano</label>
            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(parseInt(e.target.value))}
              min="2020"
              max={new Date().getFullYear() + 1}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-accent/40"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-black">Gráfico</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as 'bars' | 'pie')}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-accent/40"
            >
              <option value="pie" className="bg-slate-900">Pizza</option>
              <option value="bars" className="bg-slate-900">Barras</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => void loadReport()}
              disabled={loading}
              className="w-full rounded-xl bg-brand-accent text-white py-3 font-black text-sm hover:bg-brand-accent/90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  Carregar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Relatório */}
      <AnimatePresence mode="wait">
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Matérias Positivas', valor: report.analytics.positivos, cor: 'emerald', icon: TrendingUp },
                { label: 'Matérias Neutras', valor: report.analytics.neutros, cor: 'amber', icon: BarChart3 },
                { label: 'Matérias Negativas', valor: report.analytics.negativos, cor: 'red', icon: TrendingDown }
              ].map((item) => {
                const Icon = item.icon;
                const colorClasses = {
                  emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
                  amber: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
                  red: 'bg-red-500/20 border-red-500/30 text-red-300'
                };

                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className={cn(
                      'rounded-2xl border p-6 space-y-2',
                      colorClasses[item.cor as keyof typeof colorClasses]
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                    </div>
                    <p className="text-3xl font-black">{item.valor}</p>
                    {report.analytics.total > 0 && (
                      <p className="text-[10px] text-slate-400 font-semibold">
                        {((item.valor / report.analytics.total) * 100).toFixed(1)}% do total
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Gráfico */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-8"
            >
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
                Distribuição de Sentimentos - {meses[mes]} {ano}
              </p>
              {chartType === 'pie' ? (
                <SimplePieChart data={report.analytics} />
              ) : (
                <SimpleBarChart data={report.analytics} />
              )}
            </motion.div>

            {/* Análise Qualitativa */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-8 space-y-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Percepção Pública da Marca</h3>
                    <p className="text-xs text-slate-400 font-semibold">Análise qualitativa com IA</p>
                  </div>
                </div>
                <button
                  onClick={() => void generateAnalysis()}
                  disabled={generatingAnalysis}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black text-sm hover:from-purple-700 hover:to-purple-600 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-60 flex items-center gap-2"
                >
                  {generatingAnalysis ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Gerar Análise com IA
                    </>
                  )}
                </button>
              </div>

              {report.analiseQualitativa ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-6 space-y-4"
                >
                  <p className="text-base leading-relaxed text-slate-200 whitespace-pre-wrap">
                    {report.analiseQualitativa}
                  </p>
                  <button
                    onClick={handleDownloadReport}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600/90 text-white px-4 py-2 font-black text-sm hover:bg-emerald-500 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Relatório Completo
                  </button>
                </motion.div>
              ) : (
                <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 text-center text-slate-400 text-sm font-semibold">
                  Clique no botão acima para gerar a análise de percepção pública com IA
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="sr-only">Tema: {isDarkMode ? 'escuro' : 'claro'}</span>
    </section>
  );
}
