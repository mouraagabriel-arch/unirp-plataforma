import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Chama qualquer função assíncrona e, se a API responder com erro 429 (quota),
 * aguarda o tempo indicado pela mensagem e tenta novamente.
 * @param fn          Função que faz a chamada à API Gemini
 * @param onStatus    Callback opcional para exibir mensagem de progresso ao usuário
 * @param maxRetries  Número máximo de tentativas após a primeira falha (padrão: 3)
 */
export async function callGeminiWithRetry<T>(
  fn: () => Promise<T>,
  onStatus?: (msg: string) => void,
  maxRetries = 3,
): Promise<T> {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const result = await fn();
      onStatus?.('');
      return result;
    } catch (error) {
      attempt++;
      const msg = error instanceof Error ? error.message : String(error);
      const is429 =
        msg.includes('429') ||
        msg.toLowerCase().includes('quota exceeded') ||
        msg.toLowerCase().includes('too many requests') ||
        msg.toLowerCase().includes('resource_exhausted');

      if (!is429 || attempt > maxRetries) throw error;

      // Tenta extrair o delay sugerido da mensagem de erro ("retry in 1.60s" / "try in 60 seconds")
      let delayMs = 65_000; // padrão seguro: 65 s
      const match = msg.match(/(\d+(?:\.\d+)?)\s*s(?:econds?)?/i);
      if (match) delayMs = Math.ceil(parseFloat(match[1])) * 1_000 + 500;

      const seconds = Math.ceil(delayMs / 1_000);
      onStatus?.(
        `⏳ Aguardando limite da API, tentando novamente em ${seconds}s... (tentativa ${attempt}/${maxRetries})`,
      );
      await new Promise<void>(resolve => setTimeout(resolve, delayMs));
      onStatus?.(`🔄 Tentando novamente...`);
    }
  }
}
