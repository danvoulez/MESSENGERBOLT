import { MetaWhatsAppConfig, WhatsAppMessage } from '../types/integration';

class MetaWhatsAppService {
  private config: MetaWhatsAppConfig;

  constructor(config: MetaWhatsAppConfig) {
    this.config = config;
  }

  /**
   * Envia mensagem via API oficial do WhatsApp da Meta
   */
  async sendMessage(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const url = `https://graph.facebook.com/v18.0/${this.config.phoneId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.messages) {
        return {
          success: true,
          messageId: data.messages[0].id
        };
      } else {
        return {
          success: false,
          error: data.error?.message || 'Erro desconhecido'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro de conexão'
      };
    }
  }

  /**
   * Envia template aprovado pela Meta
   */
  async sendTemplate(to: string, templateName: string, parameters: string[]): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const url = `https://graph.facebook.com/v18.0/${this.config.phoneId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'pt_BR' },
          components: [
            {
              type: 'body',
              parameters: parameters.map(param => ({ type: 'text', text: param }))
            }
          ]
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.messages) {
        return {
          success: true,
          messageId: data.messages[0].id
        };
      } else {
        return {
          success: false,
          error: data.error?.message || 'Erro desconhecido'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro de conexão'
      };
    }
  }

  /**
   * Verifica status de uma mensagem
   */
  async getMessageStatus(messageId: string): Promise<{ status?: string; error?: string }> {
    try {
      const url = `https://graph.facebook.com/v18.0/${messageId}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        return { status: data.status };
      } else {
        return { error: data.error?.message || 'Erro desconhecido' };
      }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Erro de conexão' };
    }
  }
}

export { MetaWhatsAppService };