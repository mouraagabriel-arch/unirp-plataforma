import { Lightbulb, Sparkles, ShieldAlert, BarChart3, Megaphone, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

interface EnterpriseHelpProps {
  isDarkMode: boolean;
}

const PROMPT_TIPS = [
  {
    title: 'Gerar uma nota de crise perfeita',
    icon: ShieldAlert,
    prompt: 'Com base neste cenário de crise, gere uma nota oficial institucional com tom firme, sem confronto pessoal, incluindo 3 mensagens-chave e um fechamento com compromisso público.',
  },
  {
    title: 'Analisar sentimento do mês',
    icon: BarChart3,
    prompt: 'Analise o clipping do mês, classifique em positivo/neutro/negativo, explique a narrativa dominante e proponha 5 ações para elevar reputação no próximo ciclo.',
  },
  {
    title: 'Criar comunicado interno claro',
    icon: Megaphone,
    prompt: 'Transforme esta pauta em comunicado interno objetivo, com contexto, orientação prática para equipes e checklist de execução em até 7 itens.',
  },
  {
    title: 'Refinar texto para imprensa',
    icon: MessageSquare,
    prompt: 'Reescreva este texto para formato de release, com lead jornalístico, dados verificáveis e linguagem institucional sem adjetivos excessivos.',
  },
];

export function EnterpriseHelp({ isDarkMode }: EnterpriseHelpProps) {
  return (
    <section className="w-full max-w-6xl mx-auto py-8 text-slate-100 space-y-6">
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 md:p-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Ajuda & Suporte</h1>
            <p className="text-sm text-slate-400">Dicas de prompts para extrair o máximo da IA no dia a dia.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 font-semibold">
          Regra de ouro: quanto mais contexto real do seu cenário, melhor a resposta da IA.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROMPT_TIPS.map((tip, index) => (
          <motion.article
            key={tip.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 space-y-3"
          >
            <div className="flex items-center gap-2">
              <tip.icon className="w-4 h-4 text-brand-accent" />
              <h2 className="text-sm font-black text-white">{tip.title}</h2>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-200 leading-relaxed">{tip.prompt}</p>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-brand-accent" />
        <p className="text-sm text-slate-300">Se quiser, posso transformar qualquer pauta sua em um prompt pronto para crise, release, social ou briefing interno.</p>
      </div>

      <span className="sr-only">Tema atual: {isDarkMode ? 'escuro' : 'claro'}</span>
    </section>
  );
}
