import { ReactNode } from 'react';
import { TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color: 'blue' | 'emerald' | 'amber' | 'indigo';
}

export function StatCard({ title, value, icon, color }: StatCardProps) {
  const colors = {
    blue: "bg-blue-50 text-brand-accent",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    indigo: "bg-indigo-50 text-indigo-600"
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 hover:scale-[1.02] transition-all cursor-pointer group">
      <div className="flex items-center justify-between mb-6">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110", colors[color])}>
          {icon}
        </div>
        <TrendingUp className="w-5 h-5 text-slate-300" />
      </div>
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-xl font-black text-slate-900">{value}</h4>
    </div>
  );
}
