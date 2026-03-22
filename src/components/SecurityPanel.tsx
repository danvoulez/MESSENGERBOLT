import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useApp } from '../contexts/AppContext';
import { Shield, Clock, AlertTriangle, Key, Eye, EyeOff, LogOut } from 'lucide-react';

export const SecurityPanel: React.FC = () => {
  const { user, claims, getAuthHistory, revokeToken } = useAuth();
  const { showToast } = useToast();
  const { darkMode } = useApp();
  const [authHistory, setAuthHistory] = useState<any[]>([]);
  const [showTokenDetails, setShowTokenDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAuthHistory();
  }, []);

  const loadAuthHistory = async () => {
    setLoading(true);
    try {
      const history = await getAuthHistory();
      setAuthHistory(history.slice(0, 10)); // Últimos 10 eventos
      showToast('Histórico de autenticação atualizado', 'success', 2000);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      showToast('Erro ao carregar histórico de autenticação', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeToken = async (reason: string) => {
    if (confirm(`Tem certeza que deseja revogar o token? Motivo: ${reason}`)) {
      try {
        await revokeToken(reason);
        showToast('Token revogado com sucesso!', 'success');
      } catch (error) {
        showToast('Erro ao revogar token', 'error');
      }
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const getActionIcon = (acao: string) => {
    switch (acao) {
      case 'signin':
        return <Key size={16} className="text-green-600" />;
      case 'logout':
        return <LogOut size={16} className="text-blue-600" />;
      case 'signup':
        return <Shield size={16} className="text-purple-600" />;
      case 'revogacao':
        return <AlertTriangle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getActionColor = (acao: string) => {
    switch (acao) {
      case 'signin':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'logout':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'signup':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'revogacao':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} pb-20 sm:pb-24`}>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm p-4 sm:p-6 border`}>
          <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className={`text-lg sm:text-2xl font-bold truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Painel de Segurança</h1>
            <p className={`text-sm sm:text-base truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Autenticação institucional e auditoria completa</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className={`${darkMode ? 'bg-green-900 bg-opacity-30 border-green-700' : 'bg-green-50 border-green-200'} border rounded-lg p-3 sm:p-4`}>
            <div className="flex items-center space-x-2 mb-2">
              <Shield size={18} className={`${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              <span className={`font-semibold text-sm ${darkMode ? 'text-green-300' : 'text-green-800'}`}>Status</span>
            </div>
            <p className={`text-sm sm:text-base ${darkMode ? 'text-green-200' : 'text-green-700'}`}>Autenticado</p>
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-green-300' : 'text-green-600'}`}>Tenant: voulezvous</p>
          </div>

          <div className={`${darkMode ? 'bg-blue-900 bg-opacity-30 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-3 sm:p-4`}>
            <div className="flex items-center space-x-2 mb-2">
              <Key size={18} className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`font-semibold text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>JWT</span>
            </div>
            <p className={`text-sm sm:text-base ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>Token Ativo</p>
            {claims && (
              <p className={`text-xs sm:text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                Expira: {new Date(claims.exp * 1000).toLocaleTimeString('pt-BR')}
              </p>
            )}
          </div>

          <div className={`${darkMode ? 'bg-purple-900 bg-opacity-30 border-purple-700' : 'bg-purple-50 border-purple-200'} border rounded-lg p-3 sm:p-4`}>
            <div className="flex items-center space-x-2 mb-2">
              <Clock size={18} className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <span className={`font-semibold text-sm ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>Auditoria</span>
            </div>
            <p className={`text-sm sm:text-base ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>Rastreamento Ativo</p>
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>{authHistory.length} eventos</p>
          </div>
        </div>
      </div>

      {/* Token Details */}
      {claims && (
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm p-4 sm:p-6 border`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-base sm:text-lg font-semibold truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Detalhes do Token JWT</h2>
            <button
              onClick={() => setShowTokenDetails(!showTokenDetails)}
              aria-label={showTokenDetails ? 'Ocultar detalhes' : 'Mostrar detalhes'}
              className={`flex items-center space-x-2 min-w-[100px] min-h-[44px] px-3 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg transition-colors flex-shrink-0`}
            >
              {showTokenDetails ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className="text-sm">{showTokenDetails ? 'Ocultar' : 'Mostrar'}</span>
            </button>
          </div>

          {showTokenDetails && (
            <div className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50'} rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm space-y-2 overflow-x-auto`}>
              <div className={`${darkMode ? 'text-gray-300' : 'text-gray-800'}`}><strong>Subject:</strong> {claims.sub}</div>
              <div className={`${darkMode ? 'text-gray-300' : 'text-gray-800'}`}><strong>Issuer:</strong> {claims.iss}</div>
              <div className={`${darkMode ? 'text-gray-300' : 'text-gray-800'}`}><strong>Audience:</strong> {claims.aud}</div>
              <div className={`${darkMode ? 'text-gray-300' : 'text-gray-800'}`}><strong>JWT ID:</strong> {claims.jti}</div>
              <div className={`${darkMode ? 'text-gray-300' : 'text-gray-800'}`}><strong>Tenant:</strong> {claims.tenant}</div>
              <div className={`${darkMode ? 'text-gray-300' : 'text-gray-800'}`}><strong>Issued At:</strong> {new Date(claims.iat * 1000).toLocaleString('pt-BR')}</div>
              <div className={`${darkMode ? 'text-gray-300' : 'text-gray-800'}`}><strong>Expires At:</strong> {new Date(claims.exp * 1000).toLocaleString('pt-BR')}</div>
              {claims.role && <div className={`${darkMode ? 'text-gray-300' : 'text-gray-800'}`}><strong>Role:</strong> {claims.role}</div>}
            </div>
          )}

          <div className="flex space-x-3 mt-4">
            <button
              onClick={() => handleRevokeToken('manual_revocation')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <AlertTriangle size={16} />
              <span>Revogar Token</span>
            </button>
            
            <button
              onClick={() => handleRevokeToken('security_concern')}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Shield size={16} />
              <span>Revogar por Segurança</span>
            </button>
          </div>
        </div>
      )}

      {/* Auth History */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm p-4 sm:p-6 border`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-base sm:text-lg font-semibold truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Histórico de Autenticação</h2>
          <button
            onClick={loadAuthHistory}
            disabled={loading}
            aria-label="Atualizar histórico"
            className={`min-w-[120px] min-h-[44px] px-3 py-2 ${darkMode ? 'bg-blue-700 hover:bg-blue-600 disabled:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'} text-white rounded-lg transition-colors text-sm`}
          >
            {loading ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>

        <div className="space-y-3">
          {authHistory.length === 0 ? (
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center py-8`}>Nenhum evento de autenticação registrado</p>
          ) : (
            authHistory.map((event, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getActionColor(event.acao)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getActionIcon(event.acao)}
                    <div>
                      <div className="font-semibold capitalize">{event.acao}</div>
                      <div className="text-sm opacity-75">
                        {formatTimestamp(event.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm">
                    <div>IP: {event.ip || 'N/A'}</div>
                    {event.token_jti && (
                      <div className="font-mono text-xs">JTI: {event.token_jti.slice(-8)}</div>
                    )}
                  </div>
                </div>

                {event.motivo && (
                  <div className="mt-2 text-sm opacity-75">
                    <strong>Motivo:</strong> {event.motivo}
                  </div>
                )}

                {event.meta && (
                  <div className="mt-2 text-xs opacity-60">
                    <strong>Origem:</strong> {event.origem} • 
                    <strong> User Agent:</strong> {event.user_agent?.slice(0, 50)}...
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      </div>
    </div>
  );
};