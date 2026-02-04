import { useApp } from '../contexts/AppContext';
import { useIntegration } from './useIntegration';

export function useTaskActions() {
  const { setCurrentScreen, setSelectedChat, whatsappChats, addMessage } = useApp();
  const { sendWhatsAppMessage } = useIntegration();

  const executeTaskAction = async (action: any) => {
    switch (action.type) {
      case 'whatsapp':
        try {
          // Try to send via integration first
          const result = await sendWhatsAppMessage(action.data.phone, action.data.message);
          
          if (result.success) {
            // Show success message
            addMessage({
              author: 'system',
              content: `✅ WhatsApp enviado com sucesso para ${action.data.phone}!\n\nMensagem: "${action.data.message}"`
            });
          } else {
            // Fallback to opening WhatsApp chat
            const existingChat = whatsappChats.find(chat => 
              chat.name.toLowerCase().includes(action.data.phone.slice(-4))
            );
            
            if (existingChat) {
              setSelectedChat(existingChat);
              setCurrentScreen('whatsapp');
            }
            
            addMessage({
              author: 'system',
              content: `📱 Abrindo WhatsApp para enviar: "${action.data.message}"`
            });
          }
        } catch (error) {
          console.error('WhatsApp action failed:', error);
          addMessage({
            author: 'system',
            content: `❌ Erro ao enviar WhatsApp. Tente novamente.`
          });
        }
        break;

      case 'call':
        // Open phone dialer or show call interface
        if (navigator.userAgent.includes('Mobile')) {
          window.open(`tel:${action.data.phone}`);
        } else {
          addMessage({
            author: 'system',
            content: `📞 **Ligação para ${action.data.name}**\n\nTelefone: ${action.data.phone}\n\n*Em dispositivos móveis, isso abriria o discador automaticamente.*`
          });
        }
        break;

      case 'schedule':
        // Create a scheduling interface or integrate with calendar
        addMessage({
          author: 'system',
          content: `📅 **Agendamento - ${action.data.contact}**\n\nTipo: ${action.data.type}\n\n**Horários disponíveis:**\n• Hoje às 14:00\n• Amanhã às 10:00\n• Sexta às 16:00\n\nQual horário prefere?`
        });
        setCurrentScreen('chat');
        break;

      case 'email':
        // Open email client or show email interface
        const emailSubject = encodeURIComponent(action.data.subject || 'Assunto');
        const emailBody = encodeURIComponent(action.data.body || '');
        window.open(`mailto:${action.data.email}?subject=${emailSubject}&body=${emailBody}`);
        break;

      case 'navigate':
        // Navigate to specific screen or section
        if (action.data.screen) {
          setCurrentScreen(action.data.screen);
        }
        if (action.data.message) {
          addMessage({
            author: 'system',
            content: action.data.message
          });
        }
        break;

      default:
        console.warn('Unknown action type:', action.type);
    }
  };

  return { executeTaskAction };
}