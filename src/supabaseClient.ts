// uniRP Enterprise - Supabase Client Configuration
// This file connects the application to the PostgreSQL database

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = ((import.meta as any).env && (import.meta as any).env.VITE_SUPABASE_URL) || '';
const supabaseAnonKey = ((import.meta as any).env && (import.meta as any).env.VITE_SUPABASE_ANON_KEY) || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Example Service Layer for uniRP Data Persistence
 */
export const uniRPService = {
    // Agency Profile
    async getProfile() {
        const { data, error } = await supabase.from('perfil_agencia').select('*').single();
        return { data, error };
    },

    // CRM
    async getContacts() {
        const { data, error } = await supabase.from('crm_contatos').select('*');
        return { data, error };
    },

    // Workflow
    async getCards() {
        const { data, error } = await supabase.from('workflow_cards').select('*');
        return { data, error };
    },

    async createCard(card) {
        const { data, error } = await supabase.from('workflow_cards').insert([card]);
        return { data, error };
    },

    // Meetings
    async saveMeeting(meeting) {
        const { data, error } = await supabase.from('atas_inteligentes').insert([meeting]);
        return { data, error };
    }
};
