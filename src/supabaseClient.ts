// uniRP Enterprise - Supabase Client Configuration
// This file connects the application to the PostgreSQL database

import { createClient } from '@supabase/supabase-js';
import { createTenantAwareSupabase } from './lib/tenantAwareSupabase';

// Vite injeta variáveis VITE_* via import.meta.env em tempo de build.
// NUNCA use (import.meta as any) — isso quebra a análise estática do Vite.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Configuração Supabase ausente. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env');
}

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const supabase = createTenantAwareSupabase(supabaseClient);

function ensureTenantId(tenantId: string | null | undefined) {
    if (!tenantId) {
        throw new Error('tenant_id ativo nao encontrado no contexto de sessao.');
    }
    return tenantId;
}

/**
 * Example Service Layer for uniRP Data Persistence
 */
export const uniRPService = {
    // Agency Profile
    async getProfile() {
        const { data, error } = await supabase.from('profiles').select('*').single();
        return { data, error };
    },

    // CRM
    async getContacts(tenantId: string | null) {
        const scopedTenantId = ensureTenantId(tenantId);
        const { data, error } = await supabase
            .from('press_contacts')
            .select('*')
            .eq('tenant_id', scopedTenantId);
        return { data, error };
    },

    // Workflow
    async getCards(tenantId: string | null) {
        const scopedTenantId = ensureTenantId(tenantId);
        const { data, error } = await supabase
            .from('demands')
            .select('*')
            .eq('tenant_id', scopedTenantId);
        return { data, error };
    },

    async createCard(card: Record<string, any>, tenantId: string | null) {
        const scopedTenantId = ensureTenantId(tenantId);
        const { data, error } = await supabase
            .from('demands')
            .insert([{ ...card, tenant_id: scopedTenantId }]);
        return { data, error };
    },

    async updateCard(cardId: string, patch: Record<string, any>, tenantId: string | null) {
        const scopedTenantId = ensureTenantId(tenantId);
        const { data, error } = await supabase
            .from('demands')
            .update({ ...patch, tenant_id: scopedTenantId })
            .eq('id', cardId)
            .eq('tenant_id', scopedTenantId)
            .select();
        return { data, error };
    },

    // Meetings
    async saveMeeting(meeting: Record<string, any>, tenantId: string | null) {
        const scopedTenantId = ensureTenantId(tenantId);
        const { data, error } = await supabase
            .from('atas_inteligentes')
            .insert([{ ...meeting, tenant_id: scopedTenantId }]);
        return { data, error };
    }
};
