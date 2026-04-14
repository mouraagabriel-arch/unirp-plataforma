import { BarChart3, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface HeatItem {
  bairro: string;
  total: number;
}

interface DemandHeatmapProps {
  items: HeatItem[];
}

export function DemandHeatmap({ items }: DemandHeatmapProps) {
  const max = items.reduce((acc, item) => Math.max(acc, item.total), 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-rose-300" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-rose-300">Mapa de Calor de Demandas</p>
          <p className="text-sm text-slate-300">Top 5 bairros com maior volume</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-400">Sem demandas com bairro/CEP informado no tenant ativo.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => {
            const width = max > 0 ? Math.max(10, Math.round((item.total / max) * 100)) : 10;
            return (
              <div key={`${item.bairro}-${idx}`} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-300" />
                    {item.bairro}
                  </span>
                  <strong className="text-rose-200">{item.total}</strong>
                </div>
                <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.06 }}
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
