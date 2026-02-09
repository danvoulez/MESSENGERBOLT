import { WhatsAppChat, WhatsAppMessage } from '../types';

export interface QuickReply {
  text: string;
  tone: 'professional' | 'friendly' | 'formal' | 'urgent';
  action?: string;
  confidence: number; // 0-1
}

export interface ConversationSummary {
  clientName: string;
  topic: string;
  status: 'pending' | 'in_progress' | 'resolved';
  urgency: 'low' | 'medium' | 'high';
  actionItems: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

class WhatsAppAIService {
  /**
   * Generate contextual quick replies based on conversation
   */
  async generateQuickReplies(
    chat: WhatsAppChat,
    lastMessages: WhatsAppMessage[]
  ): Promise<QuickReply[]> {
    const replies: QuickReply[] = [];

    // Get last client message
    const lastClientMessage = lastMessages
      .filter(m => !m.isOwn)
      .slice(-1)[0];

    if (!lastClientMessage) {
      // Default replies when no message
      return [
        { text: 'Olá! Como posso ajudar?', tone: 'friendly', confidence: 0.9 },
        { text: 'Boa tarde! Em que posso ser útil?', tone: 'professional', confidence: 0.9 },
        { text: 'Tudo bem? Posso ajudar com algo?', tone: 'friendly', confidence: 0.8 }
      ];
    }

    const content = lastClientMessage.content.toLowerCase();

    // Question detection
    if (content.includes('?') || content.includes('pode') || content.includes('como')) {
      replies.push({
        text: 'Claro! Deixe-me verificar isso para você.',
        tone: 'professional',
        confidence: 0.85
      });
      replies.push({
        text: 'Sim, posso ajudar. Vou buscar as informações.',
        tone: 'friendly',
        confidence: 0.8
      });
    }

    // Confirmation/agreement
    if (content.includes('ok') || content.includes('sim') || content.includes('pode ser')) {
      replies.push({
        text: 'Perfeito! Vou dar continuidade.',
        tone: 'professional',
        confidence: 0.9
      });
      replies.push({
        text: 'Ótimo! Obrigado pela confirmação.',
        tone: 'friendly',
        confidence: 0.85
      });
    }

    // Request for document/information
    if (content.includes('documento') || content.includes('enviar') || content.includes('anexo')) {
      replies.push({
        text: 'Pode enviar sim! Estou aguardando.',
        tone: 'professional',
        confidence: 0.9
      });
      replies.push({
        text: 'Claro! Por favor, envie quando puder.',
        tone: 'friendly',
        confidence: 0.85
      });
    }

    // Urgency
    if (content.includes('urgente') || content.includes('rápido') || content.includes('agora')) {
      replies.push({
        text: 'Entendo a urgência. Vou priorizar isso.',
        tone: 'professional',
        confidence: 0.95,
        action: 'create_urgent_task'
      });
      replies.push({
        text: 'Vou resolver isso com prioridade máxima.',
        tone: 'urgent',
        confidence: 0.9,
        action: 'create_urgent_task'
      });
    }

    // Gratitude
    if (content.includes('obrigad') || content.includes('valeu')) {
      replies.push({
        text: 'Por nada! Estou à disposição. 😊',
        tone: 'friendly',
        confidence: 0.95
      });
      replies.push({
        text: 'Sempre às ordens! Qualquer coisa, é só chamar.',
        tone: 'friendly',
        confidence: 0.9
      });
    }

    // Default fallback
    if (replies.length === 0) {
      replies.push({
        text: 'Entendi. Vou verificar e te retorno em breve.',
        tone: 'professional',
        confidence: 0.7
      });
      replies.push({
        text: 'Ok! Vou analisar e já respondo.',
        tone: 'friendly',
        confidence: 0.65
      });
    }

    // Sort by confidence
    return replies.sort((a, b) => b.confidence - a.confidence).slice(0, 4);
  }

  /**
   * Analyze conversation and generate summary
   */
  analyzeConversation(
    chat: WhatsAppChat,
    messages: WhatsAppMessage[]
  ): ConversationSummary {
    const clientMessages = messages.filter(m => !m.isOwn);
    const recentMessages = messages.slice(-10);

    // Detect topic
    let topic = 'General inquiry';
    const allContent = recentMessages.map(m => m.content.toLowerCase()).join(' ');
    
    if (allContent.includes('contrato') || allContent.includes('contract')) {
      topic = 'Contract discussion';
    } else if (allContent.includes('pagamento') || allContent.includes('payment')) {
      topic = 'Payment';
    } else if (allContent.includes('documento') || allContent.includes('document')) {
      topic = 'Documentation';
    } else if (allContent.includes('vistoria') || allContent.includes('inspection')) {
      topic = 'Property inspection';
    }

    // Detect urgency
    const urgentKeywords = ['urgente', 'rápido', 'agora', 'hoje', 'emergency'];
    const hasUrgentKeywords = urgentKeywords.some(kw => allContent.includes(kw));
    const urgency: 'low' | 'medium' | 'high' = hasUrgentKeywords ? 'high' : 
                                                clientMessages.length > 5 ? 'medium' : 'low';

    // Detect sentiment
    const positiveKeywords = ['obrigad', 'ótimo', 'perfeito', 'excelente', '😊', '👍'];
    const negativeKeywords = ['problema', 'erro', 'ruim', 'demora', 'reclamação'];
    
    const positiveCount = positiveKeywords.filter(kw => allContent.includes(kw)).length;
    const negativeCount = negativeKeywords.filter(kw => allContent.includes(kw)).length;
    
    let sentiment: 'positive' | 'neutral' | 'negative';
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }

    // Extract action items
    const actionItems: string[] = [];
    if (allContent.includes('enviar') || allContent.includes('send')) {
      actionItems.push('Send requested document');
    }
    if (allContent.includes('ligar') || allContent.includes('call')) {
      actionItems.push('Schedule call with client');
    }
    if (allContent.includes('reunião') || allContent.includes('meeting')) {
      actionItems.push('Schedule meeting');
    }

    return {
      clientName: chat.name,
      topic,
      status: actionItems.length > 0 ? 'pending' : 'in_progress',
      urgency,
      actionItems,
      sentiment
    };
  }

  /**
   * Detect if client is waiting for response
   */
  isAwaitingResponse(messages: WhatsAppMessage[]): boolean {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return false;

    // Client sent last message
    if (!lastMessage.isOwn) {
      const timeSinceLastMessage = Date.now() - lastMessage.timestamp.getTime();
      const minutesSince = timeSinceLastMessage / 1000 / 60;
      
      // If client sent message more than 10 minutes ago, they're probably waiting
      return minutesSince > 10;
    }

    return false;
  }
}

export const whatsappAIService = new WhatsAppAIService();
