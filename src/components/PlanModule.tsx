import { useState } from 'react';
import { 
  Target, Search, Plus, Edit2, 
  Trash2, Save, X, FileText, 
  Clock, CheckCircle2, AlertCircle,
  ChevronRight, User, Calendar,
  MoreVertical, Filter, Download, Upload,
  Zap, Shield, Activity, TrendingUp,
  Landmark, Building2, Globe, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function PlanModule({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter">
            Meu <span className="text-brand-accent">Plano</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Gestão de assinatura, recursos e limites do sistema.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 px-6 py-4 bg-brand-accent text-white rounded-2xl font-bold hover:bg-brand-accent/90 transition-all shadow-lg shadow-blue-500/20">
            <Zap className="w-5 h-5 text-amber-400" />
            Upgrade de Plano
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className={cn(
            "p-10 rounded-[3rem] shadow-xl border transition-all",
            isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
          )}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-50 text-brand-accent rounded-2xl flex items-center justify-center font-black text-xl">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black">Plano Enterprise</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assinatura Ativa • Renovação em 12/04/2024</p>
                </div>
              </div>
              <span className="px-4 py-2 bg-emerald-100 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest">
                Ativo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Usuários Disponíveis</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-black">12/25</span>
                  <span className="text-sm font-bold text-brand-accent">48%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full w-[48%] bg-brand-accent" />
                </div>
              </div>
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Armazenamento (IA)</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-black">4.2GB/10GB</span>
                  <span className="text-sm font-bold text-brand-accent">42%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full w-[42%] bg-brand-accent" />
                </div>
              </div>
            </div>
          </div>

          <div className={cn(
            "p-10 rounded-[3rem] shadow-xl border transition-all",
            isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"
          )}>
            <h3 className="text-2xl font-black mb-8">Recursos Inclusos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'IA Gemini Pro ilimitada', active: true },
                { label: 'Multi-Tenant (Enterprise + Gabinete)', active: true },
                { label: 'Suporte 24/7 VIP', active: true },
                { label: 'Relatórios Customizados', active: true },
                { label: 'Treinamento de Equipe', active: true },
                { label: 'API de Integração', active: true }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className={cn(
            "p-10 rounded-[2.5rem] shadow-xl",
            isDarkMode ? "bg-slate-900" : "bg-white"
          )}>
            <h3 className="text-2xl font-black mb-6">Faturamento</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">Última Fatura</span>
                <span className="text-sm font-black">R$ 4.500,00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">Próxima Fatura</span>
                <span className="text-sm font-black">12/04/2024</span>
              </div>
              <button className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                Ver Histórico
              </button>
            </div>
          </div>

          <div className="p-10 rounded-[2.5rem] shadow-xl bg-amber-500 text-white">
            <TrendingUp className="w-12 h-12 mb-6 opacity-50" />
            <h3 className="text-2xl font-black mb-2">Precisa de Mais?</h3>
            <p className="text-amber-50 font-medium leading-relaxed mb-6">
              Fale com nosso time comercial para planos customizados para grandes prefeituras e estados.
            </p>
            <button className="w-full py-4 bg-white text-amber-600 rounded-2xl font-bold hover:bg-amber-50 transition-all">
              Falar com Consultor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
