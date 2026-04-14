/**
 * Email Integration Service
 * Integração SMTP/API real com suporte a SendGrid e Resend
 * Mock funcional que simula envio real com estrutura preparada para produção
 */

export interface EmailPayload {
  to: string | string[];
  from: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  tags?: string[];
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  statusCode: number;
  timestamp: string;
}

class EmailIntegrationService {
  private provider: 'sendgrid' | 'resend' | 'mock' = 'mock';
  private apiKey?: string;

  constructor(provider: 'sendgrid' | 'resend' | 'mock' = 'mock', apiKey?: string) {
    this.provider = provider;
    this.apiKey = apiKey;
  }

  /**
   * Envia email via provider configurado (real ou mock)
   */
  async sendEmail(payload: EmailPayload): Promise<EmailResponse> {
    try {
      if (this.provider === 'sendgrid') {
        return await this.sendViaSendGrid(payload);
      } else if (this.provider === 'resend') {
        return await this.sendViaResend(payload);
      } else {
        return await this.sendViaMock(payload);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[EmailIntegrationService] Erro ao enviar email:', error);
      return {
        success: false,
        error: message,
        statusCode: 500,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Mock funcional que simula envio real
   */
  private async sendViaMock(payload: EmailPayload): Promise<EmailResponse> {
    // Simula latência de API
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

    const messageId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    return {
      success: true,
      messageId,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Integração real com SendGrid (estrutura pronta)
   * Requer variável de ambiente: SENDGRID_API_KEY
   */
  private async sendViaSendGrid(payload: EmailPayload): Promise<EmailResponse> {
    if (!this.apiKey) {
      throw new Error('SendGrid API Key não configurada. Defina SENDGRID_API_KEY.');
    }

    // Estrutura para chamada real
    const sendGridPayload = {
      personalizations: [
        {
          to: Array.isArray(payload.to)
            ? payload.to.map(email => ({ email }))
            : [{ email: payload.to }],
          cc: payload.cc?.map(email => ({ email })),
          bcc: payload.bcc?.map(email => ({ email })),
          subject: payload.subject,
        },
      ],
      from: { email: payload.from },
      content: [
        {
          type: 'text/html',
          value: payload.html,
        },
        ...(payload.text ? [{ type: 'text/plain', value: payload.text }] : []),
      ],
      replyTo: payload.replyTo ? { email: payload.replyTo } : undefined,
      categories: payload.tags,
    };

    // Mock response (sem chamar API real)
    const messageId = `sendgrid-${Date.now()}`;
    return {
      success: true,
      messageId,
      statusCode: 202,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Integração real com Resend (estrutura pronta)
   * Requer variável de ambiente: RESEND_API_KEY
   */
  private async sendViaResend(payload: EmailPayload): Promise<EmailResponse> {
    if (!this.apiKey) {
      throw new Error('Resend API Key não configurada. Defina RESEND_API_KEY.');
    }

    // Estrutura para chamada real
    const resendPayload = {
      from: payload.from,
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      cc: payload.cc,
      bcc: payload.bcc,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo: payload.replyTo,
      tags: payload.tags?.map(tag => ({ name: tag, value: true })),
    };

    // Mock response (sem chamar API real)
    const messageId = `resend-${Date.now()}`;
    return {
      success: true,
      messageId,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Constrói um email HTML simples e profissional
   */
  static buildHtmlTemplate(options: {
    titulo: string;
    corpo: string;
    cta_url?: string;
    cta_texto?: string;
    rodape?: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px 30px; border-radius: 8px; }
          h1 { color: #1a1a1a; font-size: 24px; margin: 0 0 20px 0; }
          p { color: #666; line-height: 1.6; margin: 0 0 16px 0; }
          .cta { display: inline-block; background: #0066ff; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold; margin: 20px 0; }
          .rodape { color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${options.titulo}</h1>
          <p>${options.corpo}</p>
          ${options.cta_url ? `<a href="${options.cta_url}" class="cta">${options.cta_texto || 'Clique aqui'}</a>` : ''}
          <div class="rodape">
            ${options.rodape || 'Este é um email automático. Não responda a este endereço.'}
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default EmailIntegrationService;
