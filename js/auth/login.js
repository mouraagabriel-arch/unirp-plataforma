/**
 * uniRP - Módulo de Autenticação e Onboarding
 * Gerencia sessões, perfis e o fluxo Zero-State.
 */
import { supabase } from '../supabase-client.js';

export const auth = {
    /**
     * Realiza o login do usuário
     */
    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    },

    /**
     * Encerra a sessão atual
     */
    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.reload();
    },

    /**
     * Recupera a sessão ativa do navegador
     */
    async getSession() {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    /**
     * Busca o perfil completo do usuário e os dados da sua instituição
     */
    async getUserProfile(userId) {
        const { data, error } = await supabase
            .from('usuarios')
            .select(`
                *,
                instituicoes (
                    *
                )
            `)
            .eq('id', userId)
            .single();
        
        if (error) {
            console.error("Erro ao buscar perfil:", error);
            throw error;
        }
        return data;
    },

    /**
     * Verifica se a instituição já passou pelo Onboarding (Zero-State)
     * Requisitos mínimos: Chave Gemini, Logo e SMTP configurados.
     */
    async checkOnboarding(instituicaoId) {
        const { data, error } = await supabase
            .from('instituicoes')
            .select('gemini_key, logo_url, smtp_host')
            .eq('id', instituicaoId)
            .single();
        
        if (error) {
            console.warn("Instituição não encontrada ou erro no banco. Ativando Onboarding.");
            return true;
        }
        
        // Se qualquer um desses campos estiver vazio, o onboarding é obrigatório
        const needsOnboarding = !data.gemini_key || !data.logo_url || !data.smtp_host;
        
        return needsOnboarding;
    }
};
