import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { Users, Search, Plus, Key, ArrowRight, Sparkles, Globe, Lock } from 'lucide-react';

interface Circle {
  id: string;
  name: string;
  description: string;
  code: string;
  member_count: number;
  is_public: boolean;
}

export const OnboardingScreen: React.FC = () => {
  const { user } = useAuth();
  const { joinCircle, createCircle, searchCircles } = useApp();
  const { showToast } = useToast();
  const [step, setStep] = useState<'welcome' | 'join-circle' | 'create-circle'>('welcome');
  const [circleCode, setCircleCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [newCircle, setNewCircle] = useState({
    name: '',
    description: '',
    isPublic: true
  });

  // Mock circles for demonstration
  const [publicCircles, setPublicCircles] = useState<any[]>([]);
  
  // Load public circles when in join-circle step
  React.useEffect(() => {
    if (step === 'join-circle') {
      loadPublicCircles();
    }
  }, [step]);
  
  const loadPublicCircles = async () => {
    const circles = await searchCircles('');
    setPublicCircles(circles);
  };
  
  const mockCircles = [
    {
      id: '1',
      name: 'Escritório Silva & Associados',
      description: 'Advocacia empresarial e contratos comerciais',
      code: 'SILVA2024',
      member_count: 12,
      is_public: true
    },
    {
      id: '2',
      name: 'Imobiliária Costa Verde',
      description: 'Gestão de contratos de locação e vendas',
      code: 'COSTA123',
      member_count: 8,
      is_public: true
    },
    {
      id: '3',
      name: 'Consultoria Jurídica Santos',
      description: 'Assessoria jurídica para pequenas empresas',
      code: 'SANTOS99',
      member_count: 5,
      is_public: false
    }
  ];

  const filteredCircles = mockCircles.filter(circle =>
    circle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    circle.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJoinByCode = async () => {
    if (!circleCode.trim()) {
      showToast('Digite o código do círculo', 'warning');
      return;
    }
    
    setLoading(true);
    
    const result = await joinCircle(circleCode);
    
    if (result.success) {
      showToast('Entrou no círculo com sucesso!', 'success');
      // Success - user will be redirected to main app automatically
    } else {
      showToast(result.error || 'Erro ao entrar no círculo', 'error');
      setLoading(false);
    }
  };

  const handleJoinCircle = async (circle: any) => {
    setLoading(true);
    
    const result = await joinCircle(circle.code);
    
    if (result.success) {
      showToast(`Entrou no círculo ${circle.name}!`, 'success');
    } else {
      showToast(result.error || 'Erro ao entrar no círculo', 'error');
      setLoading(false);
    }
  };

  const handleCreateCircle = async () => {
    if (!newCircle.name.trim()) {
      showToast('Digite o nome do círculo', 'warning');
      return;
    }
    
    setLoading(true);
    
    const result = await createCircle(
      newCircle.name,
      newCircle.description,
      newCircle.isPublic
    );
    
    if (result.success) {
      showToast(`Círculo "${newCircle.name}" criado com sucesso!`, 'success');
    } else {
      showToast(result.error || 'Erro ao criar círculo', 'error');
      setLoading(false);
    }
  };

  const generateCircleCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    return code;
  };

  if (step === 'create-circle') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Plus size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Criar Novo Círculo</h1>
            <p className="text-gray-600">
              Configure seu espaço de trabalho colaborativo
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Círculo *
              </label>
              <input
                type="text"
                value={newCircle.name}
                onChange={(e) => setNewCircle(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Escritório Silva & Associados"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição (opcional)
              </label>
              <textarea
                value={newCircle.description}
                onChange={(e) => setNewCircle(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o propósito do seu círculo..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Visibilidade
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={newCircle.isPublic}
                    onChange={() => setNewCircle(prev => ({ ...prev, isPublic: true }))}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Globe size={16} className="text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Público</div>
                      <div className="text-sm text-gray-600">Qualquer pessoa pode encontrar e solicitar entrada</div>
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={!newCircle.isPublic}
                    onChange={() => setNewCircle(prev => ({ ...prev, isPublic: false }))}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Lock size={16} className="text-orange-600" />
                    <div>
                      <div className="font-medium text-gray-900">Privado</div>
                      <div className="text-sm text-gray-600">Apenas por convite ou código</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Key size={16} className="text-blue-600" />
                <span className="font-medium text-blue-800">Código do Círculo</span>
              </div>
              <div className="font-mono text-lg text-blue-900 bg-white px-3 py-2 rounded border">
                {generateCircleCode()}
              </div>
              <p className="text-sm text-blue-700 mt-2">
                Este código será gerado automaticamente para convidar outros membros
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('welcome')}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleCreateCircle}
                disabled={!newCircle.name.trim() || loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Criar Círculo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'join-circle') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Entrar em um Círculo</h1>
            <p className="text-gray-600">
              Encontre e participe de um círculo existente
            </p>
          </div>

          {/* Join by Code */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-2 mb-4">
              <Key size={20} className="text-blue-600" />
              <h3 className="font-semibold text-blue-900">Tenho um código de convite</h3>
            </div>
            <div className="flex space-x-3">
              <input
                type="text"
                value={circleCode}
                onChange={(e) => setCircleCode(e.target.value.toUpperCase())}
                placeholder="Digite o código (ex: SILVA2024)"
                className="flex-1 px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
              <button
                onClick={handleJoinByCode}
                disabled={!circleCode.trim() || loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ArrowRight size={16} />
                    <span>Entrar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search Circles */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Search size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">Procurar círculos públicos</h3>
            </div>
            
            <div className="relative mb-4">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou descrição..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {filteredCircles.map((circle) => (
                <div
                  key={circle.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors cursor-pointer"
                  onClick={() => handleJoinCircle(circle)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{circle.name}</h4>
                        {circle.is_public ? (
                          <Globe size={14} className="text-green-600" />
                        ) : (
                          <Lock size={14} className="text-orange-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{circle.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{circle.member_count} membros</span>
                        <span>Código: {circle.code}</span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setStep('welcome')}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Welcome step
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">m</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Bem-vindo ao Minicontratos!
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Olá <strong>{user?.email?.split('@')[0]}</strong>! Para começar, você precisa 
            participar de um <strong>círculo</strong> - um espaço colaborativo onde sua 
            equipe gerencia contratos em conjunto.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <button
            onClick={() => setStep('join-circle')}
            className="w-full p-6 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Users size={24} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Entrar em um Círculo</h3>
                <p className="text-sm text-gray-600">
                  Tenho um código de convite ou quero procurar círculos públicos
                </p>
              </div>
              <ArrowRight size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </button>

          <button
            onClick={() => setStep('create-circle')}
            className="w-full p-6 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 text-left group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Plus size={24} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Criar um Novo Círculo</h3>
                <p className="text-sm text-gray-600">
                  Sou o primeiro da minha equipe e quero criar nosso espaço
                </p>
              </div>
              <ArrowRight size={20} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
          </button>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
          <div className="flex items-start space-x-3">
            <Sparkles size={20} className="text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800 mb-1">O que é um Círculo?</h4>
              <p className="text-sm text-green-700 leading-relaxed">
                Um círculo é seu espaço de trabalho compartilhado onde você e sua equipe 
                podem criar, gerenciar e colaborar em contratos de forma segura e organizada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};