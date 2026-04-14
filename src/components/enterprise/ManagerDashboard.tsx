import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Building2, Newspaper, Users, Wallet } from 'lucide-react';
import { motion } from 'motion/react';
import { useTenantService } from '../../services/useTenantService';
import { useTerminologia } from '../../hooks/useTerminologia';
import { DemandHeatmap } from './DemandHeatmap';

interface ManagerDashboardProps {
  isDarkMode: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

export function ManagerDashboard({ isDarkMode }: ManagerDashboardProps) {
  const tenantService = useTenantService();
  const { termo } = useTerminologia();

  const [loading, setLoading] = useState(true);
  const [crmTotal, setCrmTotal] = useState(0);
  const [crmAniversariantes, setCrmAniversariantes] = useState(0);
  const [crmEstrategicos, setCrmEstrategicos] = useState(0);
  const [clippingPositivo, setClippingPositivo] = useState(0);
  const [clippingNegativo, setClippingNegativo] = useState(0);
  const [clippingTotal, setClippingTotal] = useState(0);
  const [saldoAtual, setSaldoAtual] = useState(0);
  const [cotaDisponivel, setCotaDisponivel] = useState(0);
  const [heatmap, setHeatmap] = useState<Array<{ bairro: string; total: number }>>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [crm, clipping, budget, topBairros] = await Promise.all([
          tenantService.getCRMExecutiveSummary(),
          tenantService.getMonthlyClippingToneSummary(),
          tenantService.getGabineteBudgetSummary(),
          tenantService.getDemandasHeatByBairro(5),
        ]);

        setCrmTotal(crm.totalContatos || 0);
        setCrmAniversariantes((crm.aniversariantes || []).length);
        setCrmEstrategicos((crm.estrategicos || []).length);

        if (!clipping.error && clipping.data) {
          setClippingPositivo(clipping.data.percentualPositivo);
          setClippingNegativo(clipping.data.percentualNegativo);
          setClippingTotal(clipping.data.total);
        } else {
          setClippingPositivo(0);
          setClippingNegativo(0);
          setClippingTotal(0);
        }

        if (!budget.error && budget.data) {
          setSaldoAtual(budget.data.saldoAtual || 0);
          setCotaDisponivel(budget.data.cotaDisponivel || 0);
        } else {
          setSaldoAtual(0);
          setCotaDisponivel(0);
        }

        if (!topBairros.error && topBairros.data) {
          setHeatmap(topBairros.data);
        } else {
          setHeatmap([]);
        }
      } catch {
        setCrmTotal(0);
        setCrmAniversariantes(0);
        setCrmEstrategicos(0);
        setClippingPositivo(0);
        setClippingNegativo(0);
        setClippingTotal(0);
        setSaldoAtual(0);
        setCotaDisponivel(0);
        setHeatmap([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [tenantService]);

  const termoPlural = termo('cidadaos');

  const cards = useMemo(() => {
    return [
      {
        title: `Resumo CRM (${termoPlural})`,
        icon: Users,
        accent: 'from-cyan-500/25 to-cyan-500/5 border-cyan-400/30',
        content: (
          <div className="space-y-1 text-sm text-slate-200">
            <p>Total de contatos: <strong>{crmTotal}</strong></p>
            <p>Aniversariantes: <strong>{crmAniversariantes}</strong></p>
            <p>Estratégicos (Alto): <strong>{crmEstrategicos}</strong></p>
          </div>
        ),
      },
      {
        title: 'Resumo Clipping (mês atual)',
        icon: Newspaper,
        accent: 'from-indigo-500/25 to-indigo-500/5 border-indigo-400/30',
        content: (
          <div className="space-y-1 text-sm text-slate-200">
            <p>Positivas: <strong>{clippingPositivo}%</strong></p>
            <p>Negativas: <strong>{clippingNegativo}%</strong></p>
            <p>Total analisado: <strong>{clippingTotal}</strong></p>
          </div>
        ),
      },
      {
        title: 'Resumo Gabinete',
        icon: Wallet,
        accent: 'from-emerald-500/25 to-emerald-500/5 border-emerald-400/30',
        content: (
          <div className="space-y-1 text-sm text-slate-200">
            <p>Saldo atual: <strong>{formatCurrency(saldoAtual)}</strong></p>
            <p>Cota disponível: <strong>{formatCurrency(cotaDisponivel)}</strong></p>
          </div>
        ),
      },
    ];
  }, [clippingNegativo, clippingPositivo, clippingTotal, cotaDisponivel, crmAniversariantes, crmEstrategicos, crmTotal, saldoAtual, termoPlural]);

  return (
    <section className="max-w-7xl mx-auto py-8 space-y-6 text-slate-100">
      {loading && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
          Atualizando indicadores do dashboard...
        </div>
      )}
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white inline-flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-accent" />
            Dashboard do Gestor (Visao 360)
          </h1>
          <p className="text-sm text-slate-400 mt-1">Panorama executivo consolidado por tenant ativo.</p>
        </div>
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200 inline-flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Dados consolidados em tempo real
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <motion.article
            key={card.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className={`rounded-2xl border bg-gradient-to-br p-5 ${card.accent}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <card.icon className="w-5 h-5 text-white" />
              <h2 className="text-sm font-black text-white">{card.title}</h2>
            </div>
            {card.content}
          </motion.article>
        ))}
      </div>

      <DemandHeatmap items={heatmap} />
    </section>
  );
}
