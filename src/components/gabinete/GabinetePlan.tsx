import { useState } from 'react';
import {
  CreditCard, Shield, Zap,
  CheckCircle2, Download,
  Star, Landmark, Users,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useTerminologia } from '../../hooks/useTerminologia';

const MOCK_INVOICES = [
  { id: '1', date: '25 Mar, 2024', amount: 'R$ 1.490,00', status: 'Pago', method: 'Cartão •••• 4242' },
  { id: '2', date: '25 Fev, 2024', amount: 'R$ 1.490,00', status: 'Pago', method: 'Cartão •••• 4242' },
  { id: '3', date: '25 Jan, 2024', amount: 'R$ 1.490,00', status: 'Pago', method: 'Cartão •••• 4242' },
];

export function GabinetePlan({ isDarkMode }: { isDarkMode: boolean }) {
  const [activeTab, setActiveTab] = useState('subscription');
  const { termo } = useTerminologia();
  const termoPlural = termo('cidadaos');

  const tabs = [
    { id: 'subscription', label: 'Assinatura', icon: Shield },
    { id: 'billing', label: 'Faturamento', icon: CreditCard },
    { id: 'usage', label: 'Uso', icon: BarChart3 },
  ];

  const includedFeatures = [
    { icon: Zap, title: 'IA Estrategista Ilimitada', desc: 'Análises e recomendações em tempo real para o gabinete.' },
    { icon: Users, title: `Gestão de ${termoPlural}`, desc: `Estrutura para até 50.000 ${termoPlural.toLowerCase()} com segmentação inteligente.` },
    { icon: Landmark, title: 'Arsenal de Embate Avançado', desc: 'Modelos, respostas rápidas e inteligência de posicionamento.' },
  ];

  const usageLimits = [
    { label: termoPlural, current: 12000, limit: 50000 },
    { label: 'Análises de IA', current: 1250, limit: 5000 },
    { label: 'Arsenal', current: 320, limit: 1000 },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto py-8 px-4 xl:px-0 pb-20 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-black tracking-tighter text-white"
          >
            Meu <span className="text-brand-accent drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">Plano</span>
          </motion.h1>
          <p className="text-slate-400 font-medium max-w-2xl">Gestão de assinatura, faturamento e limites do Gabinete Digital.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-start lg:items-end gap-4"
        >
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-accent text-white rounded-xl font-black text-sm hover:bg-brand-accent/90 transition-all shadow-[0_10px_30px_rgba(139,92,246,0.3)]">
              <Zap className="w-4 h-4" />
              Upgrade
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-black text-sm hover:bg-white/10 transition-all">
              Alterar
            </button>
          </div>

          <div className="flex flex-wrap lg:flex-nowrap justify-start lg:justify-end gap-2 p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all duration-300 relative',
                  activeTab === tab.id
                    ? 'bg-brand-emerald text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabPlan"
                    className="absolute inset-0 bg-brand-emerald rounded-xl -z-10"
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'subscription' ? (
          <motion.div
            key="subscription"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-6"
          >
            <div className="w-full rounded-[2.5rem] border border-white/10 bg-slate-900/60 backdrop-blur-xl p-8 lg:p-10 shadow-[0_20px_60px_rgba(2,6,23,0.55)] relative overflow-hidden">
              <div className="absolute -top-24 -right-16 w-64 h-64 bg-brand-accent/10 blur-[90px] rounded-full" />
              <div className="absolute -bottom-28 -left-20 w-72 h-72 bg-brand-emerald/10 blur-[100px] rounded-full" />

              <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
                <div className="space-y-4">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Status da Assinatura</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-white">Plano Mandato Premium</h2>
                    <span className="px-4 py-1.5 rounded-full bg-emerald-400/15 border border-emerald-300/40 text-emerald-300 text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_24px_rgba(52,211,153,0.35)]">Ativa</span>
                  </div>
                  <p className="text-slate-300 font-medium max-w-2xl">Assinatura anual ativa com acesso à camada premium de inteligência, automação e gestão completa de mandato.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full xl:w-auto xl:min-w-[460px]">
                  <div className="rounded-2xl bg-slate-950/55 border border-white/10 p-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Valor</p>
                    <p className="text-3xl font-black text-brand-emerald drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]">R$ 1.490<span className="text-xl text-slate-400 font-bold">/mês</span></p>
                  </div>
                  <div className="rounded-2xl bg-slate-950/55 border border-white/10 p-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Próxima Cobrança</p>
                    <p className="text-2xl font-black text-white">25 Abr, 2024</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-3">
                <button className="flex items-center justify-center gap-3 px-6 py-3 bg-brand-emerald text-white rounded-xl font-black text-sm hover:bg-brand-emerald/90 transition-all shadow-[0_10px_24px_rgba(16,185,129,0.35)]">
                  <Star className="w-4 h-4" />
                  Gerenciar Assinatura
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-black text-sm hover:bg-white/10 transition-all">
                  Alterar Plano
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/45 backdrop-blur-xl p-7 space-y-6">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2">Recursos Inclusos</p>
                  <h3 className="text-2xl font-black text-white tracking-tight">Camada Premium Ativa</h3>
                </div>

                <div className="space-y-4">
                  {includedFeatures.map((feature, i) => (
                    <div key={i} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-emerald/15 border border-brand-emerald/30 text-brand-emerald flex items-center justify-center mt-0.5">
                        <feature.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-black text-white">{feature.title}</p>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-slate-900/45 backdrop-blur-xl p-7 space-y-6">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2">Uso e Limites</p>
                  <h3 className="text-2xl font-black text-white tracking-tight">Consumo do Ciclo Atual</h3>
                </div>

                <div className="space-y-5">
                  {usageLimits.map((limit, i) => {
                    const percentage = (limit.current / limit.limit) * 100;

                    return (
                      <div key={i} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <p className="text-sm font-bold text-slate-200">{limit.label}</p>
                          <p className="text-xs font-black text-brand-emerald">{Math.round(percentage)}%</p>
                        </div>
                        <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.9, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full"
                          />
                        </div>
                        <p className="text-xs font-bold text-slate-400 mt-2">
                          {limit.current.toLocaleString('pt-BR')} / {limit.limit.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="w-full rounded-[2.5rem] border border-white/10 bg-slate-900/60 backdrop-blur-xl p-8 lg:p-10 shadow-[0_20px_60px_rgba(2,6,23,0.5)]">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2">Segurança e Conformidade</p>
                  <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Base segura para operação institucional</h3>
                </div>
                <Shield className="w-10 h-10 text-brand-emerald" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-slate-950/50 border border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-emerald mb-3">Proteção de Dados (LGPD)</p>
                  <p className="text-sm font-bold leading-relaxed text-slate-300">
                    Seus dados eleitorais são criptografados e protegidos conforme a LGPD e normas do TSE.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-950/50 border border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-emerald mb-3">Backup Automático</p>
                  <p className="text-sm font-bold leading-relaxed text-slate-300">
                    Realizamos backups diários de toda a sua base de {termoPlural.toLowerCase()} e projetos legislativos.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400/15 border border-emerald-300/35 text-emerald-200 shadow-[0_0_20px_rgba(52,211,153,0.2)]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-[0.18em]">SSL</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400/15 border border-emerald-300/35 text-emerald-200 shadow-[0_0_20px_rgba(52,211,153,0.2)]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-[0.18em]">2FA</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'billing' ? (
          <motion.div
            key="billing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-12 rounded-[4rem] glass-card border border-white/5 space-y-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-emerald/5 blur-[100px] -mr-48 -mt-48 pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <h3 className="text-xl font-black text-white tracking-tighter">Histórico de Faturamento</h3>
              <button className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 text-[10px] font-black text-brand-emerald uppercase tracking-[0.2em] hover:bg-white/10 transition-all rounded-xl">
                <Download className="w-4 h-4" />
                Baixar Todos (PDF)
              </button>
            </div>

            <div className="overflow-hidden rounded-[3rem] border border-white/5 relative z-10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5">
                    <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Data</th>
                    <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Valor</th>
                    <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                    <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Método</th>
                    <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {MOCK_INVOICES.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-white/10 transition-all group">
                      <td className="p-8">
                        <p className="text-lg font-black text-white group-hover:text-brand-emerald transition-colors">{invoice.date}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Fatura #{invoice.id}2345</p>
                      </td>
                      <td className="p-8 font-black text-xl text-white">{invoice.amount}</td>
                      <td className="p-8">
                        <span className="px-5 py-2 bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                          {invoice.status}
                        </span>
                      </td>
                      <td className="p-8 text-sm font-bold text-slate-400">{invoice.method}</td>
                      <td className="p-8 text-right">
                        <button className="p-4 bg-white/5 text-slate-400 hover:text-brand-emerald rounded-2xl transition-all border border-white/5 hover:bg-white/10">
                          <Download className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="usage"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            {[
              { label: `${termoPlural} Mapeados`, current: 6500, limit: 50000, icon: Users, color: 'brand-emerald' },
              { label: 'Análises de IA', current: 1250, limit: 5000, icon: Zap, color: 'brand-amber' },
              { label: 'Armazenamento PDF', current: 45, limit: 100, icon: Landmark, color: 'brand-accent', unit: 'GB' },
            ].map((limit, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-12 rounded-[4rem] glass-card border border-white/5 space-y-10 shadow-2xl group relative overflow-hidden"
              >
                <div className={cn('absolute top-0 right-0 w-32 h-32 blur-3xl -mr-16 -mt-16 opacity-10', `bg-${limit.color}`)} />

                <div className={cn(
                  'w-20 h-20 rounded-[2rem] flex items-center justify-center border shadow-inner',
                  limit.color === 'brand-emerald' ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20' :
                  limit.color === 'brand-amber' ? 'bg-brand-amber/10 text-brand-amber border-brand-amber/20' :
                  'bg-brand-accent/10 text-brand-accent border-brand-accent/20'
                )}>
                  <limit.icon className="w-10 h-10" />
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{limit.label}</p>
                    <p className={cn('text-lg font-black', `text-${limit.color}`)}>{Math.round((limit.current / limit.limit) * 100)}%</p>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(limit.current / limit.limit) * 100}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className={cn(
                        'h-full rounded-full shadow-[0_0_10px]',
                        limit.color === 'brand-emerald' ? 'bg-brand-emerald shadow-brand-emerald/50' :
                        limit.color === 'brand-amber' ? 'bg-brand-amber shadow-brand-amber/50' :
                        'bg-brand-accent shadow-brand-accent/50'
                      )}
                    />
                  </div>
                  <p className="text-2xl font-black text-white tracking-tighter">
                    {limit.current}{limit.unit || ''} <span className="text-slate-500 font-bold text-lg">/ {limit.limit}{limit.unit || ''}</span>
                  </p>
                </div>
                <button className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                  Aumentar Limite
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
