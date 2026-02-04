import { MetaWhatsAppService } from './metaWhatsAppService';
import { LogLineOSService } from './logLineOSService';
import { WebhookHandler } from './webhookHandler';
import { MetaWhatsAppConfig, LogLineOSConfig } from '../types/integration';

/**
 * Ponte principal que conecta WhatsApp Meta API com LogLineOS
 */
class IntegrationBridge {
  private metaService: MetaWhatsAppService;
  private logLineService: LogLineOSService;
  private webhookHandler: WebhookHandler;

  constructor(metaConfig: MetaWhatsAppConfig, logLineConfig: LogLineOSConfig) {
    this.metaService = new MetaWhatsAppService(metaConfig);
    this.logLineService = new LogLineOSService(logLineConfig);
    this.webhookHandler = new WebhookHandler(this.logLineService);
  }

  /**
   * Envia mensagem e registra no LogLineOS
   */
  async sendMessage(to: string, message: string): Promise<{ success: boolean; messageId?: string; spanId?: string; error?: string }> {
    const startTime = Date.now();

    try {
      // Envia via Meta API
      const metaResult = await this.metaService.sendMessage(to, message);
      const responseTime = Date.now() - startTime;

      // Registra chamada da API
      await this.logLineService.logAPICall(
        '/messages',
        'POST',
        metaResult.success ? 200 : 400,
        responseTime
      );

      if (metaResult.success) {
        // Registra mensagem enviada no LogLineOS
        const spanResult = await this.logLineService.logWhatsAppMessage(
          'minicontratos',
          to,
          message,
          metaResult.messageId
        );

        return {
          success: true,
          messageId: metaResult.messageId,
          spanId: spanResult.spanId,
          error: spanResult.error
        };
      } else {
        return {
          success: false,
          error: metaResult.error
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Registra erro
      await this.logLineService.logAPICall(
        '/messages',
        'POST',
        500,
        responseTime
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Envia template e registra no LogLineOS
   */
  async sendTemplate(to: string, templateName: string, parameters: string[]): Promise<{ success: boolean; messageId?: string; spanId?: string; error?: string }> {
    const startTime = Date.now();

    try {
      const metaResult = await this.metaService.sendTemplate(to, templateName, parameters);
      const responseTime = Date.now() - startTime;

      await this.logLineService.logAPICall(
        '/messages (template)',
        'POST',
        metaResult.success ? 200 : 400,
        responseTime
      );

      if (metaResult.success) {
        const spanResult = await this.logLineService.logWhatsAppMessage(
          'minicontratos',
          to,
          `Template: ${templateName}`,
          metaResult.messageId
        );

        return {
          success: true,
          messageId: metaResult.messageId,
          spanId: spanResult.spanId
        };
      } else {
        return {
          success: false,
          error: metaResult.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Processa webhook recebido
   */
  async processWebhook(webhookData: any): Promise<{ success: boolean; processed: number; errors: string[] }> {
    return this.webhookHandler.processWebhook(webhookData);
  }

  /**
   * Gera resposta com LLM e registra no LogLineOS
   */
  async generateLLMResponse(prompt: string, context?: string): Promise<{ success: boolean; response?: string; spanId?: string; error?: string }> {
    try {
      // Aqui você integraria com seu LLM preferido
      // Por enquanto, uma resposta simulada
      const responses = [
        'Entendi sua solicitação. Posso ajudá-lo com isso de forma detalhada.',
        'Vou verificar essas informações para você. Um momento, por favor.',
        'Baseado no que você mencionou, posso sugerir algumas opções interessantes.',
        'Preciso de mais algumas informações para dar continuidade da melhor forma.',
        'Excelente! Vou processar isso imediatamente e retornar com uma resposta completa.'
      ];

      const response = responses[Math.floor(Math.random() * responses.length)];

      // Registra no LogLineOS
      const spanResult = await this.logLineService.logLLMResponse(prompt, response, 'gpt-4');

      return {
        success: true,
        response,
        spanId: spanResult.spanId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro na geração de resposta'
      };
    }
  }

  /**
   * Obtém serviços individuais para uso direto
   */
  getServices() {
    return {
      meta: this.metaService,
      logLine: this.logLineService,
      webhook: this.webhookHandler
    };
  }
}

export { IntegrationBridge };