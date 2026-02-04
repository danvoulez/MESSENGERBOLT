import { WebhookEvent } from '../types/integration';
import { LogLineOSService } from './logLineOSService';

class WebhookHandler {
  private logLineOS: LogLineOSService;

  constructor(logLineOS: LogLineOSService) {
    this.logLineOS = logLineOS;
  }

  /**
   * Processa webhook recebido da Meta
   */
  async processWebhook(event: WebhookEvent): Promise<{ success: boolean; processed: number; errors: string[] }> {
    const errors: string[] = [];
    let processed = 0;

    try {
      for (const entry of event.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            // Processar mensagens recebidas
            if (change.value.messages) {
              for (const message of change.value.messages) {
                try {
                  await this.processIncomingMessage(message, change.value.metadata.phone_number_id);
                  processed++;
                } catch (error) {
                  errors.push(`Erro ao processar mensagem ${message.id}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
                }
              }
            }

            // Processar status de entrega
            if (change.value.statuses) {
              for (const status of change.value.statuses) {
                try {
                  await this.processStatusUpdate(status);
                  processed++;
                } catch (error) {
                  errors.push(`Erro ao processar status ${status.id}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
                }
              }
            }
          }
        }
      }

      return {
        success: errors.length === 0,
        processed,
        errors
      };
    } catch (error) {
      return {
        success: false,
        processed,
        errors: [error instanceof Error ? error.message : 'Erro geral no processamento']
      };
    }
  }

  /**
   * Processa mensagem recebida
   */
  private async processIncomingMessage(message: any, phoneId: string): Promise<void> {
    const content = message.text?.body || '[Mensagem não textual]';
    
    // Registra no LogLineOS
    await this.logLineOS.logWhatsAppMessage(
      message.from,
      phoneId,
      content,
      message.id
    );

    // Aqui você pode adicionar lógica adicional:
    // - Processar comandos
    // - Gerar respostas automáticas
    // - Acionar workflows
    console.log(`Mensagem recebida de ${message.from}: ${content}`);
  }

  /**
   * Processa atualização de status
   */
  private async processStatusUpdate(status: any): Promise<void> {
    // Registra mudança de status no LogLineOS
    await this.logLineOS.sendSpan({
      type: 'whatsapp_message',
      actor: 'system:webhook',
      content: `Status atualizado: ${status.status}`,
      timestamp: new Date().toISOString(),
      meta: {
        message_id: status.id,
        status: status.status,
        recipient: status.recipient_id,
        timestamp: status.timestamp
      }
    });

    console.log(`Status atualizado para mensagem ${status.id}: ${status.status}`);
  }

  /**
   * Valida webhook da Meta (verificação de segurança)
   */
  static validateWebhook(mode: string, token: string, challenge: string, verifyToken: string): string | null {
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    return null;
  }
}

export { WebhookHandler };