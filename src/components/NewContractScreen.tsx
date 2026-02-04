import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { FileText, Save, Eye, Download, Share, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export const NewContractScreen: React.FC = () => {
  const { addContract, darkMode } = useApp();
  const [formData, setFormData] = useState({
    who: '',
    did: '',
    thisObject: '',
    when: '',
    witness: '',
    ifOk: '',
    ifDoubt: '',
    ifNot: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    await addContract({
      ...formData,
      status: 'draft'
    });
    
    // Reset form
    setFormData({
      who: '',
      did: '',
      thisObject: '',
      when: '',
      witness: '',
      ifOk: '',
      ifDoubt: '',
      ifNot: ''
    });
    
    setIsSaving(false);
    setShowPreview(false);
  };

  const isFormValid = formData.who && formData.did && formData.thisObject && formData.when && formData.ifOk && formData.ifDoubt && formData.ifNot;

  const generateContract = () => {
    return `MINICONTRATO

Quem: ${formData.who}
Fez: ${formData.did}
Objeto: ${formData.thisObject}
Quando: ${formData.when}
${formData.witness ? `Testemunha: ${formData.witness}` : ''}

CONDIÇÕES:

Se tudo correr bem: ${formData.ifOk}

Se houver dúvidas: ${formData.ifDoubt}

Se não der certo: ${formData.ifNot}

Data: ${new Date().toLocaleDateString('pt-BR')}
Assinatura: _________________________`;
  };

  if (showPreview) {
    return (
      <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${darkMode ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-purple-500 to-pink-500'} rounded-full flex items-center justify-center`}>
              <Eye size={20} className="text-white" />
            </div>
            <div>
              <h1 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Visualizar Contrato
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Revise antes de salvar
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPreview(false)}
              className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} rounded-lg transition-colors`}
            >
              Editar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className={`max-w-2xl mx-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
            <pre className={`whitespace-pre-wrap font-mono text-sm leading-relaxed ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {generateContract()}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${darkMode ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-purple-500 to-pink-500'} rounded-full flex items-center justify-center`}>
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <h1 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Novo Minicontrato
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Crie contratos simples e eficazes
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreview(true)}
            disabled={!isFormValid}
            className={`px-4 py-2 ${
              isFormValid
                ? darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                : darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
            } rounded-lg transition-colors flex items-center space-x-2 disabled:cursor-not-allowed`}
          >
            <Eye size={16} />
            <span>Visualizar</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Basic Info */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Informações Básicas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Quem <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.who}
                  onChange={(e) => handleInputChange('who', e.target.value)}
                  placeholder="Nome da pessoa ou empresa"
                  className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Quando <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.when}
                  onChange={(e) => handleInputChange('when', e.target.value)}
                  placeholder="Data ou prazo"
                  className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Fez <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.did}
                onChange={(e) => handleInputChange('did', e.target.value)}
                placeholder="O que foi feito ou acordado"
                rows={3}
                className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none`}
              />
            </div>
            
            <div className="mt-4">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Objeto <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.thisObject}
                onChange={(e) => handleInputChange('thisObject', e.target.value)}
                placeholder="Descrição detalhada do objeto do contrato"
                rows={3}
                className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none`}
              />
            </div>
            
            <div className="mt-4">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Testemunha (opcional)
              </label>
              <input
                type="text"
                value={formData.witness}
                onChange={(e) => handleInputChange('witness', e.target.value)}
                placeholder="Nome da testemunha"
                className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
              />
            </div>
          </div>

          {/* Conditions */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Condições do Contrato
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center space-x-2`}>
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Se tudo correr bem <span className="text-red-500">*</span></span>
                </label>
                <textarea
                  value={formData.ifOk}
                  onChange={(e) => handleInputChange('ifOk', e.target.value)}
                  placeholder="O que acontece se tudo der certo"
                  rows={3}
                  className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center space-x-2`}>
                  <AlertCircle size={16} className="text-yellow-500" />
                  <span>Se houver dúvidas <span className="text-red-500">*</span></span>
                </label>
                <textarea
                  value={formData.ifDoubt}
                  onChange={(e) => handleInputChange('ifDoubt', e.target.value)}
                  placeholder="Como resolver dúvidas ou problemas menores"
                  rows={3}
                  className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors resize-none`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center space-x-2`}>
                  <AlertCircle size={16} className="text-red-500" />
                  <span>Se não der certo <span className="text-red-500">*</span></span>
                </label>
                <textarea
                  value={formData.ifNot}
                  onChange={(e) => handleInputChange('ifNot', e.target.value)}
                  placeholder="O que fazer se o acordo não for cumprido"
                  rows={3}
                  className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none`}
                />
              </div>
            </div>
          </div>

          {/* Form Validation */}
          {!isFormValid && (
            <div className={`${darkMode ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-xl p-4`}>
              <div className="flex items-start space-x-3">
                <AlertCircle size={20} className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'} mt-0.5`} />
                <div>
                  <h3 className={`font-medium ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                    Campos obrigatórios
                  </h3>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>
                    Preencha todos os campos marcados com * para continuar
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};