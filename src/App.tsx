import React, { useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AppProvider } from './contexts/AppContext'
import { ToastProvider } from './contexts/ToastContext'
import { AuthScreen } from './components/AuthScreen'
import { OnboardingScreen } from './components/OnboardingScreen'
import { ChatScreen } from './components/ChatScreen'
import { WhatsAppScreen } from './components/WhatsAppScreen'
import { NewContractScreen } from './components/NewContractScreen'
import { SecurityPanel } from './components/SecurityPanel'
import { LeftPanel } from './components/LeftPanel'
import { RightPanel } from './components/RightPanel'
import { Navigation } from './components/Navigation'
import { useApp } from './contexts/AppContext'
import { Moon, Sun } from 'lucide-react'

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  const { currentScreen, darkMode, setDarkMode, leftPanelOpen, rightPanelOpen, setLeftPanelOpen, setRightPanelOpen } = useApp()

  // Close panels on mobile when screen changes
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    if (isMobile && (leftPanelOpen || rightPanelOpen)) {
      setLeftPanelOpen(false)
      setRightPanelOpen(false)
    }
  }, [currentScreen])

  // BYPASS AUTH - Go straight to main app
  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
  //         <p className="text-gray-600">Carregando...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // if (!user) {
  //   return <AuthScreen />
  // }

  // Check if user needs onboarding (no circles)
  // For now, skip onboarding and go directly to main app
  // TODO: Implement circle membership check
  const needsOnboarding = false

  if (needsOnboarding) {
    return <OnboardingScreen />
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'chat':
        return <ChatScreen />
      case 'whatsapp':
        return <WhatsAppScreen />
      case 'new':
        return <NewContractScreen />
      case 'security':
        return <SecurityPanel />
      default:
        return <ChatScreen />
    }
  }

  // Show floating dark mode toggle only when no panels are open
  const showDarkModeToggle = !leftPanelOpen && !rightPanelOpen

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="relative">
        <LeftPanel />
        {renderScreen()}
        <RightPanel />
        <Navigation />
        
        {/* Floating Dark Mode Toggle */}
        {showDarkModeToggle && (
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? 'Modo claro' : 'Modo escuro'}
            title={darkMode ? 'Modo claro' : 'Modo escuro'}
            className={`fixed top-4 right-4 z-[60] ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-600' : 'bg-white text-gray-700 border-gray-200'} min-w-[44px] min-h-[44px] p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}
      </div>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App