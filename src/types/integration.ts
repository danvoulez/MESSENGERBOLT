export interface MetaWhatsAppConfig {
  accessToken: string;
  phoneId: string;
  businessId: string;
  webhookUrl: string;
}

export interface LogLineOSConfig {
  baseUrl: string;
  agentId: string;
  secretKey: string;
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'template';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  externalId?: string;
}

export interface LogLineSpan {
  type: 'whatsapp_message' | 'llm_response' | 'request_call';
  actor: string;
  content: string;
  timestamp: string;
  meta?: Record<string, any>;
}

export interface WebhookEvent {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        messages?: Array<{
          id: string;
          from: string;
          timestamp: string;
          text?: { body: string };
          type: string;
        }>;
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}