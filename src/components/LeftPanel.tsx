import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Menu, X, User, Clock, CreditCard, FileText, Shield, Activity, ChevronLeft, MessageSquare, Trash2 } from 'lucide-react';

export const LeftPanel: React.FC = () => {
  const { leftPanelOpen, setLeftPanelOpen, rightPanelOpen, userProfile, setCurrentThread, addMessage, darkMode, currentScreen, messages, deleteThread, clearAllMessages } = useApp();
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleMenuClick = (topic: string) => {
    setCurrentThread(topic);
    
    // Adiciona mensagem do usuário
    addMessage({
      author: 'user',
      content: topic,
      threadId: topic
    });
    
    // Adiciona resposta contextual do sistema
    setTimeout(() => {
      const contextualResponses: Record<string, string> = {
        'Conta Corrente': `Aqui estão as informações da sua conta corrente:

**Saldo atual:** R$ 2.847,50
**Últimas movimentações:**
• Pagamento recebido - João Silva - R$ 1.200,00
• Taxa de administração - R$ 45,00
• Depósito - Maria Santos - R$ 800,00

Posso ajudá-lo com alguma consulta específica sobre sua conta?`,
        
        'Horários de Operação': `**Horários de funcionamento:**

🕘 **Segunda a Sexta:** 8h às 18h
🕘 **Sábados:** 8h às 12h
🚫 **Domingos e feriados:** Fechado

**Atendimento de emergência:** 24h via WhatsApp
**Plantão de finais de semana:** Apenas para urgências

Precisa agendar algum atendimento?`,
        
        'Pagamentos': `**Central de Pagamentos**

💳 **Formas aceitas:**
• PIX (instantâneo)
• Cartão de crédito/débito
• Transferência bancária
• Boleto bancário

📋 **Pendências atuais:**
• João Silva - Aluguel Janeiro - R$ 1.200,00 (vence hoje)
• Maria Santos - Taxa condomínio - R$ 350,00 (em dia)

Quer processar algum pagamento agora?`,
        
        'Documentos Pessoais': `🔒 **Área de Documentos Pessoais**

**Documentos disponíveis:**
• RG digitalizado ✅
• CPF ✅  
• Comprovante de renda ✅
• Comprovante de residência ⚠️ (vence em 15 dias)

**Contratos ativos:**
• Locação Residencial - Apt 101 ✅
• Seguro Residencial ✅

Precisa atualizar algum documento ou quer acessar seus contratos?`,
        
        'Presença / Acesso atual': `📍 **Status de Presença e Acesso**

**Seu status atual:** 🟢 Online
**Último acesso:** Hoje às 14:22
**Localização:** Recepção - Terminal 01

**Histórico recente:**
• 14:22 - Login no sistema
• 14:15 - Acesso físico - Portaria
• 13:45 - Logout automático

**Permissões ativas:**
• Acesso ao prédio: ✅
• Sistema de contratos: ✅
• Área administrativa: ✅

Precisa de ajuda com algum acesso ou permissão?`
      };
      
      const response = contextualResponses[topic] || `Você acessou: **${topic}**. Como posso ajudá-lo com isso hoje?`;
      
      addMessage({
        author: 'system',
        content: response,
        threadId: topic
      });
    }, 500);
  };

  // Get unique chat threads from messages
  const getChatThreads = () => {
    const threads = new Set<string>();
    messages.forEach(msg => {
      if (msg.threadId) {
        threads.add(msg.threadId);
      }
    });
    return Array.from(threads);
  };

  const clearChatHistory = () => {
    if (confirm('Tem certeza que deseja limpar todo o histórico do chat?')) {
      clearAllMessages()
    }
  }

  const handleDeleteThread = (thread: string) => {
    if (confirm(`Tem certeza que deseja excluir a conversa "${thread}"?`)) {
      deleteThread(thread)
    }
  };

  // Touch/Mouse handlers for swipe gesture
  const handleStart = (clientX: number) => {
    setStartX(clientX);
    setCurrentX(clientX);
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    setCurrentX(clientX);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    const deltaX = currentX - startX;
    const threshold = 100;

    if (leftPanelOpen && deltaX < -threshold) {
      setLeftPanelOpen(false);
    } else if (!leftPanelOpen && deltaX > threshold) {
      setLeftPanelOpen(true);
    }

    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, currentX, startX]);

  if (!leftPanelOpen) {
    // Don't show button if right panel is open
    if (rightPanelOpen) return null;
    
    return (
      <button
        onClick={() => setLeftPanelOpen(true)}
        className={`fixed top-4 left-4 z-50 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-600' : 'bg-white text-gray-700 border-gray-200'} p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border`}
      >
        <Menu size={20} />
      </button>
    );
  }

  const translateX = isDragging ? Math.min(0, currentX - startX) : 0;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 ${darkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'} z-30 transition-opacity duration-300 ${
          leftPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setLeftPanelOpen(false)}
      />
      
      {/* Panel */}
      <div 
        className={`fixed left-0 top-0 h-full w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl z-40 flex flex-col transition-transform duration-300 ease-out`}
        style={{ transform: `translateX(${translateX}px)` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700 bg-gradient-to-r from-blue-900 to-purple-900' : 'border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Menu</h2>
            <button
              onClick={() => setLeftPanelOpen(false)}
              className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-white hover:bg-opacity-50'} rounded-lg transition-colors`}
            >
              <ChevronLeft size={20} className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className={`w-12 h-12 rounded-full object-cover border-2 ${darkMode ? 'border-gray-600' : 'border-white'} shadow-sm`}
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{userProfile.name}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{userProfile.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <nav className="space-y-1">
              <button
                onClick={() => handleMenuClick('Conta Corrente')}
                className={`w-full flex items-center space-x-2 p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} transition-colors text-left text-sm`}
              >
                <CreditCard size={16} className="text-green-600" />
                <span>Conta Corrente</span>
              </button>

              <button
                onClick={() => handleMenuClick('Horários de Operação')}
                className={`w-full flex items-center space-x-2 p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} transition-colors text-left text-sm`}
              >
                <Clock size={16} className="text-blue-600" />
                <span>Horários de Operação</span>
              </button>

              <button
                onClick={() => handleMenuClick('Pagamentos')}
                className={`w-full flex items-center space-x-2 p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} transition-colors text-left text-sm`}
              >
                <CreditCard size={16} className="text-purple-600" />
                <span>Pagamentos</span>
              </button>

              <button
                onClick={() => handleMenuClick('Documentos Pessoais')}
                className={`w-full flex items-center space-x-2 p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} transition-colors text-left text-sm`}
              >
                <div className="flex items-center space-x-1">
                  <FileText size={16} className="text-orange-600" />
                  <Shield size={12} className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <span>Documentos Pessoais</span>
              </button>

              <button
                onClick={() => handleMenuClick('Presença / Acesso atual')}
                className={`w-full flex items-center space-x-2 p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} transition-colors text-left text-sm`}
              >
                <Activity size={16} className="text-red-600" />
                <span>Presença / Acesso</span>
              </button>
            </nav>

            {/* Chat History Section - Only show when in chat screen */}
            {currentScreen === 'chat' && (
              <div className={`mt-6 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wide`}>
                    Histórico do Chat
                  </h3>
                  <button
                    onClick={clearChatHistory}
                    className={`p-1 ${darkMode ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-100 text-gray-400'} rounded transition-colors`}
                    title="Limpar histórico"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className="space-y-1">
                  <button
                    onClick={() => setCurrentThread(null)}
                    className={`w-full flex items-center space-x-2 p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} transition-colors text-left text-sm`}
                  >
                    <MessageSquare size={16} className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span>Chat Principal</span>
                  </button>
                  
                  {getChatThreads().map((thread) => (
                    <div
                      key={thread}
                      className={`w-full flex items-center space-x-2 p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} transition-colors text-left text-sm group`}
                    >
                      <MessageSquare size={16} className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <button
                        onClick={() => setCurrentThread(thread)}
                        className="flex-1 text-left truncate"
                      >
                        {thread}
                      </button>
                      <button
                        onClick={() => handleDeleteThread(thread)}
                        className={`opacity-0 group-hover:opacity-100 p-1 ${darkMode ? 'hover:bg-red-800 text-red-400' : 'hover:bg-red-100 text-red-600'} rounded transition-all`}
                        title="Excluir conversa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-100 bg-gray-50'}`}>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>
            Minicontratos v1.0 • Seguro e confiável
          </p>
        </div>
      </div>
    </>
  );
};