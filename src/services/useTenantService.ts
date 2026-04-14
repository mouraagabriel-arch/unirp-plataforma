import { useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useAuthContext } from '../contexts/AuthContext';

function ensureTenantId(tenantId: string | null) {
  if (!tenantId) {
    throw new Error('tenant_id ativo nao encontrado para a requisicao.');
  }
  return tenantId;
}

export function useTenantService() {
  const { activeTenantId, profile } = useAuthContext();

  return useMemo(() => {
    const getTenantId = () => ensureTenantId(activeTenantId);

    const parseJsonField = <T>(value: unknown, fallback: T): T => {
      if (!value) return fallback;
      if (typeof value === 'string') {
        try {
          return JSON.parse(value) as T;
        } catch {
          return fallback;
        }
      }
      return value as T;
    };

    const getEnterpriseSettings = async () => {
      const tenantId = getTenantId();
      return supabase
        .from('enterprise_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle();
    };

    const getInstitutionalPrompt = async () => {
      const { data } = await getEnterpriseSettings();
      const nome = data?.nome_instituicao || data?.nome || 'Instituição Pública';
      const missao = data?.missao || 'servir ao interesse público com transparência e eficiência';
      const tom = data?.tom_de_voz || 'Técnico';
      const autoridades = data?.autoridades_principais || data?.publico_alvo || 'não especificadas';
      const portaVozes = parseJsonField<Array<{ nome?: string; cargo?: string }>>(data?.porta_vozes_oficiais, []);
      const portaVozesTexto = portaVozes.length > 0
        ? portaVozes
            .map((item) => `${item.nome || 'Sem nome'} (${item.cargo || 'Sem cargo'})`)
            .join(', ')
        : 'não definidos';
      return `Contexto institucional: órgão ${nome}; missão: ${missao}; tom de voz: ${tom}; autoridades principais: ${autoridades}; porta-vozes oficiais: ${portaVozesTexto}.`;
    };

    const safeLogAuditAction = async (payload: {
      acao: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT';
      tabelaAfetada: string;
      detalhesJson?: Record<string, any>;
      userId?: string | null;
    }) => {
      try {
        const tenantId = getTenantId();
        const userId = payload.userId ?? profile?.id ?? null;
        await supabase.from('system_audit_logs').insert([
          {
            tenant_id: tenantId,
            user_id: userId,
            acao: payload.acao,
            tabela_afetada: payload.tabelaAfetada,
            detalhes_json: payload.detalhesJson ?? {},
          },
        ]);
      } catch (error) {
        console.error('[audit] Falha ao registrar log de auditoria:', error);
      }
    };

    return {
      async logAuditAction(payload: {
        acao: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT';
        tabelaAfetada: string;
        detalhesJson?: Record<string, any>;
        userId?: string | null;
      }) {
        await safeLogAuditAction(payload);
      },

      getEnterpriseSettings,

      from(table: string) {
        return supabase.from(table);
      },

      getInstitutionalPrompt,

      async getActiveTenant() {
        const tenantId = getTenantId();
        return supabase
          .from('enterprise_tenants')
          .select('*')
          .eq('id', tenantId)
          .maybeSingle();
      },

      async listTenantsForAdmin() {
        return supabase
          .from('enterprise_tenants')
          .select('id, nome, status, tipo_modulo, primary_color, logo_url, created_at')
          .order('created_at', { ascending: false });
      },

      async getTenantUsageSummaryForAdmin() {
        const { data: tenants, error } = await this.listTenantsForAdmin();
        if (error) {
          return { data: null, error };
        }

        const rows = await Promise.all(
          (tenants ?? []).map(async (tenant: any) => {
            const [clippingCountRes, crmCountRes] = await Promise.all([
              supabase
                .from('enterprise_clipping')
                .select('*', { count: 'exact', head: true })
                .eq('ambiente', tenant.id),
              supabase
                .from('enterprise_jornalistas')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', tenant.id),
            ]);

            return {
              id: tenant.id,
              nome: tenant.nome,
              status: tenant.status,
              tipo_modulo: tenant.tipo_modulo,
              primary_color: tenant.primary_color,
              logo_url: tenant.logo_url,
              clippingTotal: clippingCountRes.count ?? 0,
              crmTotal: crmCountRes.count ?? 0,
            };
          })
        );

        return {
          data: rows,
          error: null,
        };
      },

      async listAuditLogsForAdmin(filters?: { userId?: string; acao?: string; limit?: number }) {
        const limit = filters?.limit ?? 200;
        let query = supabase
          .from('system_audit_logs')
          .select('id, tenant_id, user_id, acao, tabela_afetada, detalhes_json, created_at')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (filters?.userId) {
          query = query.eq('user_id', filters.userId);
        }

        if (filters?.acao) {
          query = query.eq('acao', filters.acao);
        }

        return query;
      },

      async updateActiveTenant(payload: Record<string, any>) {
        const tenantId = getTenantId();
        return supabase
          .from('enterprise_tenants')
          .update(payload)
          .eq('id', tenantId)
          .select()
          .single();
      },

      async upsertEnterpriseSettings(payload: Record<string, any>) {
        const tenantId = getTenantId();
        const result = await supabase
          .from('enterprise_settings')
          .upsert([{ ...payload, tenant_id: tenantId }], { onConflict: 'tenant_id' })
          .select()
          .single();

        if (!result.error) {
          await safeLogAuditAction({
            acao: 'UPDATE',
            tabelaAfetada: 'enterprise_settings',
            detalhesJson: {
              camposAtualizados: Object.keys(payload),
            },
          });
        }

        return result;
      },

      async getClippingMonitoringConfig() {
        const { data, error } = await getEnterpriseSettings();
        const fallback = { focais: [] as string[], contexto: [] as string[] };
        if (error) {
          return { data: fallback, error };
        }

        const parsed = parseJsonField<{ focais?: string[]; contexto?: string[] }>(data?.clipping_monitoramento, {});
        return {
          data: {
            focais: Array.isArray(parsed?.focais) ? parsed.focais : [],
            contexto: Array.isArray(parsed?.contexto) ? parsed.contexto : [],
          },
          error: null,
        };
      },

      async upsertClippingMonitoringConfig(payload: { focais: string[]; contexto: string[] }) {
        const { data, error } = await getEnterpriseSettings();
        if (error) {
          return { data: null, error };
        }

        return this.upsertEnterpriseSettings({
          ...data,
          clipping_monitoramento: payload,
        });
      },

      async buildInstitutionalPrompt(userPrompt: string) {
        const institutionalPrompt = await getInstitutionalPrompt();

        // Busca diretriz do Cérebro Institucional (tone_directive, primary/secondary color identity)
        const { data: cerebroConfig } = await supabase
          .from('enterprise_cerebro_configuracao')
          .select('tone_directive')
          .maybeSingle();

        const toneDirective = cerebroConfig?.tone_directive?.trim();
        const cerebroSection = toneDirective
          ? `\n\nDIRETRIZ OBRIGATÓRIA DO CÉREBRO INSTITUCIONAL — respeite rigorosamente ao gerar qualquer texto:\n${toneDirective}`
          : '';

        return `${institutionalPrompt}${cerebroSection}\n\nO pedido do usuário é: ${userPrompt}`;
      },

      async listCRMContacts() {
        const tenantId = getTenantId();
        return supabase
          .from('press_contacts')
          .select('*')
          .eq('tenant_id', tenantId);
      },

      async listEnterpriseJournalists() {
        const tenantId = getTenantId();
        return supabase
          .from('enterprise_jornalistas')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false });
      },

      async createEnterpriseJournalist(payload: Record<string, any>) {
        const tenantId = getTenantId();
        return supabase
          .from('enterprise_jornalistas')
          .insert([{ ...payload, tenant_id: tenantId }])
          .select();
      },

      async updateEnterpriseJournalist(id: string, payload: Record<string, any>) {
        const tenantId = getTenantId();
        return supabase
          .from('enterprise_jornalistas')
          .update({ ...payload, tenant_id: tenantId })
          .eq('id', id)
          .eq('tenant_id', tenantId)
          .select()
          .single();
      },

      async deleteEnterpriseJournalist(id: string) {
        const tenantId = getTenantId();
        const result = await supabase
          .from('enterprise_jornalistas')
          .delete()
          .eq('id', id)
          .eq('tenant_id', tenantId);

        if (!result.error) {
          await safeLogAuditAction({
            acao: 'DELETE',
            tabelaAfetada: 'enterprise_jornalistas',
            detalhesJson: { id },
          });
        }

        return result;
      },

      async listEnterpriseCRMGroups() {
        return supabase
          .from('enterprise_crm_grupos')
          .select('*')
          .order('nome', { ascending: true });
      },

      async createEnterpriseCRMGroup(payload: Record<string, any>) {
        return supabase
          .from('enterprise_crm_grupos')
          .insert([payload]);
      },

      async bulkAddContactsToGroup(groupId: string, newContactIds: string[]) {
        const { data: groupData, error: fetchError } = await supabase
          .from('enterprise_crm_grupos')
          .select('jornalistas_ids')
          .eq('id', groupId)
          .single();

        if (fetchError) return { data: null, error: fetchError };

        const existing: string[] = Array.isArray(groupData?.jornalistas_ids) ? groupData.jornalistas_ids : [];
        const merged = Array.from(new Set([...existing, ...newContactIds]));

        return supabase
          .from('enterprise_crm_grupos')
          .update({ jornalistas_ids: merged })
          .eq('id', groupId);
      },

      async createCRMContact(payload: Record<string, any>) {
        const tenantId = getTenantId();
        return supabase
          .from('press_contacts')
          .insert([{ ...payload, tenant_id: tenantId }]);
      },

      async listHubDemandas() {
        return supabase
          .from('enterprise_demandas')
          .select('*');
      },

      async listHubReleaseDemandas() {
        return supabase
          .from('enterprise_demandas')
          .select('id, titulo, briefing, created_at, status_ticket, tipo_peca')
          .eq('tipo_peca', 'Release')
          .order('created_at', { ascending: false })
          .limit(10);
      },

      async createHubDemanda(payload: Record<string, any>) {
        return supabase
          .from('enterprise_demandas')
          .insert([payload])
          .select();
      },

      async listHubHistory() {
        return supabase
          .from('enterprise_demandas')
          .select('*')
          .order('created_at', { ascending: false });
      },

      async deleteHubHistoryItem(id: string) {
        return supabase
          .from('enterprise_demandas')
          .delete()
          .eq('id', id);
      },

      async registerEnterprisePauta(payload: Record<string, any>) {
        return supabase
          .from('enterprise_pautas')
          .insert([payload]);
      },

      async listGabineteDemandas() {
        const tenantId = getTenantId();
        return supabase
          .from('cabinet_demands')
          .select('*')
          .eq('tenant_id', tenantId);
      },

      async createGabineteDemanda(payload: Record<string, any>) {
        const tenantId = getTenantId();
        return supabase
          .from('cabinet_demands')
          .insert([{ ...payload, tenant_id: tenantId }]);
      },

      async listGabineteTransparenciaCotas() {
        const tenantId = getTenantId();
        return supabase
          .from('gabinete_transparencia_cotas')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false });
      },

      async upsertGabineteTransparenciaCota(payload: Record<string, any>) {
        const tenantId = getTenantId();
        const result = await supabase
          .from('gabinete_transparencia_cotas')
          .upsert([{ ...payload, tenant_id: tenantId }], { onConflict: 'tenant_id,categoria' })
          .select();

        if (!result.error) {
          await safeLogAuditAction({
            acao: 'UPDATE',
            tabelaAfetada: 'gabinete_transparencia_cotas',
            detalhesJson: {
              categoria: payload.categoria,
              usado: payload.usado,
              limite: payload.limite,
            },
          });
        }

        return result;
      },

      async deleteGabineteTransparenciaCotaByCategoria(categoria: string) {
        const tenantId = getTenantId();
        const result = await supabase
          .from('gabinete_transparencia_cotas')
          .delete()
          .eq('tenant_id', tenantId)
          .eq('categoria', categoria);

        if (!result.error) {
          await safeLogAuditAction({
            acao: 'DELETE',
            tabelaAfetada: 'gabinete_transparencia_cotas',
            detalhesJson: { categoria },
          });
        }

        return result;
      },

      async getClippingAnalyticsByPeriod(mes: number, ano: number) {
        const tenantId = getTenantId();
        const startDate = new Date(ano, mes - 1, 1);
        const endDate = new Date(ano, mes, 0);
        const startIso = startDate.toISOString().split('T')[0];
        const endIso = endDate.toISOString().split('T')[0];

        const { data, error } = await supabase
          .from('enterprise_clipping')
          .select('sentimento')
          .gte('created_at', startIso)
          .lte('created_at', endIso);

        if (error) {
          return { data: null, error };
        }

        const positivos = (data || []).filter((r: any) => r.sentimento === 'Positivo').length;
        const negativos = (data || []).filter((r: any) => r.sentimento === 'Negativo').length;
        const neutros = (data || []).filter((r: any) => r.sentimento === 'Neutro').length;
        const total = (data || []).length;

        return {
          data: { positivos, negativos, neutros, total },
          error: null,
        };
      },

      async createCRMInteraction(payload: Record<string, any>) {
        const tenantId = getTenantId();
        return supabase
          .from('crm_interactions')
          .insert([{ ...payload, tenant_id: tenantId }])
          .select();
      },

      async listCRMInteractions(contatoId: string) {
        const tenantId = getTenantId();
        return supabase
          .from('crm_interactions')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('contato_id', contatoId)
          .order('created_at', { ascending: false });
      },

      async getCRMAlerts() {
        const tenantId = getTenantId();
        
        // Aniversariantes do mês
        const mesAtual = new Date().getMonth() + 1;
        const { data: aniversariantes } = await supabase
           .from('enterprise_jornalistas')
          .select('id, nome, data_nascimento')
          .eq('tenant_id', tenantId)
          .not('data_nascimento', 'is', null);

        const aniversariantesFiltrados = (aniversariantes || []).filter(c => {
          if (!c.data_nascimento) return false;
          const [ano, mes] = c.data_nascimento.split('-');
          return parseInt(mes) === mesAtual;
        });

        // Contatos estratégicos (grau_influencia = 'Alto')
        const { data: estrategicos } = await supabase
          .from('enterprise_jornalistas')
          .select('id, nome, grau_influencia, categoria_matriz')
          .eq('tenant_id', tenantId)
          .eq('grau_influencia', 'Alto');

        return {
          aniversariantes: aniversariantesFiltrados || [],
          estrategicos: estrategicos || [],
        };
      },

      async updateCRMContact(contatoId: string, payload: Record<string, any>) {
        const tenantId = getTenantId();
        return supabase
          .from('enterprise_jornalistas')
          .update(payload)
          .eq('id', contatoId)
          .eq('tenant_id', tenantId)
          .select()
          .single();
      },

      async getCRMExecutiveSummary() {
        try {
          const tenantId = getTenantId();
          const [{ count }, alerts] = await Promise.all([
            supabase
              .from('enterprise_jornalistas')
              .select('*', { count: 'exact', head: true })
              .eq('tenant_id', tenantId),
            this.getCRMAlerts(),
          ]);

          return {
            totalContatos: count ?? 0,
            aniversariantes: alerts.aniversariantes ?? [],
            estrategicos: alerts.estrategicos ?? [],
          };
        } catch {
          return {
            totalContatos: 0,
            aniversariantes: [],
            estrategicos: [],
          };
        }
      },

      async getMonthlyClippingToneSummary() {
        try {
          const tenantId = getTenantId();
          const now = new Date();
          const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

          const { data, error } = await supabase
            .from('enterprise_clipping')
            .select('id, tonalidade_ia, data_publicacao, created_at')
            .gte('data_publicacao', start)
            .lte('data_publicacao', end);

          if (error) {
            return { data: null, error };
          }

          const items = data ?? [];
          const positivos = items.filter((item: any) => item.tonalidade_ia === 'favoravel').length;
          const negativos = items.filter((item: any) => item.tonalidade_ia === 'hostil').length;
          const neutros = items.filter((item: any) => item.tonalidade_ia === 'neutra').length;
          const total = items.length;

          const pct = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

          return {
            data: {
              total,
              positivos,
              negativos,
              neutros,
              percentualPositivo: pct(positivos),
              percentualNegativo: pct(negativos),
            },
            error: null,
          };
        } catch {
          return {
            data: {
              total: 0,
              positivos: 0,
              negativos: 0,
              neutros: 0,
              percentualPositivo: 0,
              percentualNegativo: 0,
            },
            error: null,
          };
        }
      },

      async getGabineteBudgetSummary() {
        try {
          const { data, error } = await this.listGabineteTransparenciaCotas();
          if (error) {
            return { data: null, error };
          }

          const rows = data ?? [];
          const totalLimite = rows.reduce((acc: number, row: any) => acc + Number(row.limite ?? 0), 0);
          const totalUsado = rows.reduce((acc: number, row: any) => acc + Number(row.usado ?? 0), 0);
          const saldoAtual = totalLimite - totalUsado;

          return {
            data: {
              totalLimite,
              totalUsado,
              saldoAtual,
              cotaDisponivel: saldoAtual,
            },
            error: null,
          };
        } catch {
          return {
            data: {
              totalLimite: 0,
              totalUsado: 0,
              saldoAtual: 0,
              cotaDisponivel: 0,
            },
            error: null,
          };
        }
      },

      async getDashboardKPIs() {
        try {
          const tenantId = getTenantId();
          const [clippingRes, crmAllRes, crmAltoRes, pautasRes, demandasUrgentesRes] = await Promise.allSettled([
            supabase.from('enterprise_clipping').select('tonalidade_ia').limit(500),
            supabase
              .from('enterprise_jornalistas')
              .select('id', { count: 'exact', head: true })
              .eq('tenant_id', tenantId),
            supabase
              .from('enterprise_jornalistas')
              .select('id', { count: 'exact', head: true })
              .eq('tenant_id', tenantId)
              .eq('grau_influencia', 'Alto'),
            supabase
              .from('enterprise_pautas')
              .select('id', { count: 'exact', head: true })
              .not('status_coluna', 'eq', 'done'),
            supabase
              .from('enterprise_demandas')
              .select('id', { count: 'exact', head: true })
              .in('prioridade', ['Alta', 'Urgente', 'alta', 'urgente'])
              .neq('status_ticket', 'entregue'),
          ]);

          const clippingData = clippingRes.status === 'fulfilled' ? (clippingRes.value.data ?? []) : [];
          const clippingTotal = clippingData.length;
          const clippingPositivo = clippingData.filter((r: any) => r.tonalidade_ia === 'favoravel').length;
          const sentimentoPct = clippingTotal > 0 ? Math.round((clippingPositivo / clippingTotal) * 100) : 0;

          const crmTotal = crmAllRes.status === 'fulfilled' ? (crmAllRes.value.count ?? 0) : 0;
          const estrategicos = crmAltoRes.status === 'fulfilled' ? (crmAltoRes.value.count ?? 0) : 0;
          const estrategicosPct = crmTotal > 0 ? Math.round((estrategicos / crmTotal) * 100) : 0;

          const pautasAtivas = pautasRes.status === 'fulfilled' ? (pautasRes.value.count ?? 0) : 0;
          const demandasUrgentes = demandasUrgentesRes.status === 'fulfilled' ? (demandasUrgentesRes.value.count ?? 0) : 0;

          return { sentimentoPct, clippingTotal, clippingPositivo, estrategicosPct, crmTotal, estrategicos, pautasAtivas, demandasUrgentes };
        } catch {
          return { sentimentoPct: 0, clippingTotal: 0, clippingPositivo: 0, estrategicosPct: 0, crmTotal: 0, estrategicos: 0, pautasAtivas: 0, demandasUrgentes: 0 };
        }
      },

      async getDashboardWorkflowItems() {
        try {
          const { data, error } = await supabase
            .from('enterprise_pautas')
            .select('id, titulo, prioridade, prazo_texto, deadline, responsavel, status_coluna')
            .eq('status_coluna', 'review')
            .order('created_at', { ascending: false })
            .limit(5);
          return { data: data ?? [], error };
        } catch {
          return { data: [], error: null };
        }
      },

      async getUrgentDemandas() {
        try {
          const { data, error } = await supabase
            .from('enterprise_demandas')
            .select('id, titulo, prioridade, status_ticket, created_at, secretaria_solicitante')
            .in('prioridade', ['Alta', 'Urgente', 'alta', 'urgente'])
            .neq('status_ticket', 'entregue')
            .order('created_at', { ascending: false })
            .limit(3);
          return { data: data ?? [], error };
        } catch {
          return { data: [], error: null };
        }
      },

      async getDemandasHeatByBairro(limit = 5) {
        try {
          const tenantId = getTenantId();
          const { data, error } = await supabase
            .from('cabinet_demands')
            .select('bairro, cep')
            .eq('tenant_id', tenantId);

          if (error) {
            return { data: null, error };
          }

          const grouped = new Map<string, number>();
          (data ?? []).forEach((row: any) => {
            const bairro = (row?.bairro || '').trim();
            const cep = (row?.cep || '').trim();
            const key = bairro || (cep ? `CEP ${cep}` : 'Nao informado');
            grouped.set(key, (grouped.get(key) ?? 0) + 1);
          });

          const topBairros = Array.from(grouped.entries())
            .map(([bairro, total]) => ({ bairro, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, limit);

          return { data: topBairros, error: null };
        } catch {
          return { data: [], error: null };
        }
      },
    };
  }, [activeTenantId, profile?.id]);
}
