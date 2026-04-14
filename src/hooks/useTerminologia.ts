import { useEffect, useMemo, useState } from 'react';
import { useAuthContext, type TenantModuleType } from '../contexts/AuthContext';
import { useTenantService } from '../services/useTenantService';

type TermKey = 'cidadao' | 'cidadaos';

const TERMOS: Record<TenantModuleType, Record<TermKey, string>> = {
  orgao_publico: {
    cidadao: 'Cidadao',
    cidadaos: 'Cidadaos',
  },
  autarquia: {
    cidadao: 'Associado',
    cidadaos: 'Associados',
  },
};

export function useTerminologia() {
  const tenantService = useTenantService();
  const { activeModuleType, activeTenantId } = useAuthContext();
  const [tipoModulo, setTipoModulo] = useState<TenantModuleType>(activeModuleType ?? 'orgao_publico');

  useEffect(() => {
    if (!activeTenantId) return;

    const load = async () => {
      try {
        const { data, error } = await tenantService.getActiveTenant();
        if (error) {
          console.error('[useTerminologia] Falha ao carregar tipo_modulo do tenant:', error);
          return;
        }

        if (data?.tipo_modulo === 'orgao_publico' || data?.tipo_modulo === 'autarquia') {
          setTipoModulo(data.tipo_modulo);
        }
      } catch (error) {
        console.error('[useTerminologia] Erro inesperado ao resolver terminologia:', error);
      }
    };

    void load();
  }, [activeTenantId, tenantService]);

  useEffect(() => {
    if (activeModuleType === 'orgao_publico' || activeModuleType === 'autarquia') {
      setTipoModulo(activeModuleType);
    }
  }, [activeModuleType]);

  const termo = useMemo(() => {
    return (key: TermKey) => TERMOS[tipoModulo][key] ?? key;
  }, [tipoModulo]);

  return {
    tipoModulo,
    termo,
  };
}
