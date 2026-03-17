/**
 * uniRP - Supabase Client (Arquitetura Estática)
 * Inicializa a conexão com o Backend-as-a-Service.
 */

// ATENÇÃO: Substitua as strings abaixo pelas chaves do seu projeto no Supabase Dashboard
// Vá em: Project Settings -> API
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';

// Inicializa o cliente usando a biblioteca carregada via CDN no index.html
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("uniRP: Conexão com Supabase inicializada.");
