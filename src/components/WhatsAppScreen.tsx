import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { 
  Search, 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  Mic,
  ArrowLeft,
  StickyNote,
  Zap,
  Pin,
  ThumbsUp,
  Star,
  Archive,
  Trash2
} from 'lucide-react';

export const WhatsAppScreen: React.FC = () => {
  const { 
    whatsappChats, 
    selectedChat, 
    setSelectedChat, 
    whatsappMessages, 
    addWhatsappMessage, 
    darkMode 
  } = useApp();
  const { showToast } = useToast();
  
  const [input, setInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('Todos');
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [whatsappMessages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedChat) return;

    const message = input.trim();
    setInput('');

    await addWhatsappMessage({
      sender: 'Você',
      content: message,
      isOwn: true,
      status: 'sent',
      type: 'text'
    });

    // Simulate response
    setTimeout(async () => {
      const responses = [
        'Entendi! Vou verificar isso para você.',
        'Obrigado pela informação. Vou processar agora.',
        'Perfeito! Posso ajudar com mais alguma coisa?',
        'Recebi. Vou dar continuidade ao processo.',
        'Excelente! Tudo certo por aqui.'
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      await addWhatsappMessage({
        sender: selectedChat.name,
        content: response,
        isOwn: false,
        status: 'delivered',
        type: 'text'
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

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}min`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 1440)}d`;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Zap size={14} className="text-red-500" />;
      case 'medium':
        return <Star size={14} className="text-yellow-500" />;
      default:
        return null;
    }
  };

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      'Cliente': 'bg-blue-100 text-blue-800',
      'Fornecedor': 'bg-green-100 text-green-800',
      'Urgente': 'bg-red-100 text-red-800',
      'Contrato': 'bg-purple-100 text-purple-800',
      'Pagamento': 'bg-yellow-100 text-yellow-800',
      'Suporte': 'bg-gray-100 text-gray-800'
    };
    return colors[tag] || 'bg-gray-100 text-gray-800';
  };

  const uniqueTags = ['Todos', ...Array.from(new Set(whatsappChats.flatMap(chat => chat.tags || [])))];

  const filteredChats = whatsappChats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'Todos' || (chat.tags && chat.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  const aiSuggestions = [
    'Olá! Como posso ajudá-lo hoje?',
    'Recebi sua solicitação e vou processar.',
    'Posso agendar uma reunião para discutirmos?',
    'Vou verificar essas informações e retorno.',
    'Obrigado pelo contato! Vou analisar.'
  ];

  const insertSuggestion = (suggestion: string) => {
    setInput(suggestion);
    setShowAISuggestions(false);
  };

  const handlePhoneCall = () => {
    showToast(`Iniciando chamada de voz para ${selectedChat?.name}...`, 'info');
    setTimeout(() => {
      showToast('Chamada conectada!', 'success');
    }, 2000);
  };

  const handleVideoCall = () => {
    showToast(`Iniciando chamada de vídeo para ${selectedChat?.name}...`, 'info');
    setTimeout(() => {
      showToast('Chamada de vídeo conectada!', 'success');
    }, 2000);
  };

  const handleAttachment = () => {
    showToast('Seletor de arquivos será aberto em breve...', 'info');
    // In a real app, this would open a file picker
  };

  const handleEmoji = () => {
    showToast('Seletor de emojis será aberto em breve...', 'info');
    // In a real app, this would open an emoji picker
  };

  const handleVoiceRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      showToast('Gravando mensagem de voz...', 'info');
    } else {
      setIsRecording(false);
      showToast('Mensagem de voz enviada!', 'success');
      // In a real app, this would send the recorded audio
    }
  };

  const handlePinChat = () => {
    showToast(`Chat ${selectedChat?.name} fixado!`, 'success');
  };

  const handleArchiveChat = () => {
    showToast(`Chat ${selectedChat?.name} arquivado!`, 'success');
    setSelectedChat(null);
  };

  const handleDeleteChat = () => {
    if (confirm(`Tem certeza que deseja excluir o chat com ${selectedChat?.name}?`)) {
      showToast(`Chat ${selectedChat?.name} excluído!`, 'success');
      setSelectedChat(null);
    }
  };

  const toggleMessageStar = (messageId: string) => {
    showToast('Mensagem marcada como favorita!', 'success');
  };

  if (!selectedChat) {
    return (
      <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Chat List */}
        <div className={`w-full max-w-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col`}>
          {/* Header */}
          <div className={`p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
            <h1 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              WhatsApp Business
            </h1>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              />
            </div>

            {/* Tags Filter */}
            <div className="flex flex-wrap gap-2">
              {uniqueTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedTag === tag
                      ? 'bg-green-600 text-white'
                      : darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`p-4 cursor-pointer transition-colors ${
                  darkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-50 border-gray-100'
                } border-b`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-semibold truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {chat.name}
                        </h3>
                        {getPriorityIcon(chat.priority || 'low')}
                      </div>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatLastSeen(chat.timestamp)}
                      </span>
                    </div>
                    
                    <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {chat.lastMessage}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex flex-wrap gap-1">
                        {chat.tags?.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className={`px-2 py-0.5 text-xs rounded-full ${getTagColor(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      {chat.unreadCount > 0 && (
                        <span className="bg-green-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        <div className={`flex-1 flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="text-center">
            <div className={`w-24 h-24 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full mx-auto mb-4 flex items-center justify-center`}>
              <Search size={32} className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Selecione uma conversa
            </h3>
            <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Escolha um chat da lista para começar a conversar
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Chat List - Hidden on mobile when chat is selected */}
      <div className={`w-full max-w-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex-col hidden lg:flex`}>
        {/* Same chat list content as above */}
        <div className={`p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
          <h1 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            WhatsApp Business
          </h1>
          
          <div className="relative mb-4">
            <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {uniqueTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedTag === tag
                    ? 'bg-green-600 text-white'
                    : darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 cursor-pointer transition-colors ${
                selectedChat?.id === chat.id
                  ? darkMode ? 'bg-gray-700' : 'bg-green-50'
                  : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              } ${darkMode ? 'border-gray-700' : 'border-gray-100'} border-b`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-semibold truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {chat.name}
                      </h3>
                      {getPriorityIcon(chat.priority || 'low')}
                    </div>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatLastSeen(chat.timestamp)}
                    </span>
                  </div>
                  
                  <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {chat.lastMessage}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-wrap gap-1">
                      {chat.tags?.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className={`px-2 py-0.5 text-xs rounded-full ${getTagColor(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {chat.unreadCount > 0 && (
                      <span className="bg-green-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedChat(null)}
              className={`lg:hidden p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
            >
              <ArrowLeft size={20} className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            
            <div className="relative">
              <img
                src={selectedChat.avatar}
                alt={selectedChat.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <h2 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {selectedChat.name}
                </h2>
                {getPriorityIcon(selectedChat.priority || 'low')}
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Online • Visto por último {formatLastSeen(selectedChat.timestamp)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowChatInfo(!showChatInfo)}
              className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
              title="Informações do chat"
            >
              <StickyNote size={20} className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={handlePhoneCall}
              className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
              title="Chamada de voz"
            >
              <Phone size={20} className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={handleVideoCall}
              className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
              title="Chamada de vídeo"
            >
              <Video size={20} className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
                title="Mais opções"
              >
                <MoreVertical size={20} className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
              
              {showMenu && (
                <div className={`absolute right-0 mt-2 w-48 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg shadow-lg z-10`}>
                  <button
                    onClick={() => { handlePinChat(); setShowMenu(false); }}
                    className={`w-full text-left px-4 py-2 ${darkMode ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-gray-50 text-gray-800'} flex items-center space-x-2 transition-colors`}
                  >
                    <Pin size={16} />
                    <span>Fixar chat</span>
                  </button>
                  <button
                    onClick={() => { handleArchiveChat(); setShowMenu(false); }}
                    className={`w-full text-left px-4 py-2 ${darkMode ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-gray-50 text-gray-800'} flex items-center space-x-2 transition-colors`}
                  >
                    <Archive size={16} />
                    <span>Arquivar chat</span>
                  </button>
                  <button
                    onClick={() => { handleDeleteChat(); setShowMenu(false); }}
                    className={`w-full text-left px-4 py-2 ${darkMode ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-red-50 text-red-600'} flex items-center space-x-2 transition-colors border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
                  >
                    <Trash2 size={16} />
                    <span>Excluir chat</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Info Panel */}
        {showChatInfo && (
          <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'} border-b p-4`}>
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Informações do Contato
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedChat.tags?.map(tag => (
                        <span
                          key={tag}
                          className={`px-2 py-1 text-xs rounded-full ${getTagColor(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Prioridade
                    </h4>
                    <div className="flex items-center space-x-1">
                      {getPriorityIcon(selectedChat.priority || 'low')}
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} capitalize`}>
                        {selectedChat.priority || 'baixa'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Notas
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedChat.notes || 'Nenhuma nota disponível'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {whatsappMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} group`}
            >
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg relative ${
                message.isOwn
                  ? 'bg-green-600 text-white'
                  : darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'
              } rounded-2xl px-4 py-3 shadow-sm`}>
                {!message.isOwn && (
                  <div className="text-xs font-semibold mb-1 text-green-600">
                    {message.sender}
                  </div>
                )}
                
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
                
                <div className={`flex items-center justify-between mt-2 text-xs ${
                  message.isOwn ? 'text-green-100' : darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <span>{formatTime(message.timestamp)}</span>
                  {message.isOwn && (
                    <span className="ml-2">
                      {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>

                {/* Message Actions (appear on hover) */}
                <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                  <button
                    onClick={() => toggleMessageStar(message.id)}
                    className={`p-1 ${message.isPinned ? 'bg-yellow-400' : darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} rounded-full transition-colors`}
                    title="Marcar como favorita"
                  >
                    <Star size={12} className={`${message.isPinned ? 'text-white fill-white' : darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  </button>
                  <button
                    onClick={() => showToast('Reação adicionada!', 'success')}
                    className={`p-1 ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} rounded-full transition-colors`}
                    title="Reagir"
                  >
                    <ThumbsUp size={12} className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* AI Suggestions Panel */}
        {showAISuggestions && (
          <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'} border-t p-4`}>
            <h3 className={`font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Sugestões da IA
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {aiSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => insertSuggestion(suggestion)}
                  className={`text-left p-3 ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-white hover:bg-gray-50 text-gray-800'} rounded-lg transition-colors text-sm`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t p-4`}>
          <div className="flex items-end space-x-3">
            <button
              onClick={handleAttachment}
              className={`p-2 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
              title="Anexar arquivo"
            >
              <Paperclip size={20} />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite uma mensagem..."
                className={`w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500'} border rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors`}
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              
              <button
                onClick={() => setShowAISuggestions(!showAISuggestions)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 ${
                  showAISuggestions 
                    ? 'text-blue-600' 
                    : darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
                } transition-colors`}
                title="Sugestões da IA"
              >
                <Zap size={16} />
              </button>
            </div>
            
            <button
              onClick={handleEmoji}
              className={`p-2 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
              title="Adicionar emoji"
            >
              <Smile size={20} />
            </button>
            
            {input.trim() ? (
              <button
                onClick={handleSend}
                className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
                title="Enviar mensagem"
              >
                <Send size={20} />
              </button>
            ) : (
              <button
                onClick={handleVoiceRecording}
                className={`p-3 ${isRecording ? 'bg-red-600 animate-pulse' : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors rounded-xl`}
                title={isRecording ? 'Parar gravação' : 'Gravar mensagem de voz'}
              >
                <Mic size={20} className={isRecording ? 'text-white' : ''} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};