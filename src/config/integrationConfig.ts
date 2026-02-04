import { MetaWhatsAppConfig, LogLineOSConfig } from '../types/integration';

// Configuração para desenvolvimento/teste
export const DEV_META_CONFIG: MetaWhatsAppConfig = {
  accessToken: import.meta.env.VITE_META_ACCESS_TOKEN || 'your_meta_access_token_here',
  phoneId: import.meta.env.VITE_META_PHONE_ID || 'your_phone_id_here',
  businessId: import.meta.env.VITE_META_BUSINESS_ID || 'your_business_id_here',
  webhookUrl: import.meta.env.VITE_WEBHOOK_URL || 'https://your-domain.com/webhook'
};

export const DEV_LOGLINE_CONFIG: LogLineOSConfig = {
  baseUrl: import.meta.env.VITE_LOGLINE_BASE_URL || 'http://localhost:8888',
  agentId: import.meta.env.VITE_LOGLINE_AGENT_ID || 'agent:minicontratos',
  secretKey: import.meta.env.VITE_LOGLINE_SECRET_KEY || 'your_secret_key_here'
};

// Configuração para produção
export const PROD_META_CONFIG: MetaWhatsAppConfig = {
  accessToken: import.meta.env.VITE_META_ACCESS_TOKEN!,
  phoneId: import.meta.env.VITE_META_PHONE_ID!,
  businessId: import.meta.env.VITE_META_BUSINESS_ID!,
  webhookUrl: import.meta.env.VITE_WEBHOOK_URL!
};

export const PROD_LOGLINE_CONFIG: LogLineOSConfig = {
  baseUrl: import.meta.env.VITE_LOGLINE_BASE_URL!,
  agentId: import.meta.env.VITE_LOGLINE_AGENT_ID!,
  secretKey: import.meta.env.VITE_LOGLINE_SECRET_KEY!
};

// Função para obter configuração baseada no ambiente
export function getIntegrationConfig() {
  const isDev = import.meta.env.DEV;
  
  return {
    meta: isDev ? DEV_META_CONFIG : PROD_META_CONFIG,
    logLine: isDev ? DEV_LOGLINE_CONFIG : PROD_LOGLINE_CONFIG
  };
}