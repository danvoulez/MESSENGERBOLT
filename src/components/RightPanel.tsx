import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useTaskActions } from '../hooks/useTaskActions';
import { taskIntelligenceService } from '../services/taskIntelligenceService';
import { whatsappAIService, QuickReply, ConversationSummary } from '../services/whatsappAIService';
import { AlertCircle, CheckCircle, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export const RightPanel: React.FC = () => {
  const { tasks, currentScreen, rightPanelOpen, setRightPanelOpen, leftPanelOpen, darkMode, completeTask, selectedChat, whatsappMessages } = useApp();
  const { executeTaskAction } = useTaskActions();
  
  // AI state
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [conversationSummary, setConversationSummary] = useState<ConversationSummary | null>(null);
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);

  // Generate AI suggestions for WhatsApp
  useEffect(() => {
    if (currentScreen === 'whatsapp' && selectedChat && whatsappMessages.length > 0) {
      // Generate quick replies
      whatsappAIService.generateQuickReplies(selectedChat, whatsappMessages).then(replies => {
        setQuickReplies(replies);
      });
      
      // Analyze conversation
      const summary = whatsappAIService.analyzeConversation(selectedChat, whatsappMessages);
      setConversationSummary(summary);
      
      // Check if awaiting response
      const awaiting = whatsappAIService.isAwaitingResponse(whatsappMessages);
      setIsAwaitingResponse(awaiting);
    }
  }, [currentScreen, selectedChat, whatsappMessages]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'medium':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <CheckCircle size={16} className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    if (darkMode) {
      switch (priority) {
        case 'urgent':
          return 'border-l-red-500 bg-red-900 bg-opacity-20 hover:bg-red-900 hover:bg-opacity-30';
        case 'medium':
          return 'border-l-yellow-500 bg-yellow-900 bg-opacity-20 hover:bg-yellow-900 hover:bg-opacity-30';
        default:
          return 'border-l-gray-500 bg-gray-800 hover:bg-gray-700';
      }
    } else {
      switch (priority) {
        case 'urgent':
          return 'border-l-red-500 bg-red-50 hover:bg-red-100';
        case 'medium':
          return 'border-l-yellow-500 bg-yellow-50 hover:bg-yellow-100';
        default:
          return 'border-l-gray-500 bg-gray-50 hover:bg-gray-100';
      }
    }
  };

  if (!rightPanelOpen) {
    // Don't show button if left panel is open
    if (leftPanelOpen) return null;
    
    // Check if there are urgent tasks
    const hasUrgentTasks = tasks.some(task => task.priority === 'urgent' && !task.completed);
    
    return (
      <button
        onClick={() => setRightPanelOpen(true)}
        className={`fixed top-4 right-4 z-50 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-600' : 'bg-white text-gray-700 border-gray-200'} p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border`}
      >
        {hasUrgentTasks ? (
          <div className="w-5 h-5 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
        ) : (
          <ChevronLeft size={20} />
        )}
      </button>
    );
  }

  const getContent = () => {
    if (currentScreen === 'whatsapp') {
      return {
        title: 'Assistente IA',
        subtitle: 'Sugestões para o chat atual',
        content: (
          <div className="space-y-4">
            {/* Waiting indicator */}
            {isAwaitingResponse && (
              <div className={`${darkMode ? 'bg-yellow-900 bg-opacity-30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-xl p-4`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className={`font-medium ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>⏰ Cliente aguardando</h4>
                  <Clock size={16} className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                </div>
                <p className={`text-sm ${darkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>
                  Cliente enviou última mensagem há mais de 10 minutos
                </p>
              </div>
            )}

            {/* Quick Replies */}
            {quickReplies.length > 0 && (
              <div>
                <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>⚡ Respostas Rápidas</h4>
                <div className="space-y-2">
                  {quickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        // TODO: Insert reply into message input
                        console.log('Quick reply selected:', reply.text);
                      }}
                      className={`w-full text-left p-3 ${darkMode ? 'bg-blue-900 bg-opacity-30 border-blue-700 hover:bg-opacity-40' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'} border rounded-lg transition-colors`}
                    >
                      <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>{reply.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{reply.tone}</span>
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {Math.round(reply.confidence * 100)}% confiança
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Summary */}
            {conversationSummary && (
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-xl p-4`}>
                <h4 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>📊 Resumo da Conversa</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Tópico:</span>
                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{conversationSummary.topic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Status:</span>
                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{conversationSummary.status}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Urgência:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      conversationSummary.urgency === 'high' ? 'bg-red-500 text-white' :
                      conversationSummary.urgency === 'medium' ? 'bg-yellow-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {conversationSummary.urgency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Sentimento:</span>
                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {conversationSummary.sentiment === 'positive' ? '😊 Positivo' :
                       conversationSummary.sentiment === 'negative' ? '😟 Negativo' :
                       '😐 Neutro'}
                    </span>
                  </div>
                </div>
                {conversationSummary.actionItems.length > 0 && (
                  <div className="mt-3">
                    <p className={`text-xs font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ações Pendentes:</p>
                    <ul className="text-xs space-y-1">
                      {conversationSummary.actionItems.map((item, idx) => (
                        <li key={idx} className={darkMode ? 'text-gray-300' : 'text-gray-700'}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      };
    }

    if (currentScreen === 'new') {
      return {
        title: 'Assistente de Contratos',
        subtitle: 'Dicas e validações',
        content: (
          <div className="space-y-4">
            <div className={`${darkMode ? 'bg-blue-900 bg-opacity-30 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-xl p-4 hover:bg-opacity-40 transition-colors`}>
              <div className="flex items-start justify-between mb-2">
                <h4 className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>Dica de Preenchimento</h4>
                <span className={`text-xs ${darkMode ? 'text-blue-400 bg-blue-800' : 'text-blue-600 bg-blue-200'} px-2 py-1 rounded-full`}>IA</span>
              </div>
              <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'} mb-3 leading-relaxed`}>
                Use linguagem clara e objetiva. Evite termos técnicos desnecessários.
              </p>
            </div>

            <div className={`${darkMode ? 'bg-green-900 bg-opacity-30 border-green-700' : 'bg-green-50 border-green-200'} border rounded-xl p-4 hover:bg-opacity-40 transition-colors`}>
              <div className="flex items-start justify-between mb-2">
                <h4 className={`font-medium ${darkMode ? 'text-green-300' : 'text-green-800'}`}>Modelo Sugerido</h4>
                <CheckCircle size={16} className={`${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <p className={`text-sm ${darkMode ? 'text-green-200' : 'text-green-700'} mb-3`}>
                Contrato de locação residencial padrão disponível
              </p>
              <button className={`w-full px-3 py-1.5 ${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white text-sm rounded-lg transition-colors`}>
                Aplicar Modelo
              </button>
            </div>

            <div className={`${darkMode ? 'bg-yellow-900 bg-opacity-30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-xl p-4 hover:bg-opacity-40 transition-colors`}>
              <div className="flex items-start justify-between mb-2">
                <h4 className={`font-medium ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>Validação</h4>
                <AlertCircle size={16} className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              </div>
              <p className={`text-sm ${darkMode ? 'text-yellow-200' : 'text-yellow-700'} mb-2`}>
                Certifique-se de preencher todos os campos obrigatórios
              </p>
              <div className={`text-xs ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} space-y-1`}>
                <div>• Quem (Who) - obrigatório</div>
                <div>• Fez (Did) - obrigatório</div>
                <div>• Objeto (This) - obrigatório</div>
                <div>• Quando (When) - obrigatório</div>
              </div>
            </div>
          </div>
        )
      };
    }

    // Default chat content with intelligent task sorting
    const sortedTasks = taskIntelligenceService.sortByIntelligence(tasks);
    const urgentTasks = sortedTasks.filter(t => !t.completed && t.priority === 'urgent');
    const incompleteTasks = sortedTasks.filter(task => !task.completed);
    
    return {
      title: 'Lista de Tarefas',
      subtitle: 'Curadas por IA',
      content: (
        <div className="space-y-3">
          {/* Urgent Tasks Section */}
          {urgentTasks.length > 0 && (
            <div className="mb-4">
              <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                🚨 URGENTE ({urgentTasks.length})
              </h3>
            </div>
          )}
          
          {incompleteTasks.map((task) => {
            const analysis = taskIntelligenceService.analyzeUrgency(task);
            const actions = taskIntelligenceService.generateQuickActions(task);
            
            return (
              <div
                key={task.id}
                className={`border-l-4 rounded-xl p-4 transition-all duration-200 cursor-pointer ${getPriorityColor(task.priority)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getPriorityIcon(task.priority)}
                    <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wide`}>
                      {task.category}
                    </span>
                    {task.priority === 'urgent' && (
                      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">
                        {analysis.score}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => completeTask(task.id)}
                      className={`w-5 h-5 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                        task.priority === 'urgent' 
                          ? 'border-red-400 hover:bg-red-400' 
                          : task.priority === 'medium'
                          ? 'border-yellow-400 hover:bg-yellow-400'
                          : 'border-gray-400 hover:bg-gray-400'
                      }`}
                      title="Marcar como resolvida"
                    />
                    <ArrowRight size={14} className={`${darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'} transition-colors`} />
                  </div>
                </div>
                
                <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-2 leading-relaxed`}>
                  {task.description}
                </p>
                
                {/* Time estimate */}
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
                  ⏱️ {analysis.estimatedTimeToComplete}
                </p>
                
                {/* Quick actions */}
                {task.priority === 'urgent' && actions.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {actions.slice(0, 2).map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (action.action === 'complete') {
                            completeTask(task.id);
                          } else if (action.data?.screen) {
                            // TODO: Navigate to screen
                            console.log('Navigate to:', action.data.screen);
                          }
                        }}
                        className={`text-xs px-3 py-1.5 ${
                          action.action === 'complete'
                            ? darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'
                            : darkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
                        } text-white rounded-lg transition-colors`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                
                {task.suggestion && (
                  <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white bg-opacity-50 border-gray-200'} rounded-lg p-2 border mt-3`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1 font-medium`}>Sugestão da IA:</p>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex-1`}>{task.suggestion}</p>
                      {task.suggestionAction && (
                        <button
                          onClick={() => executeTaskAction(task.suggestionAction)}
                          className={`ml-2 px-2 py-1 text-xs ${
                          task.priority === 'urgent' 
                            ? darkMode ? 'bg-red-700 hover:bg-red-600 text-red-100' : 'bg-red-600 hover:bg-red-700 text-white'
                            : task.priority === 'medium'
                            ? darkMode ? 'bg-yellow-700 hover:bg-yellow-600 text-yellow-100' : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            : darkMode ? 'bg-blue-700 hover:bg-blue-600 text-blue-100' : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } rounded transition-colors font-medium`}
                        >
                          {task.suggestionAction.label}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          <div className={`mt-6 p-4 ${darkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900 border-blue-700' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'} rounded-xl border`}>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <h4 className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>Sistema Runtime</h4>
            </div>
            <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'} leading-relaxed`}>
              Monitorando contratos, prazos e pendências em tempo real
            </p>
            <div className={`mt-2 text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              Última atualização: agora
            </div>
          </div>
        </div>
      )
    };
  };

  const { title, subtitle, content } = getContent();

  return (
    <div className={`fixed right-0 top-0 h-full w-80 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-2xl z-40 flex flex-col transition-transform duration-300 ease-out ${rightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
        <div>
          <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{title}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</p>
        </div>
        <button
          onClick={() => setRightPanelOpen(false)}
          className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
        >
          <ChevronRight size={16} className={`${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
        </button>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {content}
      </div>
    </div>
  );
};