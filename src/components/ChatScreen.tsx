import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Send, Sparkles, FileText, Calendar, User, MessageSquare } from 'lucide-react';

export const ChatScreen: React.FC = () => {
  const { 
    messages, 
    addMessage, 
    darkMode, 
    userProfile, 
    currentThread,
    setCurrentThread 
  } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    await addMessage({
      author: 'user',
      content: userMessage,
      threadId: currentThread || undefined
    });

    // Show typing indicator
    setIsTyping(true);

    // Simulate AI response
    setTimeout(async () => {
      setIsTyping(false);
      
      const responses = [
        `Entendi sua solicitação sobre "${userMessage}". Vou processar isso para você.`,
        `Baseado no que você mencionou, posso sugerir algumas opções interessantes.`,
        `Vou verificar essas informações e retornar com uma resposta completa.`,
        `Excelente pergunta! Deixe-me analisar isso detalhadamente.`,
        `Posso ajudá-lo com isso. Vou buscar as informações mais atualizadas.`
      ];

      const response = responses[Math.floor(Math.random() * responses.length)];
      
      await addMessage({
        author: 'system',
        content: response,
        threadId: currentThread || undefined
      });
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getThreadTitle = () => {
    if (!currentThread) return 'Chat Principal';
    return currentThread;
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className={`w-10 h-10 ${darkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'} rounded-full flex items-center justify-center`}>
              <MessageSquare size={20} className="text-white" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h1 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {getThreadTitle()}
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentThread ? 'Conversa específica' : 'Assistente IA • Online'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}>
            <FileText size={20} className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
          <button className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}>
            <Calendar size={20} className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
          <button className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}>
            <User size={20} className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && !currentThread && (
          <div className="text-center py-12">
            <div className={`w-16 h-16 ${darkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'} rounded-full mx-auto mb-4 flex items-center justify-center`}>
              <Sparkles size={24} className="text-white" />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Assistente IA do Minicontratos
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-md mx-auto`}>
              Posso ajudá-lo com contratos, tarefas, WhatsApp e muito mais. Como posso ajudar hoje?
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.author === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
              message.author === 'user'
                ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                : darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'
            } rounded-2xl px-4 py-3 shadow-sm`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              <div className={`text-xs mt-2 ${
                message.author === 'user'
                  ? 'text-blue-100'
                  : darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
              darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'
            } rounded-2xl px-4 py-3 shadow-sm`}>
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">Digitando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t p-4`}>
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className={`w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500'} border rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`p-3 ${
              input.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
            } rounded-xl transition-colors disabled:cursor-not-allowed`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};