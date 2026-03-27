import { useState } from 'react';
import { 
  FileText, Upload, Search, Filter, 
  Sparkles, Loader2, AlertTriangle, 
  CheckCircle2, XCircle, ChevronRight,
  Download, Trash2, Edit2, Plus,
  Activity, Zap, ShieldAlert, Landmark
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
    summary: 'Institui a taxa de coleta de resíduos sólidos domiciliares no município.'
  },
  { 
    id: '2', 
    title: 'PL 122/2024 - Incentivo ao Esporte', 
    author: 'Ver. Ricardo Silva', 
    status: 'Aprovado', 
    compatibility: 85, 
    date: '24 Mar, 2024',
    category: 'Social',
    summary: 'Cria o programa municipal de incentivo ao esporte amador e bolsas para atletas.'
  },
  { 
    id: '3', 
    title: 'PL 110/2024 - Reforma da Praça Central', 
    author: 'Ver. Ana Paula', 
    status: 'Em Análise', 
    compatibility: 60, 
    date: '22 Mar, 2024',
    category: 'Infraestrutura',
    summary: 'Autoriza o repasse de verbas para a revitalização completa da Praça da Matriz.'
  },
];

export function GabineteProjetos({ isDarkMode }: { isDarkMode: boolean }) {
  const [selectedProject, setSelectedProject] = useState(MOCK_PROJECTS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const simulateAnalysis = () => {
    setIsAnalyzing(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsAnalyzing(false), 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-6xl font-black tracking-tighter text-white">
            Análise de <span className="text-brand-emerald shadow-[0_0_20px_rgba(16,185,129,0.3)]">Projetos</span>
          </h1>
          <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-widest">Inteligência legislativa e termômetro de compatibilidade ideológica.</p>
        </div>
        
        <button 
          onClick={simulateAnalysis}
          className="flex items-center gap-4 px-10 py-5 bg-brand-accent text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-2xl shadow-brand-accent/20 group"
        >
          <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          Subir Novo Projeto (PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Lista de Projetos */}
        <div className="lg:col-span-1 glass-card p-10 flex flex-col h-fit space-y-10">
          <div className="space-y-8">
            <h3 className="text-3xl font-black tracking-tighter text-white">Projetos Recentes</h3>
            <div className="flex gap-4">
              <div className="flex-1 px-6 py-4 glass-item flex items-center gap-3 border-white/5 focus-within:border-brand-accent/30 transition-all">
                <Search className="w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Buscar PL..." 
                  className="bg-transparent border-none outline-none text-sm font-bold w-full text-white placeholder:text-slate-600" 
                />
              </div>
              <button className="p-4 glass-item text-slate-500 hover:text-brand-emerald border-white/5 transition-all">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {MOCK_PROJECTS.map((project) => (
              <motion.div 
                key={project.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedProject(project)}
                className={cn(
                  "p-8 glass-card border-white/5 transition-all cursor-pointer group relative overflow-hidden",
                  selectedProject.id === project.id 
                    ? "bg-brand-accent/10 border-brand-accent/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]" 
                    : "hover:bg-white/5"
                )}
              >
                {selectedProject.id === project.id && (
                  <motion.div layoutId="active-indicator-project" className="absolute left-0 top-8 bottom-8 w-1 bg-brand-accent rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                )}
                
                <div className="flex items-start gap-6">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border",
                    project.compatibility < 30 ? "bg-brand-rose/20 text-brand-rose border-brand-rose/30" :
                    project.compatibility < 70 ? "bg-brand-amber/20 text-brand-amber border-brand-amber/30" :
                    "bg-brand-emerald/20 text-brand-emerald border-brand-emerald/30"
                  )}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-lg truncate leading-none">{project.title}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{project.author}</p>
                    <div className="flex items-center justify-between mt-6">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{project.date}</span>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-brand-emerald" />
                        <span className="text-[10px] font-black text-brand-emerald uppercase tracking-widest">{project.compatibility}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Análise Detalhada */}
        <div className="lg:col-span-2 glass-card p-12 relative overflow-hidden min-h-[800px]">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 bg-brand-bg/90 backdrop-blur-2xl flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-32 h-32 bg-brand-accent text-white rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.4)] animate-pulse mb-10">
                  <Sparkles className="w-16 h-16" />
                </div>
                <h3 className="text-5xl font-black text-white tracking-tighter mb-4">IA Analisando Projeto...</h3>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest max-w-md mb-12">Cruzando pauta legislativa com o núcleo ideológico do mandato.</p>
                <div className="w-full max-w-md h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-brand-accent shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-full transition-all"
                  />
                </div>
                <p className="text-[10px] font-black text-brand-accent mt-6 uppercase tracking-widest">{uploadProgress}% Concluído</p>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-12"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 glass-item border-white/10 text-brand-emerald rounded-[2rem] flex items-center justify-center shadow-2xl">
                      <Landmark className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-4xl font-black tracking-tighter text-white">{selectedProject.title}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedProject.author}</span>
                        <span className="w-1 h-1 bg-slate-700 rounded-full" />
                        <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">{selectedProject.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="p-5 glass-item text-slate-400 hover:text-brand-emerald rounded-2xl transition-all border-white/5 shadow-xl">
                      <Download className="w-6 h-6" />
                    </button>
                    <button className="p-5 glass-item text-slate-400 hover:text-brand-rose rounded-2xl transition-all border-white/5 shadow-xl">
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Termômetro de Compatibilidade */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="md:col-span-1 p-10 glass-item border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center bg-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Termômetro de Compatibilidade</p>
                    <div className="relative w-48 h-48 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                        <motion.circle 
                          initial={{ strokeDashoffset: 528 }}
                          animate={{ strokeDashoffset: 528 - (528 * selectedProject.compatibility) / 100 }}
                          cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="12" fill="transparent" 
                          strokeDasharray={528}
                          className={cn(
                            "transition-all duration-1000 shadow-[0_0_20px_currentColor]",
                            selectedProject.compatibility < 30 ? "text-brand-rose" :
                            selectedProject.compatibility < 70 ? "text-brand-amber" :
                            "text-brand-emerald"
                          )}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black text-white tracking-tighter">{selectedProject.compatibility}%</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Ideológico</span>
                      </div>
                    </div>
                    <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                      {selectedProject.compatibility}% alinhado com sua ideologia política
                    </p>
                  </div>

                  <div className="md:col-span-2 p-10 glass-item border-white/5 rounded-[3rem] space-y-8 bg-white/5">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand-accent" />
                      Resumo Executivo da IA
                    </h4>
                    <p className="text-2xl font-medium leading-relaxed text-slate-300 italic">
                      "{selectedProject.summary}"
                    </p>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-3 px-5 py-3 glass-card border-brand-emerald/30 bg-brand-emerald/5 text-brand-emerald rounded-2xl text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle2 className="w-4 h-4" />
                        Pauta Popular
                      </div>
                      <div className="flex items-center gap-3 px-5 py-3 glass-card border-brand-accent/30 bg-brand-accent/5 text-brand-accent rounded-2xl text-[10px] font-black uppercase tracking-widest">
                        <Zap className="w-4 h-4" />
                        Impacto Fiscal
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alertas de Ruído */}
                <div className="space-y-8">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-brand-rose" />
                    Alertas de Ruído (Riscos e Armadilhas)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { type: 'Fiscal', risk: 'Aumento de gastos sem fonte de custeio clara.', level: 'Alto', icon: AlertTriangle, color: 'brand-rose' },
                      { type: 'Político', risk: 'Pode gerar desgaste com a base conservadora.', level: 'Médio', icon: ShieldAlert, color: 'brand-amber' },
                      { type: 'Jurídico', risk: 'Possível vício de iniciativa legislativa.', level: 'Baixo', icon: AlertTriangle, color: 'brand-emerald' },
                      { type: 'Eleitoral', risk: 'Oposição pode usar como pauta de "aumento de impostos".', level: 'Crítico', icon: XCircle, color: 'brand-rose' },
                    ].map((alert, i) => (
                      <div key={i} className="p-8 glass-item border-white/5 rounded-[2.5rem] flex items-start gap-6 hover:border-white/10 transition-all group bg-white/5">
                        <div className={cn(
                          "p-4 rounded-2xl shadow-lg",
                          alert.level === 'Crítico' ? "bg-brand-rose/20 text-brand-rose" :
                          alert.level === 'Alto' ? "bg-brand-rose/20 text-brand-rose" :
                          alert.level === 'Médio' ? "bg-brand-amber/20 text-brand-amber" :
                          "bg-brand-emerald/20 text-brand-emerald"
                        )}>
                          <alert.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{alert.type}</span>
                            <span className={cn(
                              "text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest",
                              alert.level === 'Crítico' ? "bg-brand-rose text-white" : "bg-white/10 text-slate-400"
                            )}>{alert.level}</span>
                          </div>
                          <p className="text-sm font-bold text-slate-300 leading-relaxed">{alert.risk}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-6 pt-6">
                  <button className="flex-1 py-6 bg-brand-accent text-white rounded-3xl font-black text-lg hover:scale-[1.02] transition-all shadow-2xl shadow-brand-accent/20 flex items-center justify-center gap-4 group">
                    <Edit2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    Gerar Emenda Legislativa
                  </button>
                  <button className="flex-1 py-6 glass-item border-white/10 text-white rounded-3xl font-black text-lg hover:bg-white/5 transition-all flex items-center justify-center gap-4">
                    <FileText className="w-6 h-6 text-brand-emerald" />
                    Criar Parecer de Bancada
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
