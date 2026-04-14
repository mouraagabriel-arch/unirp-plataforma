import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig, loadEnv} from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({mode}) => {
  // loadEnv(mode, dir, prefix='') carrega TODAS as vars do .env (prefix vazio = sem filtro)
  // O segundo argumento DEVE ser o diretório absoluto da raiz do projeto
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      // GEMINI_API_KEY não tem prefixo VITE_, então não é exposta automaticamente pelo Vite.
      // O define abaixo injeta o valor em código que usa process.env.GEMINI_API_KEY.
      // Lê VITE_GEMINI_API_KEY (preferencial) com fallback para GEMINI_API_KEY.
      'process.env.GEMINI_API_KEY': JSON.stringify(
        env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || ''
      ),
      // NÃO defina import.meta.env.VITE_* manualmente — o Vite já expõe variáveis
      // com prefixo VITE_ nativas via import.meta.env. Fazê-lo aqui causa conflito
      // e sobrescreve com undefined quando o nome da chave está errado no .env.
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
