import React from 'react';
import { useApp } from '../contexts/AppContext';
import { MessageSquare, MessageCircle, FileText, Shield } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { currentScreen, setCurrentScreen, darkMode, setRightPanelOpen } = useApp();

  return (
    <nav 
      className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t z-[70] transition-colors duration-300`}
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-center px-2 sm:px-4 py-2">
        <div className="flex items-center justify-around w-full max-w-md gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentScreen('chat')}
            aria-label="Chat"
            className={`flex flex-col items-center justify-center min-w-[68px] min-h-[44px] px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 ${
              currentScreen === 'chat'
                ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                : darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <MessageSquare size={24} className="sm:w-5 sm:h-5" />
            <span className="text-xs mt-1">Chat</span>
          </button>

          <button
            onClick={() => setCurrentScreen('whatsapp')}
            aria-label="WhatsApp"
            className={`flex flex-col items-center justify-center min-w-[68px] min-h-[44px] px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 ${
              currentScreen === 'whatsapp'
                ? darkMode ? 'bg-green-600 text-white' : 'bg-green-600 text-white'
                : darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <MessageCircle size={24} className="sm:w-5 sm:h-5" />
            <span className="text-xs mt-1">WhatsApp</span>
          </button>

          <button
            onClick={() => setCurrentScreen('new')}
            aria-label="Novo Contrato"
            className={`flex flex-col items-center justify-center min-w-[68px] min-h-[44px] px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 ${
              currentScreen === 'new'
                ? darkMode ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'
                : darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <FileText size={24} className="sm:w-5 sm:h-5" />
            <span className="text-xs mt-1">Novo</span>
          </button>

          <button
            onClick={() => {
              setCurrentScreen('security');
              setRightPanelOpen(false);
            }}
            aria-label="Segurança"
            className={`flex flex-col items-center justify-center min-w-[68px] min-h-[44px] px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 ${
              currentScreen === 'security'
                ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                : darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <Shield size={24} className="sm:w-5 sm:h-5" />
            <span className="text-xs mt-1">Segurança</span>
          </button>
        </div>
      </div>
    </nav>
  );
};