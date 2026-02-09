import React from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { MessageSquare, MessageCircle, FileText, Moon, Sun, LogOut, Shield } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { currentScreen, setCurrentScreen, darkMode, setDarkMode, leftPanelOpen, rightPanelOpen, setRightPanelOpen } = useApp();
  const { signOut, user } = useAuth();
  const { showToast } = useToast();

  const handleLogout = async () => {
    if (confirm('Tem certeza que deseja sair?')) {
      try {
        await signOut();
        showToast('Logout realizado com sucesso!', 'success');
      } catch (error) {
        showToast('Erro ao fazer logout. Tente novamente.', 'error');
      }
    }
  };

  return (
    <nav className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t z-30 transition-colors duration-300`}>
      <div className="flex items-center justify-center px-4 py-2">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentScreen('chat')}
            className={`flex flex-col items-center px-4 py-2 rounded-lg transition-all duration-200 ${
              currentScreen === 'chat'
                ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                : darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <MessageSquare size={20} />
            <span className="text-xs mt-1">Chat</span>
          </button>

          <button
            onClick={() => setCurrentScreen('whatsapp')}
            className={`flex flex-col items-center px-4 py-2 rounded-lg transition-all duration-200 ${
              currentScreen === 'whatsapp'
                ? darkMode ? 'bg-green-600 text-white' : 'bg-green-600 text-white'
                : darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <MessageCircle size={20} />
            <span className="text-xs mt-1">WhatsApp</span>
          </button>

          <button
            onClick={() => setCurrentScreen('new')}
            className={`flex flex-col items-center px-4 py-2 rounded-lg transition-all duration-200 ${
              currentScreen === 'new'
                ? darkMode ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'
                : darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <FileText size={20} />
            <span className="text-xs mt-1">Novo</span>
          </button>

          <button
            onClick={() => {
              setCurrentScreen('security');
              setRightPanelOpen(false);
            }}
            className={`flex flex-col items-center px-4 py-2 rounded-lg transition-all duration-200 ${
              currentScreen === 'security'
                ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                : darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <Shield size={20} />
            <span className="text-xs mt-1">Segurança</span>
          </button>

          <div className={`w-px h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} mx-2`} />

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex flex-col items-center px-4 py-2 rounded-lg transition-all duration-200 ${
              darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className="text-xs mt-1">{darkMode ? 'Claro' : 'Escuro'}</span>
          </button>

          <button
            onClick={handleLogout}
            className={`flex flex-col items-center px-4 py-2 rounded-lg transition-all duration-200 ${
              darkMode ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' : 'text-gray-600 hover:text-red-600 hover:bg-gray-100'
            }`}
          >
            <LogOut size={20} />
            <span className="text-xs mt-1">Sair</span>
          </button>
        </div>
      </div>
    </nav>
  );
};