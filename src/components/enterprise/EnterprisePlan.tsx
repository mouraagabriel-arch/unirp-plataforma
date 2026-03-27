import { useState } from 'react';
import { 
  CreditCard, Shield, Zap, CheckCircle2, 
  Clock, Download, ArrowUpRight, 
  TrendingUp, Activity, Users, Globe,
  MoreVertical, Edit2, Trash2, X,
  FileText, History, Star, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export function EnterprisePlan({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">
            Meu <span className="text-blue-600">Plano</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Gestão de assinatura, faturamento e recursos.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <ArrowUpRight className="w-5 h-5" />
            Fazer Upgrade
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Plan Card */}
        <div className={cn(
          "lg:col-span-2 p-12 rounded-[4rem] shadow-2xl border relative overflow-hidden",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
        )}>
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <Zap className="w-64 h-64 text-blue-600" />
          </div>
          
          <div className="relative z-10 space-y-12">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest">Plano Atual</span>
                <h2 className="text-5xl font-black tracking-tighter mt-4">Enterprise <span className="text-blue-600">Premium</span></h2>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Próxima Fatura</p>
                <p className="text-3xl font-black">R$ 4.990,00</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vencimento: 10 Abr, 2024</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Usuários', value: '12 / 20', progress: 60, icon: Users },
                { label: 'Armazenamento', value: '45GB / 100GB', progress: 45, icon: Activity },
                { label: 'Transcrição IA', value: '850min / 2000min', progress: 42, icon: Zap },
              ].map((stat, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <stat.icon className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <span className="text-xs font-black">{stat.value}</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.progress}%` }}
                      className="h-full bg-blue-600 rounded-full transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-black">Segurança Avançada Ativa</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Criptografia de Ponta a Ponta</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-black">Suporte VIP 24/7</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tempo de Resposta: 15min</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Billing History Sidebar */}
        <div className={cn(
          "p-10 rounded-[3rem] shadow-xl border",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
        )}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black">Histórico</h3>
            <button className="p-3 hover:bg-slate-100 rounded-xl transition-all">
              <History className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-6">
            {[
              { id: 'INV-001', date: '10 Mar, 2024', amount: 'R$ 4.990,00', status: 'pago' },
              { id: 'INV-002', date: '10 Fev, 2024', amount: 'R$ 4.990,00', status: 'pago' },
              { id: 'INV-003', date: '10 Jan, 2024', amount: 'R$ 4.990,00', status: 'pago' },
              { id: 'INV-004', date: '10 Dez, 2023', amount: 'R$ 4.990,00', status: 'pago' },
            ].map((invoice, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all group cursor-pointer">
                <div>
                  <p className="font-black text-sm">{invoice.amount}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{invoice.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {invoice.status}
                  </span>
                  <button className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 group-hover:text-blue-600">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
            <p className="text-xs font-bold text-amber-900 leading-relaxed">
              Sua conta atingirá o limite de usuários em breve. Considere o upgrade para o plano <span className="font-black">Unlimited</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Method Section */}
      <div className={cn(
        "p-10 rounded-[3rem] shadow-xl border",
        isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
      )}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-400">
              <CreditCard className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-black">Método de Pagamento</h3>
              <p className="text-slate-500 font-medium">Cartão de Crédito Corporativo final 4421</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expira em 12/2026</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">
              Alterar Cartão
            </button>
            <button className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all">
              Remover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
