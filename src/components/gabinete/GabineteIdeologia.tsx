import { useState } from 'react';
import { 
  Shield, Flag, AlertCircle, 
  CheckCircle2, XCircle, Plus, 
  Trash2, Edit2, Info, 
  Target, Zap, Sparkles,
  Lock, Unlock, Save,
  ChevronRight, Landmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const MOCK_FLAGS = [
  { id: '1', title: 'Saúde Pública de Qualidade', type: 'Bandeira', description: 'Foco em redução de filas e novos médicos.' },
  { id: '2', title: 'Segurança no Centro', type: 'Bandeira', description: 'Aumento do policiamento e iluminação.' },
  { id: '3', title: 'Educação Infantil', type: 'Bandeira', description: 'Vagas em creches e valorização de professores.' },
];

const MOCK_RED_LINES = [
  { id: '1', title: 'Aumento de Impostos', type: 'Linha Vermelha', description: 'Voto contrário a qualquer nova taxa ou aumento de IPTU.' },
  { id: '2', title: 'Privatização da Saúde', type: 'Linha Vermelha', description: 'Defesa do SUS e contra a gestão privada de hospitais públicos.' },
  { id: '3', title: 'Cortes na Educação', type: 'Linha Vermelha', description: 'Inadmissível qualquer redução de verba para o ensino básico.' },
];

export function GabineteIdeologia({ isDarkMode }: { isDarkMode: boolean }) {
  const [flags, setFlags] = useState(MOCK_FLAGS);
  const [redLines, setRedLines] = useState(MOCK_RED_LINES);
  const [isEditing, setIsEditing] = useState(false);

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
            Núcleo <span className="text-brand-accent drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">Ideológico</span>
          </motion.h1>
          <p className="text-slate-400 font-medium max-w-2xl">
            Configure as diretrizes mestras do seu mandato. A inteligência artificial utiliza este núcleo para filtrar, priorizar e analisar cada projeto ou demanda que chega ao gabinete.
          </p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex gap-4"
        >
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300",
              isEditing 
                ? "bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
            )}
          >
            {isEditing ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
            {isEditing ? "Salvar Diretrizes" : "Editar Núcleo"}
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Bandeiras do Mandato */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-emerald/10 text-brand-emerald rounded-2xl flex items-center justify-center border border-brand-emerald/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <Flag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">Bandeiras</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Prioridades Estratégicas</p>
              </div>
            </div>
            {isEditing && (
              <button className="p-3 bg-brand-emerald/10 text-brand-emerald rounded-xl hover:bg-brand-emerald/20 transition-all border border-brand-emerald/20">
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {flags.map((flag, index) => (
              <motion.div 
                key={flag.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 rounded-[2.5rem] border border-white/5 hover:border-brand-emerald/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-emerald/5 blur-3xl -mr-16 -mt-16 group-hover:bg-brand-emerald/10 transition-colors" />
                
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-brand-emerald rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black text-brand-emerald uppercase tracking-widest">{flag.type}</span>
                  </div>
                  {isEditing && (
                    <button className="p-2 text-slate-500 hover:text-brand-rose transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <h4 className="text-xl font-black text-white mb-3 relative z-10">{flag.title}</h4>
                <p className="text-sm font-medium text-slate-400 leading-relaxed relative z-10">{flag.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Linhas Vermelhas */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-rose/10 text-brand-rose rounded-2xl flex items-center justify-center border border-brand-rose/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">Linhas Vermelhas</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Limites Inegociáveis</p>
              </div>
            </div>
            {isEditing && (
              <button className="p-3 bg-brand-rose/10 text-brand-rose rounded-xl hover:bg-brand-rose/20 transition-all border border-brand-rose/20">
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {redLines.map((line, index) => (
              <motion.div 
                key={line.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 rounded-[2.5rem] border border-white/5 hover:border-brand-rose/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-rose/5 blur-3xl -mr-16 -mt-16 group-hover:bg-brand-rose/10 transition-colors" />
                
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-brand-rose rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                    <span className="text-[10px] font-black text-brand-rose uppercase tracking-widest">{line.type}</span>
                  </div>
                  {isEditing && (
                    <button className="p-2 text-slate-500 hover:text-brand-rose transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <h4 className="text-xl font-black text-white mb-3 relative z-10">{line.title}</h4>
                <p className="text-sm font-medium text-slate-400 leading-relaxed relative z-10">{line.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Intelligence Card */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-12 rounded-[4rem] border border-brand-accent/30 relative overflow-hidden bg-gradient-to-br from-brand-accent/20 via-slate-900 to-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Sparkles className="w-64 h-64 text-brand-accent" />
        </div>
        
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-accent/10 blur-[100px] rounded-full" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-brand-accent/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-brand-accent/30 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                <Zap className="w-8 h-8 text-brand-accent" />
              </div>
              <div>
                <h3 className="text-4xl font-black tracking-tighter text-white">Inteligência de Filtragem</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-brand-emerald rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-brand-emerald uppercase tracking-widest">Sistema Ativo</span>
                </div>
              </div>
            </div>
            <p className="text-xl font-medium text-slate-300 leading-relaxed">
              Com base nestas diretrizes, a IA classifica automaticamente todos os Projetos de Lei e Demandas de Cidadãos, garantindo que o mandato mantenha sua coerência ideológica.
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-brand-emerald" />
                <span className="text-xs font-black uppercase tracking-widest text-white">Alinhamento Automático</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <AlertCircle className="w-5 h-5 text-brand-amber" />
                <span className="text-xs font-black uppercase tracking-widest text-white">Alerta de Conflito</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center group hover:border-brand-accent/30 transition-all">
              <p className="text-5xl font-black mb-2 text-white group-hover:text-brand-accent transition-colors">100%</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Precisão de Filtro</p>
            </div>
            <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center group hover:border-brand-accent/30 transition-all">
              <p className="text-5xl font-black mb-2 text-white group-hover:text-brand-accent transition-colors">24h</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Monitoramento</p>
            </div>
            <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center group hover:border-brand-accent/30 transition-all">
              <p className="text-5xl font-black mb-2 text-white group-hover:text-brand-accent transition-colors">Zero</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ruído Político</p>
            </div>
            <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center group hover:border-brand-accent/30 transition-all">
              <p className="text-5xl font-black mb-2 text-white group-hover:text-brand-accent transition-colors">IA</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Estratégica</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
