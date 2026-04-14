import { useState } from 'react';
import {
  FileText,
  Upload,
  Search,
  Filter,
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit2,
  Activity,
  Zap,
  ShieldAlert,
  Landmark,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const MOCK_PROJECTS = [
  {
    id: '1',
    title: 'PL 145/2024 - Taxa do Lixo',
    author: 'Executivo Municipal',
    status: 'Em Análise',
    compatibility: 15,
    date: '25 Mar, 2024',
    category: 'Tributário',
    summary: 'Institui a taxa de coleta de resíduos sólidos domiciliares no município.',
  },
  {
    id: '2',
    title: 'PL 122/2024 - Incentivo ao Esporte',
    author: 'Ver. Ricardo Silva',
    status: 'Aprovado',
    compatibility: 85,
    date: '24 Mar, 2024',
    category: 'Social',
    summary: 'Cria o programa municipal de incentivo ao esporte amador e bolsas para atletas.',
  },
  {
    id: '3',
    title: 'PL 110/2024 - Reforma da Praça Central',
    author: 'Ver. Ana Paula',
    status: 'Em Análise',
    compatibility: 60,
    date: '22 Mar, 2024',
    category: 'Infraestrutura',
    summary: 'Autoriza o repasse de verbas para a revitalização completa da Praça da Matriz.',
  },
];

export function GabineteProjetos({ isDarkMode }: { isDarkMode: boolean }) {
  const [toastMessage, setToastMessage] = useState<{text: string; type: 'success'|'error'}|null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isMovingFolder, setIsMovingFolder] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingAmendment, setIsGeneratingAmendment] = useState(false);
  
  const [selectedProject, setSelectedProject] = useState(MOCK_PROJECTS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Toast auto-hide
  if (toastMessage) {
    setTimeout(() => setToastMessage(null), 3000);
  }

  const simulateAnalysis = () => {
    setIsAnalyzing(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsAnalyzing(false), 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const riskSummary =
    selectedProject.compatibility < 30
      ? {
          level: 'Crítico',
          tone: 'text-brand-rose',
          surface: 'bg-brand-rose/10 border-brand-rose/20',
          note: 'Alto potencial de desgaste político e exploração narrativa pela oposição.',
        }
      : selectedProject.compatibility < 70
        ? {
            level: 'Moderado',
            tone: 'text-brand-amber',
            surface: 'bg-brand-amber/10 border-brand-amber/20',
            note: 'Exige enquadramento cuidadoso para evitar ruído com a base e com a imprensa.',
          }
        : {
            level: 'Baixo',
            tone: 'text-brand-emerald',
            surface: 'bg-brand-emerald/10 border-brand-emerald/20',
            note: 'Boa aderência política, com espaço para defesa simples e mensagem propositiva.',
          };

  const suggestionPoints =
    selectedProject.compatibility < 30
      ? [
          'Antecipe a crítica fiscal com dado oficial e fonte de custeio.',
          'Desloque o debate para impacto social e proteção da população vulnerável.',
          'Use porta-voz técnico para reduzir personalização do conflito.',
        ]
      : selectedProject.compatibility < 70
        ? [
            'Sustente a defesa em equilíbrio entre impacto público e responsabilidade fiscal.',
            'Reforce ganhos práticos para a base antes de entrar no mérito ideológico.',
            'Prepare fala curta para redes e uma versão expandida para plenário.',
          ]
        : [
            'Enquadre o projeto como entrega concreta e agenda positiva do mandato.',
            'Mantenha mensagem simples, com benefício direto e cronograma claro.',
            'Converta a boa compatibilidade em narrativa de liderança e coordenação.',
          ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 pb-20 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Análise de <span className="text-brand-emerald">Projetos</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2">
            Inteligência legislativa e termômetro de compatibilidade ideológica.
          </p>
        </div>

        <button
          onClick={simulateAnalysis}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-accent text-white rounded-xl font-semibold text-sm hover:bg-brand-accent/90 transition-all shadow-lg shadow-brand-accent/20"
        >
          <Upload className="w-4 h-4" />
          Subir Novo Projeto (PDF)
        </button>
      </div>

      <div className="space-y-4">
        <div className="glass-card p-5 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 bg-brand-bg/90 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-14 h-14 bg-brand-accent text-white rounded-xl flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.35)] animate-pulse mb-6">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-white tracking-tight mb-3">IA Analisando Projeto...</h3>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest max-w-md mb-10">
                  Cruzando pauta legislativa com o núcleo ideológico do mandato.
                </p>
                <div className="w-full max-w-md h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-brand-accent shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-full transition-all"
                  />
                </div>
                <p className="text-[10px] font-black text-brand-accent mt-6 uppercase tracking-widest">
                  {uploadProgress}% Concluído
                </p>
              </motion.div>
            ) : (
              <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 glass-item border-white/10 text-brand-emerald rounded-xl flex items-center justify-center shadow-xl shrink-0">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-3">
                      <div>
                        <h3 className="text-xl font-bold tracking-tight text-white">{selectedProject.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-semibold uppercase tracking-widest">
                          <span className="text-slate-500">{selectedProject.author}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <span className="text-brand-accent">{selectedProject.category}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <span className="text-slate-500">{selectedProject.date}</span>
                        </div>
                      </div>
                      <p className="text-base leading-relaxed text-slate-300 max-w-5xl">{selectedProject.summary}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <div className="flex flex-row gap-2 flex-wrap">
                    <button onClick={() => setIsEditOpen(true)} className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs uppercase tracking-widest border border-white/10 shadow hover:bg-white/20 transition">
                      Editar Relatório
                    </button>
                    <button onClick={() => {
                      setIsFileUploading(true);
                      setTimeout(() => {
                        setIsFileUploading(false);
                        setToastMessage({text: '✅ Documento anexado com sucesso!', type: 'success'});
                      }, 1500);
                    }} disabled={isFileUploading} className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs uppercase tracking-widest border border-white/10 shadow hover:bg-white/20 transition disabled:opacity-70">
                      {isFileUploading ? 'Anexando...' : 'Anexar Documento'}
                    </button>
                    <button onClick={() => setIsMovingFolder(true)} className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs uppercase tracking-widest border border-white/10 shadow hover:bg-white/20 transition">
                      Mover para Pasta
                    </button>
                    <button onClick={() => {
                      setIsGeneratingSummary(true);
                      setTimeout(() => {
                        setIsGeneratingSummary(false);
                        setToastMessage({text: '✅ Resumo IA gerado! (5 parágrafos)', type: 'success'});
                      }, 2000);
                    }} disabled={isGeneratingSummary} className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs uppercase tracking-widest border border-white/10 shadow hover:bg-white/20 transition disabled:opacity-70">
                      {isGeneratingSummary ? 'Gerando...' : 'Gerar Resumo IA'}
                    </button>
                  </div>
                </div>

                <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-white/5 bg-brand-surface/40 p-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Análise de Compatibilidade</p>
                      <div className="flex items-center gap-5">
                        <div className="relative w-36 h-36 shrink-0">
                          <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                            <circle cx="100" cy="100" r="82" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                            <motion.circle
                              initial={{ strokeDashoffset: 515 }}
                              animate={{ strokeDashoffset: 515 - (515 * selectedProject.compatibility) / 100 }}
                              cx="100"
                              cy="100"
                              r="82"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="transparent"
                              strokeDasharray={515}
                              className={cn(
                                'transition-all duration-1000 shadow-[0_0_20px_currentColor]',
                                selectedProject.compatibility < 30 ? 'text-brand-rose' :
                                selectedProject.compatibility < 70 ? 'text-brand-amber' :
                                'text-brand-emerald'
                              )}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-white tracking-tight">{selectedProject.compatibility}%</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Ideológico</span>
                          </div>
                        </div>
                        <div className="space-y-3 min-w-0">
                          <p className="text-sm font-semibold text-white">Compatibilidade do projeto com a linha estratégica do mandato.</p>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            {selectedProject.compatibility}% alinhado com sua ideologia política e narrativa pública.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="flex items-center gap-2 px-3 py-2 rounded-xl border border-brand-emerald/20 bg-brand-emerald/5 text-[10px] font-black uppercase tracking-widest text-brand-emerald">
                              <CheckCircle2 className="w-4 h-4" />
                              Pauta Popular
                            </span>
                            <span className="flex items-center gap-2 px-3 py-2 rounded-xl border border-brand-accent/20 bg-brand-accent/5 text-[10px] font-black uppercase tracking-widest text-brand-accent">
                              <Zap className="w-4 h-4" />
                              Impacto Fiscal
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={cn('rounded-xl border p-4', riskSummary.surface)}>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Termômetro de Riscos</p>
                      <div className="flex items-start gap-3 mb-4">
                        <div className={cn('p-3 rounded-xl bg-white/5 border border-white/10', riskSummary.tone)}>
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-white">Risco {riskSummary.level}</p>
                          <p className="text-sm text-slate-400 leading-relaxed">{riskSummary.note}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { type: 'Fiscal', risk: 'Aumento de gastos sem fonte de custeio clara.', level: 'Alto', icon: AlertTriangle },
                          { type: 'Político', risk: 'Pode gerar desgaste com a base conservadora.', level: 'Médio', icon: ShieldAlert },
                          { type: 'Jurídico', risk: 'Possível vício de iniciativa legislativa.', level: 'Baixo', icon: AlertTriangle },
                          { type: 'Eleitoral', risk: 'Oposição pode explorar a pauta como aumento de impostos.', level: 'Crítico', icon: XCircle },
                        ].map((alert, i) => (
                          <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-white/5 text-slate-300">
                              <alert.icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{alert.type}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-white/10 text-slate-300">
                                  {alert.level}
                                </span>
                              </div>
                              <p className="text-sm text-slate-300 leading-relaxed">{alert.risk}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Sugestões de Argumentação</p>
                  <div className="space-y-3">
                    {suggestionPoints.map((point) => (
                      <div key={point} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="mt-0.5 w-2 h-2 rounded-full bg-brand-accent shadow-[0_0_10px_rgba(99,102,241,0.4)]" />
                        <p className="text-sm text-slate-300 leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={() => {
                      setIsGeneratingAmendment(true);
                      setTimeout(() => {
                        setIsGeneratingAmendment(false);
                        setToastMessage({text: '✅ Emenda legislativa gerada e pronta para edição!', type: 'success'});
                      }, 2500);
                    }} disabled={isGeneratingAmendment} className="w-full py-4 bg-brand-accent text-white rounded-xl font-black text-sm hover:bg-brand-accent/90 transition-all shadow-2xl shadow-brand-accent/20 flex items-center justify-center gap-3 group disabled:opacity-70">
                      {isGeneratingAmendment ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Edit2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                          Gerar Emenda Legislativa
                        </>
                      )}
                    </button>
                    <button onClick={() => {
                      setToastMessage({text: '✅ Parecer de bancada criado com sucesso!', type: 'success'});
                    }} className="w-full py-4 glass-item border-white/10 text-white rounded-xl font-black text-sm hover:bg-white/5 transition-all flex items-center justify-center gap-3">
                      <FileText className="w-4 h-4 text-brand-emerald" />
                      Criar Parecer de Bancada
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="glass-card p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-white">Projetos Recentes</h3>
            <div className="flex gap-3 w-full lg:w-auto">
              <div className="flex-1 lg:w-80 px-4 py-2.5 glass-item rounded-xl flex items-center gap-2 border-white/5 focus-within:border-brand-accent/30 transition-all">
                <Search className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar PL..."
                  className="bg-transparent border-none outline-none text-sm font-medium w-full text-white placeholder:text-slate-600"
                />
              </div>
              <button className="p-2.5 glass-item rounded-xl text-slate-500 hover:text-brand-emerald border-white/5 transition-all">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
            {MOCK_PROJECTS.map((project) => (
              <motion.div
                key={project.id}
                whileHover={{ y: -2 }}
                onClick={() => setSelectedProject(project)}
                className={cn(
                  'p-4 glass-card border-white/5 rounded-xl transition-all cursor-pointer group relative overflow-hidden',
                  selectedProject.id === project.id
                    ? 'bg-brand-accent/10 border-brand-accent/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                    : 'hover:bg-white/5'
                )}
              >
                {selectedProject.id === project.id && (
                  <motion.div layoutId="active-indicator-project" className="absolute left-0 top-4 bottom-4 w-1 bg-brand-accent rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                )}

                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border shrink-0',
                    project.compatibility < 30 ? 'bg-brand-rose/20 text-brand-rose border-brand-rose/30' :
                    project.compatibility < 70 ? 'bg-brand-amber/20 text-brand-amber border-brand-amber/30' :
                    'bg-brand-emerald/20 text-brand-emerald border-brand-emerald/30'
                  )}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <p className="font-black text-white text-sm leading-tight line-clamp-2">{project.title}</p>
                      <span className={cn(
                        'px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-full border shrink-0',
                        project.status === 'Aprovado' ? 'bg-brand-emerald/20 text-brand-emerald border-brand-emerald/30' :
                        project.status === 'Em Análise' ? 'bg-brand-amber/20 text-brand-amber border-brand-amber/30' :
                        'bg-rose-500/20 text-rose-300 border-rose-400'
                      )}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{project.author}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{project.date}</span>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-brand-emerald" />
                        <span className="text-[10px] font-bold text-brand-emerald uppercase tracking-widest">{project.compatibility}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

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
