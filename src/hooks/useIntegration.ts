import { useState, useEffect, useCallback } from 'react';
import { IntegrationBridge } from '../services/integrationBridge';
import { getIntegrationConfig } from '../config/integrationConfig';

export function useIntegration() {
  const [bridge, setBridge] = useState<IntegrationBridge | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const config = getIntegrationConfig();
      const integrationBridge = new IntegrationBridge(config.meta, config.logLine);
      setBridge(integrationBridge);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao inicializar integração');
      setIsConnected(false);
    }
  }, []);

  const sendWhatsAppMessage = useCallback(async (to: string, message: string) => {
    if (!bridge) {
      throw new Error('Integração não inicializada');
    }
    return bridge.sendMessage(to, message);
  }, [bridge]);

  const sendWhatsAppTemplate = useCallback(async (to: string, templateName: string, parameters: string[]) => {
    if (!bridge) {
      throw new Error('Integração não inicializada');
    }
    return bridge.sendTemplate(to, templateName, parameters);
  }, [bridge]);

  const generateAIResponse = useCallback(async (prompt: string, context?: string) => {
    if (!bridge) {
      throw new Error('Integração não inicializada');
    }
    return bridge.generateLLMResponse(prompt, context);
  }, [bridge]);

  const processWebhook = useCallback(async (webhookData: any) => {
    if (!bridge) {
      throw new Error('Integração não inicializada');
    }
    return bridge.processWebhook(webhookData);
  }, [bridge]);

  return {
    bridge,
    isConnected,
    error,
    sendWhatsAppMessage,
    sendWhatsAppTemplate,
    generateAIResponse,
    processWebhook
  };
}