import { useEffect, useState } from 'react';
import { AlertCircle, Cake, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTenantService } from '../../services/useTenantService';
import { useTerminologia } from '../../hooks/useTerminologia';

interface CRMAlert {
  id: string;
  nome: string;
  tipo: 'aniversario' | 'estrategico';
  data_nascimento?: string;
  grau_influencia?: string;
  categoria_matriz?: string;
}

export function CRMDashboard() {
  const tenantService = useTenantService();
  const { termo } = useTerminologia();
  const [loading, setLoading] = useState(false);
  const [aniversariantes, setAniversariantes] = useState<any[]>([]);
  const [estrategicos, setEstrategicos] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { aniversariantes: aniv, estrategicos: estrat } = await tenantService.getCRMAlerts();
        setAniversariantes(aniv);
        setEstrategicos(estrat);
      } catch (error) {
        console.error('[CRMDashboard] Erro ao carregar alertas:', error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-400 font-semibold">Carregando alertas do CRM...</div>
      </div>
    );
  }

  const todasEmAlerta = aniversariantes.length + estrategicos.length;
  const termoPlural = termo('cidadaos');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
    >
      <div className="md:col-span-2 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Coerencia de Termos</p>
        <p className="text-sm text-slate-200 mt-1">Total de {termoPlural} monitorados no CRM ativo.</p>
      </div>

      {/* Card Aniversariantes */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 backdrop-blur-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/30 border border-cyan-400/30 flex items-center justify-center">
            <Cake className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <p className="text-xs font-black text-cyan-300 uppercase tracking-widest">Aniversariantes do Mês</p>
            <p className="text-sm font-semibold text-slate-300">{aniversariantes.length} contato(s)</p>
          </div>
        </div>

        {aniversariantes.length > 0 ? (
          <div className="space-y-2">
            {aniversariantes.map((contato) => (
              <div
                key={contato.id}
                className="rounded-xl bg-white/5 border border-cyan-400/20 px-4 py-3 flex items-center justify-between"
              >
                <p className="text-sm font-semibold text-slate-200">{contato.nome}</p>
                <span className="text-xs font-black text-cyan-300">🎂 Aniversário</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-slate-400 text-sm">
            Nenhum aniversariante este mês
          </div>
        )}
      </div>

      {/* Card Estratégicos */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/20 to-amber-500/5 backdrop-blur-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/30 border border-amber-400/30 flex items-center justify-center">
            <Star className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <p className="text-xs font-black text-amber-300 uppercase tracking-widest">Contatos Estratégicos</p>
            <p className="text-sm font-semibold text-slate-300">{estrategicos.length} contato(s)</p>
          </div>
        </div>

        {estrategicos.length > 0 ? (
          <div className="space-y-2">
            {estrategicos.map((contato) => (
              <div
                key={contato.id}
                className="rounded-xl bg-white/5 border border-amber-400/20 px-4 py-3 flex items-center justify-between"
              >
                <p className="text-sm font-semibold text-slate-200">{contato.nome}</p>
                <span className="text-xs font-black text-amber-300">⭐ Alto</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-slate-400 text-sm">
            Nenhum contato estratégico
          </div>
        )}
      </div>

      {/* Banner de Alertas */}
      <AnimatePresence>
        {todasEmAlerta > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-4 py-3 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-black text-yellow-300">
                {todasEmAlerta} alerta{todasEmAlerta > 1 ? 's' : ''} do CRM requer{todasEmAlerta > 1 ? 'em' : ''} atenção
              </p>
              <p className="text-xs text-yellow-200 mt-1">
                Revise os dados dos {termoPlural.toLowerCase()} em alerta para manter o relacionamento ativo.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
