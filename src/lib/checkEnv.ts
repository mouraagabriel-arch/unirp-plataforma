/**
 * SCRIPT DE TESTE — Verificação do carregamento de variáveis de ambiente pelo Vite
 * 
 * COMO USAR:
 *   1. Certifique-se que o .env na raiz do projeto está preenchido
 *   2. Execute: node --loader tsx scripts/test-env.ts
 *      OU importe este check no App.tsx temporariamente
 *
 * O Vite injeta variáveis VITE_* automaticamente via import.meta.env
 * Variáveis sem prefixo VITE_ precisam do bloco `define` no vite.config.ts
 */

const checks = [
  {
    name: 'VITE_SUPABASE_URL',
    value: import.meta.env.VITE_SUPABASE_URL,
    expected: 'https://...supabase.co',
  },
  {
    name: 'VITE_SUPABASE_ANON_KEY',
    value: import.meta.env.VITE_SUPABASE_ANON_KEY,
    expected: 'sb_publishable_...',
  },
  {
    name: 'VITE_GEMINI_API_KEY',
    value: import.meta.env.VITE_GEMINI_API_KEY,
    expected: 'AIzaSy...',
  },
  {
    name: 'process.env.GEMINI_API_KEY (via define)',
    value: process.env.GEMINI_API_KEY,
    expected: 'AIzaSy... (mesmo que VITE_GEMINI_API_KEY)',
  },
];

console.group('🔐 Verificação de Variáveis de Ambiente — ComuniqueGov');
let allOk = true;

for (const check of checks) {
  const ok = Boolean(check.value) && check.value !== 'undefined';
  if (!ok) allOk = false;
  console.log(
    ok ? '✅' : '❌',
    check.name,
    '→',
    ok ? `${String(check.value).slice(0, 20)}...` : `UNDEFINED (esperado: ${check.expected})`
  );
}

if (allOk) {
  console.log('\n✅ TODAS as variáveis carregadas. O .env está sendo lido corretamente.');
} else {
  console.error('\n❌ FALHA: Verifique se o arquivo .env existe na RAIZ do projeto (mesmo nível de vite.config.ts)');
  console.error('   Checklist:\n   1. O arquivo se chama exatamente ".env" (não ".env.local" ou ".env.development")');
  console.error('   2. A chave começa com VITE_ para ser exposta pelo Vite');
  console.error('   3. Reinicie o servidor de desenvolvimento após editar o .env');
}

console.groupEnd();

export {};
