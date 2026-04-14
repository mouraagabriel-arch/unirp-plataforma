/**
 * uniRP - Supabase Client (Arquitetura Estática)
 * Inicializa a conexão com o Backend-as-a-Service.
 */

// As chaves são injetadas pelo servidor via meta-tags ou variáveis de ambiente.
// NUNCA commite chaves reais neste arquivo. Use o arquivo .env na raiz do projeto.
// As variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são injetadas pelo Vite no bundle.
const SUPABASE_URL = window.__SUPABASE_URL__ || '';
const SUPABASE_ANON_KEY = window.__SUPABASE_ANON_KEY__ || '';

// Inicializa o cliente usando a biblioteca carregada via CDN no index.html
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("uniRP: Conexão com Supabase inicializada.");
