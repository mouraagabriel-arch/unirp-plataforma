import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  key?: string | number;
}

export function SidebarItem({ icon, label, active, onClick }: SidebarItemProps) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group relative",
        active 
          ? "bg-brand-accent/20 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)] border border-brand-accent/30" 
          : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
      )}
    >
      {active && (
        <motion.div 
          layoutId="active-pill"
          className="absolute left-0 w-1 h-6 bg-brand-accent rounded-r-full"
        />
      )}
      <span className={cn(
        "transition-all duration-300",
        active ? "scale-110 text-brand-accent" : "group-hover:scale-110 group-hover:text-slate-200"
      )}>
        {icon}
      </span>
      <span className={cn(
        "font-bold text-sm transition-colors",
        active ? "text-white" : "text-slate-500 group-hover:text-slate-200"
      )}>{label}</span>
    </button>
  );
}
