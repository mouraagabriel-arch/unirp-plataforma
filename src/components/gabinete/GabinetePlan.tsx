import { useState } from 'react';
import { 
  CreditCard, Shield, Zap, 
  CheckCircle2, AlertCircle, 
  ArrowRight, Download, History, 
  Plus, Star, Landmark, Users,
  Activity, BarChart3, Clock,
  ChevronRight, Landmark as LandmarkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const MOCK_INVOICES = [
  { id: '1', date: '25 Mar, 2024', amount: 'R$ 1.490,00', status: 'Pago', method: 'Cartão •••• 4242' },
  { id: '2', date: '25 Fev, 2024', amount: 'R$ 1.490,00', status: 'Pago', method: 'Cartão •••• 4242' },
  { id: '3', date: '25 Jan, 2024', amount: 'R$ 1.490,00', status: 'Pago', method: 'Cartão •••• 4242' },
];

export function GabinetePlan({ isDarkMode }: { isDarkMode: boolean }) {
  const [activeTab, setActiveTab] = useState('subscription');

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl font-black tracking-tighter text-white"
          >
            Meu <span className="text-brand-emerald drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">Plano</span>
          </motion.h1>
          <p className="text-slate-400 font-medium max-w-2xl">Gestão de assinatura, faturamento e limites do Gabinete Digital.</p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex gap-4"
        >
          <button className="flex items-center gap-3 px-10 py-5 bg-brand-emerald text-white rounded-2xl font-black text-lg hover:bg-brand-emerald/90 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)]">
            <Zap className="w-6 h-6" />
            Upgrade de Plano
          </button>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 p-2 bg-white/5 backdrop-blur-xl rounded-[2.5rem] w-fit border border-white/10">
        {[
          { id: 'subscription', label: 'Assinatura', icon: Shield },
          { id: 'billing', label: 'Faturamento', icon: CreditCard },
          { id: 'usage', label: 'Uso e Limites', icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-3 px-8 py-4 rounded-[1.8rem] font-black text-sm transition-all duration-300 relative",
              activeTab === tab.id 
                ? "bg-brand-emerald text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTabPlan"
                className="absolute inset-0 bg-brand-emerald rounded-[1.8rem] -z-10"
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'subscription' ? (
          <motion.div 
            key="subscription"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-12"
          >
            {/* Current Plan */}
            <div className="lg:col-span-2 p-12 rounded-[4rem] glass-card border border-white/5 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <LandmarkIcon className="w-96 h-96 text-white" />
              </div>
              
              <div className="relative z-10 space-y-12">
                <div className="flex items-center gap-8">
                  <div className="w-24 h-24 bg-brand-emerald/10 text-brand-emerald rounded-[2.5rem] flex items-center justify-center border border-brand-emerald/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <Star className="w-12 h-12" />
                  </div>
                  <div>
                    <h3 className="text-5xl font-black tracking-tighter text-white">Plano Mandato <span className="text-brand-emerald">Premium</span></h3>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Assinatura Anual Ativa</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Recursos Inclusos</h4>
                    <div className="space-y-4">
                      {[
                        'IA Estrategista Ilimitada',
                        'Gestão de 50.000 Cidadãos',
                        'Arsenal de Embate Avançado',
                        'Análise de Projetos (PDF)',
                        'Hub de Conteúdo Multi-Plataforma',
                        'Suporte Prioritário 24/7'
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 glass-item border-white/5 rounded-2xl group hover:bg-white/10 transition-all">
                          <CheckCircle2 className="w-5 h-5 text-brand-emerald group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-bold text-slate-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-emerald/5 blur-3xl -mr-16 -mt-16" />
                    <div className="relative z-10">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Próxima Cobrança</p>
                      <p className="text-4xl font-black text-white tracking-tighter">25 Abr, 2024</p>
                    </div>
                    <div className="pt-10 border-t border-white/10 relative z-10">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Valor da Assinatura</p>
                      <p className="text-5xl font-black text-brand-emerald drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">R$ 1.490<span className="text-xl text-slate-500 font-bold">/mês</span></p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6">
                  <button className="flex-1 py-6 bg-brand-emerald text-white rounded-[2rem] font-black text-xl hover:bg-brand-emerald/90 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-4">
                    Gerenciar Assinatura
                  </button>
                  <button className="px-12 py-6 bg-white/5 border-2 border-white/10 text-white rounded-[2rem] font-black text-xl hover:bg-white/10 transition-all">
                    Alterar Plano
                  </button>
                </div>
              </div>
            </div>

            {/* Security/Trust */}
            <div className="lg:col-span-1 p-12 rounded-[3.5rem] glass-card border border-white/5 space-y-10 bg-slate-900/50 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-emerald/5 blur-[80px] rounded-full" />
              
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-16 h-16 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                  <Shield className="w-8 h-8 text-brand-emerald" />
                </div>
                <h3 className="text-3xl font-black text-white tracking-tight">Segurança</h3>
              </div>
              
              <div className="space-y-6 relative z-10">
                <div className="p-8 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all group">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-emerald mb-3">Proteção de Dados</p>
                  <p className="text-base font-bold leading-relaxed text-slate-300">
                    Seus dados eleitorais são criptografados e protegidos conforme a LGPD e normas do TSE.
                  </p>
                </div>
                <div className="p-8 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all group">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-emerald mb-3">Backup Automático</p>
                  <p className="text-base font-bold leading-relaxed text-slate-300">
                    Realizamos backups diários de toda a sua base de cidadãos e projetos legislativos.
                  </p>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10 relative z-10 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-brand-emerald/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
                  </div>
                  <span className="text-sm font-black text-white uppercase tracking-widest">Conexão Segura SSL</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-brand-emerald/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
                  </div>
                  <span className="text-sm font-black text-white uppercase tracking-widest">Autenticação 2FA</span>
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
              <h3 className="text-4xl font-black text-white tracking-tighter">Histórico de Faturamento</h3>
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
              { label: 'Cidadãos Mapeados', current: 6500, limit: 50000, icon: Users, color: 'brand-emerald' },
              { label: 'Análises de IA', current: 1250, limit: 5000, icon: Zap, color: 'brand-amber' },
              { label: 'Armazenamento PDF', current: 45, limit: 100, icon: Landmark, color: 'brand-accent', unit: 'GB' },
            ].map((limit, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -10 }}
                className="p-12 rounded-[4rem] glass-card border border-white/5 space-y-10 shadow-2xl group relative overflow-hidden"
              >
                <div className={cn("absolute top-0 right-0 w-32 h-32 blur-3xl -mr-16 -mt-16 opacity-10", `bg-${limit.color}`)} />
                
                <div className={cn(
                  "w-20 h-20 rounded-[2rem] flex items-center justify-center border shadow-inner",
                  limit.color === 'brand-emerald' ? "bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20" :
                  limit.color === 'brand-amber' ? "bg-brand-amber/10 text-brand-amber border-brand-amber/20" :
                  "bg-brand-accent/10 text-brand-accent border-brand-accent/20"
                )}>
                  <limit.icon className="w-10 h-10" />
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{limit.label}</p>
                    <p className={cn("text-lg font-black", `text-${limit.color}`)}>{Math.round((limit.current / limit.limit) * 100)}%</p>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(limit.current / limit.limit) * 100}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full shadow-[0_0_10px]",
                        limit.color === 'brand-emerald' ? "bg-brand-emerald shadow-brand-emerald/50" :
                        limit.color === 'brand-amber' ? "bg-brand-amber shadow-brand-amber/50" :
                        "bg-brand-accent shadow-brand-accent/50"
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
