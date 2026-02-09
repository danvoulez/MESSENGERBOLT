import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Shield, Clock, AlertTriangle, Key, Eye, EyeOff, LogOut } from 'lucide-react';

export const SecurityPanel: React.FC = () => {
  const { user, claims, getAuthHistory, revokeToken } = useAuth();
  const { showToast } = useToast();
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Painel de Segurança</h1>
            <p className="text-gray-600">Autenticação institucional e auditoria completa</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield size={20} className="text-green-600" />
              <span className="font-semibold text-green-800">Status</span>
            </div>
            <p className="text-green-700">Autenticado</p>
            <p className="text-sm text-green-600">Tenant: voulezvous</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Key size={20} className="text-blue-600" />
              <span className="font-semibold text-blue-800">JWT</span>
            </div>
            <p className="text-blue-700">Token Ativo</p>
            {claims && (
              <p className="text-sm text-blue-600">
                Expira: {new Date(claims.exp * 1000).toLocaleTimeString('pt-BR')}
              </p>
            )}
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock size={20} className="text-purple-600" />
              <span className="font-semibold text-purple-800">Auditoria</span>
            </div>
            <p className="text-purple-700">Rastreamento Ativo</p>
            <p className="text-sm text-purple-600">{authHistory.length} eventos</p>
          </div>
        </div>
      </div>

      {/* Token Details */}
      {claims && (
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Detalhes do Token JWT</h2>
            <button
              onClick={() => setShowTokenDetails(!showTokenDetails)}
              className="flex items-center space-x-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {showTokenDetails ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className="text-sm">{showTokenDetails ? 'Ocultar' : 'Mostrar'}</span>
            </button>
          </div>

          {showTokenDetails && (
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm space-y-2">
              <div><strong>Subject:</strong> {claims.sub}</div>
              <div><strong>Issuer:</strong> {claims.iss}</div>
              <div><strong>Audience:</strong> {claims.aud}</div>
              <div><strong>JWT ID:</strong> {claims.jti}</div>
              <div><strong>Tenant:</strong> {claims.tenant}</div>
              <div><strong>Issued At:</strong> {new Date(claims.iat * 1000).toLocaleString('pt-BR')}</div>
              <div><strong>Expires At:</strong> {new Date(claims.exp * 1000).toLocaleString('pt-BR')}</div>
              {claims.role && <div><strong>Role:</strong> {claims.role}</div>}
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
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Histórico de Autenticação</h2>
          <button
            onClick={loadAuthHistory}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm"
          >
            {loading ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>

        <div className="space-y-3">
          {authHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum evento de autenticação registrado</p>
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
  );
};