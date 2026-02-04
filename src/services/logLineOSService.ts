import { LogLineOSConfig, LogLineSpan } from '../types/integration';

class LogLineOSService {
  private config: LogLineOSConfig;

  constructor(config: LogLineOSConfig) {
    this.config = config;
  }

  /**
   * Gera assinatura HMAC para autenticação segura
   */
  private async generateSignature(timestamp: string, payload: string): Promise<string> {
    const message = timestamp + payload;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.config.secretKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Envia span para o LogLineOS
   */
  async sendSpan(span: LogLineSpan): Promise<{ success: boolean; spanId?: string; error?: string }> {
    try {
      const timestamp = new Date().toISOString();
      const payload = JSON.stringify({ ...span, timestamp });
      const signature = await this.generateSignature(timestamp, payload);

      const response = await fetch(`${this.config.baseUrl}/span`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Agent': this.config.agentId,
          'X-Signature': signature,
          'X-Timestamp': timestamp
        },
        body: payload
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          spanId: data.spanId || data.id
        };
      } else {
        return {
          success: false,
          error: data.error || 'Erro desconhecido no LogLineOS'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro de conexão com LogLineOS'
      };
    }
  }

  /**
   * Registra mensagem do WhatsApp como span
   */
  async logWhatsAppMessage(from: string, to: string, content: string, externalId?: string): Promise<{ success: boolean; spanId?: string; error?: string }> {
    const span: LogLineSpan = {
      type: 'whatsapp_message',
      actor: `agent:${this.config.agentId}`,
      content,
      timestamp: new Date().toISOString(),
      meta: {
        from,
        to,
        external_id: externalId,
        delivery_status: 'delivered'
      }
    };

    return this.sendSpan(span);
  }

  /**
   * Registra resposta de LLM como span
   */
  async logLLMResponse(prompt: string, response: string, model?: string): Promise<{ success: boolean; spanId?: string; error?: string }> {
    const span: LogLineSpan = {
      type: 'llm_response',
      actor: `agent:${this.config.agentId}`,
      content: response,
      timestamp: new Date().toISOString(),
      meta: {
        prompt,
        model: model || 'default',
        tokens_used: response.length // Estimativa simples
      }
    };

    return this.sendSpan(span);
  }

  /**
   * Registra chamada de API como span
   */
  async logAPICall(endpoint: string, method: string, status: number, responseTime: number): Promise<{ success: boolean; spanId?: string; error?: string }> {
    const span: LogLineSpan = {
      type: 'request_call',
      actor: `agent:${this.config.agentId}`,
      content: `${method} ${endpoint}`,
      timestamp: new Date().toISOString(),
      meta: {
        endpoint,
        method,
        status_code: status,
        response_time_ms: responseTime
      }
    };

    return this.sendSpan(span);
  }
}

export { LogLineOSService };