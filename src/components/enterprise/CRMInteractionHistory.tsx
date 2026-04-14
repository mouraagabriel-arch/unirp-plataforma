import { useEffect, useState } from 'react';
import { Mail, MessageCircle, Phone, Calendar, Loader2, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { useTenantService } from '../../services/useTenantService';

interface Interaction {
  id: string;
  tipo_interacao: string;
  resumo_mensagem: string;
  created_at: string;
}

export function CRMInteractionHistory({ contatoId }: { contatoId: string }) {
  const tenantService = useTenantService();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await tenantService.listCRMInteractions(contatoId);
        if (error) {
          console.error('[CRMInteractionHistory] Erro ao carregar:', error);
          return;
        }
        setInteractions(data || []);
      } catch (error) {
        console.error('[CRMInteractionHistory] Erro:', error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [contatoId]);

  const getIconForType = (tipo: string) => {
    switch (tipo) {
      case 'email':
        return <Mail className="w-4 h-4 text-blue-400" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-green-400" />;
      case 'ligacao':
        return <Phone className="w-4 h-4 text-purple-400" />;
      case 'hub_release':
        return <FileText className="w-4 h-4 text-brand-accent" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTypeLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      email: 'E-mail',
      whatsapp: 'WhatsApp',
      ligacao: 'Ligação',
      reunion: 'Reunião',
      hub_release: 'Release do Hub',
    };
    return labels[tipo] || tipo;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {interactions.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Nenhuma interação registrada</p>
          <p className="text-xs mt-1">As interações serão exibidas aqui quando e-mails ou mensagens forem enviadas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {interactions.map((interaction, idx) => (
            <motion.div
              key={interaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 border border-white/10">
                  {getIconForType(interaction.tipo_interacao)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white">
                    {getTypeLabel(interaction.tipo_interacao)}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {new Date(interaction.created_at).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {interaction.resumo_mensagem && (
                <p className="text-sm text-slate-300 leading-relaxed pl-11 -mt-2">
                  {interaction.resumo_mensagem.substring(0, 150)}
                  {interaction.resumo_mensagem.length > 150 ? '...' : ''}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
