import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

export type TenantModuleType = 'orgao_publico' | 'autarquia';

export interface AuthProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  tenant_id: string | null;
  tipo_modulo: TenantModuleType | null;
}

export interface TenantOption {
  id: string;
  nome: string;
  tipo_modulo: TenantModuleType;
  status: boolean;
}

interface AuthContextValue {
  session: Session | null;
  profile: AuthProfile | null;
  loading: boolean;
  activeTenantId: string | null;
  activeModuleType: TenantModuleType | null;
  availableTenants: TenantOption[];
  setActiveTenant: (tenantId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'unirp_active_tenant_id';

function sanitizeModuleType(value: string | null | undefined): TenantModuleType | null {
  if (value === 'orgao_publico' || value === 'autarquia') {
    return value;
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableTenants, setAvailableTenants] = useState<TenantOption[]>([]);
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null);
  const [activeModuleType, setActiveModuleType] = useState<TenantModuleType | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, tenant_id, tipo_modulo')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    const mappedProfile: AuthProfile = {
      id: data.id,
      email: data.email ?? null,
      full_name: data.full_name ?? null,
      role: data.role ?? 'user',
      tenant_id: data.tenant_id ?? null,
      tipo_modulo: sanitizeModuleType(data.tipo_modulo),
    };

    setProfile(mappedProfile);
    return mappedProfile;
  }, []);

  const loadTenants = useCallback(async (authProfile: AuthProfile) => {
    if (authProfile.role === 'super_admin') {
      const { data, error } = await supabase
        .from('enterprise_tenants')
        .select('id, nome, tipo_modulo, status')
        .eq('status', true)
        .order('nome', { ascending: true });

      if (error) {
        throw error;
      }

      const tenants = (data ?? []).map((tenant) => ({
        id: tenant.id,
        nome: tenant.nome,
        tipo_modulo: sanitizeModuleType(tenant.tipo_modulo) ?? 'orgao_publico',
        status: tenant.status,
      }));

      setAvailableTenants(tenants);
      return tenants;
    }

    if (!authProfile.tenant_id) {
      setAvailableTenants([]);
      return [];
    }

    const { data, error } = await supabase
      .from('enterprise_tenants')
      .select('id, nome, tipo_modulo, status')
      .eq('id', authProfile.tenant_id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const tenantList = data
      ? [{
          id: data.id,
          nome: data.nome,
          tipo_modulo: sanitizeModuleType(data.tipo_modulo) ?? (authProfile.tipo_modulo ?? 'orgao_publico'),
          status: data.status,
        }]
      : [];

    setAvailableTenants(tenantList);
    return tenantList;
  }, []);

  const applyActiveTenant = useCallback((authProfile: AuthProfile, tenants: TenantOption[]) => {
    if (authProfile.role === 'super_admin') {
      const stored = localStorage.getItem(STORAGE_KEY);
      const preferred = tenants.find((tenant) => tenant.id === stored);
      const selected = preferred ?? tenants[0] ?? null;
      setActiveTenantId(selected?.id ?? null);
      setActiveModuleType(selected?.tipo_modulo ?? authProfile.tipo_modulo ?? 'orgao_publico');
      if (selected?.id) {
        localStorage.setItem(STORAGE_KEY, selected.id);
      }
      return;
    }

    setActiveTenantId(authProfile.tenant_id);
    setActiveModuleType(authProfile.tipo_modulo ?? tenants[0]?.tipo_modulo ?? 'orgao_publico');

    if (authProfile.tenant_id) {
      localStorage.setItem(STORAGE_KEY, authProfile.tenant_id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const currentSession = sessionData.session;
    setSession(currentSession);

    if (!currentSession?.user) {
      setProfile(null);
      setAvailableTenants([]);
      setActiveTenantId(null);
      setActiveModuleType(null);
      localStorage.removeItem(STORAGE_KEY);
      setLoading(false);
      return;
    }

    try {
      const authProfile = await loadProfile(currentSession.user.id);
      const tenants = await loadTenants(authProfile);
      applyActiveTenant(authProfile, tenants);
    } catch (error) {
      console.error('Falha ao carregar contexto de autenticacao.', error);
      setProfile(null);
      setAvailableTenants([]);
      setActiveTenantId(null);
      setActiveModuleType(null);
    } finally {
      setLoading(false);
    }
  }, [applyActiveTenant, loadProfile, loadTenants]);

  useEffect(() => {
    bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession?.user) {
        setProfile(null);
        setAvailableTenants([]);
        setActiveTenantId(null);
        setActiveModuleType(null);
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      void bootstrap();
    });

    return () => listener.subscription.unsubscribe();
  }, [bootstrap]);

  const setActiveTenant = useCallback(async (tenantId: string) => {
    if (!profile || profile.role !== 'super_admin') {
      return;
    }

    const tenant = availableTenants.find((item) => item.id === tenantId);
    if (!tenant) {
      return;
    }

    setActiveTenantId(tenant.id);
    setActiveModuleType(tenant.tipo_modulo);
    localStorage.setItem(STORAGE_KEY, tenant.id);
  }, [availableTenants, profile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    profile,
    loading,
    activeTenantId,
    activeModuleType,
    availableTenants,
    setActiveTenant,
    signOut,
  }), [activeModuleType, activeTenantId, availableTenants, loading, profile, session, setActiveTenant, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext deve ser usado dentro de AuthProvider.');
  }
  return context;
}
