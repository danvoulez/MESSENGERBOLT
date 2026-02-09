import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import { useToast } from '../contexts/ToastContext'
import { Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'

export const AuthScreen: React.FC = () => {
  const { signIn, signUp, resetPassword } = useAuth()
  const { darkMode } = useApp()
  const { showToast } = useToast()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    // Validate before setting loading state
    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        const msg = 'As senhas não coincidem'
        setMessage(msg)
        showToast(msg, 'error')
        return
      }
      if (formData.password.length < 6) {
        const msg = 'A senha deve ter pelo menos 6 caracteres'
        setMessage(msg)
        showToast(msg, 'error')
        return
      }
    }

    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password)
        if (error) {
          setMessage(error.message)
          showToast(error.message || 'Erro ao fazer login', 'error')
        } else {
          showToast('Login realizado com sucesso!', 'success')
        }
      } else {
        const { error } = await signUp(formData.email, formData.password)
        if (error) {
          setMessage(error.message)
          showToast(error.message || 'Erro ao criar conta', 'error')
        } else {
          const successMsg = 'Conta criada! Verifique seu email para confirmar.'
          setMessage(successMsg)
          showToast(successMsg, 'success')
        }
      }
    } catch (error) {
      const errorMsg = 'Erro inesperado. Tente novamente.'
      setMessage(errorMsg)
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!formData.email) {
      const msg = 'Digite seu email primeiro'
      setMessage(msg)
      showToast(msg, 'warning')
      return
    }
    
    setLoading(true)
    const { error } = await resetPassword(formData.email)
    if (error) {
      setMessage(error.message)
      showToast(error.message || 'Erro ao enviar email', 'error')
    } else {
      const successMsg = 'Email de recuperação enviado! Verifique sua caixa de entrada.'
      setMessage(successMsg)
      showToast(successMsg, 'success')
    }
    setLoading(false)
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setMessage('')
    setFormData({ email: '', password: '', confirmPassword: '' })
    showToast(isLogin ? 'Modo: Criar Conta' : 'Modo: Login', 'info', 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">m</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">minicontratos</h1>
          <p className="text-gray-600">
            Minicontratos v1.0 • Autenticação Institucional Segura
          </p>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} text-center mt-1`}>
            JWT + Auditoria Completa • Tenant: voulezvous
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={20} className="text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <p className="text-xs text-gray-500 mb-2">
              💡 Para teste: use qualquer senha com 6+ caracteres (ex: "123456")
            </p>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={20} className="text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres (ex: 123456)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password (only for signup) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('enviado') || message.includes('Verifique')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                <span>{isLogin ? 'Entrar' : 'Criar Conta'}</span>
              </>
            )}
          </button>

          {/* Forgot Password */}
          {isLogin && (
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Esqueci minha senha
            </button>
          )}

          {/* Toggle Mode */}
          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              {isLogin ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}