import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useDatabase } from '../hooks/useDatabase'
import { Task, Contract, WhatsAppMessage, WhatsAppChat, UserProfile } from '../types'

export interface Message {
  id: string
  author: 'user' | 'system'
  content: string
  timestamp: Date
  threadId?: string
}


export interface Circle {
  id: string
  name: string
  description?: string
  invite_code: string
  is_public: boolean
  created_by: string
  created_at: string
}

export interface CircleMembership {
  id: string
  circle_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
}

export type Screen = 'chat' | 'whatsapp' | 'new' | 'security'

interface AppContextType {
  // UI State
  currentScreen: Screen
  setCurrentScreen: (screen: Screen) => void
  darkMode: boolean
  setDarkMode: (dark: boolean) => void
  leftPanelOpen: boolean
  setLeftPanelOpen: (open: boolean) => void
  rightPanelOpen: boolean
  setRightPanelOpen: (open: boolean) => void
  
  // Messages
  messages: Message[]
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Promise<void>
  deleteThread: (threadId: string) => void
  clearAllMessages: () => void
  currentThread: string | null
  setCurrentThread: (threadId: string | null) => void
  
  // Tasks
  tasks: Task[]
  updateTasks: (tasks: Task[]) => void
  completeTask: (taskId: string) => Promise<void>
  
  // Contracts
  contracts: Contract[]
  addContract: (contract: Omit<Contract, 'id' | 'created_at'>) => Promise<void>
  
  // WhatsApp
  whatsappChats: WhatsAppChat[]
  selectedChat: WhatsAppChat | null
  setSelectedChat: (chat: WhatsAppChat | null) => void
  whatsappMessages: WhatsAppMessage[]
  addWhatsappMessage: (message: Omit<WhatsAppMessage, 'id' | 'timestamp'>) => Promise<void>
  
  // User Profile
  userProfile: UserProfile | null
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>
  
  // Circles (Multi-tenant)
  currentCircle: Circle | null
  setCurrentCircle: (circle: Circle | null) => void
  userCircles: Circle[]
  joinCircle: (inviteCode: string) => Promise<{ success: boolean; error?: string }>
  createCircle: (name: string, description?: string, isPublic?: boolean) => Promise<{ success: boolean; circle?: Circle; error?: string }>
  searchCircles: (query: string) => Promise<Circle[]>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const { loadMessages, loadTasks, loadContracts, loadWhatsAppChats, loadWhatsAppMessages } = useDatabase()
  
  // BYPASS AUTH - Skip loading checks
  // if (user === undefined) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
  //         <p className="text-gray-600">Carregando...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // UI State - load from localStorage where applicable
  const [currentScreen, setCurrentScreen] = useState<Screen>('chat')
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })
  const [leftPanelOpen, setLeftPanelOpen] = useState(() => {
    const saved = localStorage.getItem('leftPanelOpen')
    return saved ? JSON.parse(saved) : true
  })
  const [rightPanelOpen, setRightPanelOpen] = useState(() => {
    const saved = localStorage.getItem('rightPanelOpen')
    return saved ? JSON.parse(saved) : true
  })
  
  // Messages
  const [messages, setMessages] = useState<Message[]>([])
  const [currentThread, setCurrentThread] = useState<string | null>(null)
  
  // Tasks
  const [tasks, setTasks] = useState<Task[]>([])
  
  // Contracts
  const [contracts, setContracts] = useState<Contract[]>([])
  
  // WhatsApp
  const [whatsappChats, setWhatsappChats] = useState<WhatsAppChat[]>([])
  const [selectedChat, setSelectedChat] = useState<WhatsAppChat | null>(null)
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([])
  
  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile | null>({
    id: 'mock-user-id',
    name: 'Mock User',
    email: 'user@example.com',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    role: 'admin',
    created_at: new Date().toISOString()
  })
  
  // Mock data for now - circles system ready but not active
  const [currentCircle, setCurrentCircle] = useState<Circle | null>(null)
  const [userCircles, setUserCircles] = useState<Circle[]>([
    {
      id: '1',
      name: 'Meu Círculo',
      description: 'Círculo padrão',
      invite_code: 'DEFAULT',
      is_public: false,
      created_by: 'user',
      created_at: new Date().toISOString()
    }
  ])

  // Load user profile when user changes
  useEffect(() => {
    // BYPASS AUTH - Set mock user profile
    setUserProfile({
      id: 'mock-user-id',
      name: 'Mock User',
      email: 'user@example.com',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      role: 'admin',
      created_at: new Date().toISOString()
    })
    
    // if (user && user.id) {
    //   setUserProfile({
    //     id: user.id,
    //     email: user.email || '',
    //     full_name: user.user_metadata?.full_name || '',
    //     avatar_url: user.user_metadata?.avatar_url || '',
    //     created_at: user.created_at
    //   })
    //   // loadUserCircles() // Commented out since it's not implemented yet
    // } else {
    //   setUserProfile(null)
    //   setCurrentCircle(null)
    //   // Keep mock data
    // }
  }, [user])

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [messagesData, tasksData, contractsData, chatsData, whatsappMessagesData] = await Promise.all([
          loadMessages(),
          loadTasks(),
          loadContracts(),
          loadWhatsAppChats(),
          loadWhatsAppMessages()
        ])
        
        if (messagesData) setMessages(messagesData)
        if (tasksData) setTasks(tasksData)
        if (contractsData) setContracts(contractsData)
        if (chatsData) setWhatsappChats(chatsData)
        if (whatsappMessagesData) setWhatsappMessages(whatsappMessagesData)
      } catch (error) {
        console.error('Error loading initial data:', error)
      }
    }

    loadInitialData()
  }, [])

  // Persist UI preferences to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('leftPanelOpen', JSON.stringify(leftPanelOpen))
  }, [leftPanelOpen])

  useEffect(() => {
    localStorage.setItem('rightPanelOpen', JSON.stringify(rightPanelOpen))
  }, [rightPanelOpen])

  // Mock function for now
  const loadUserCircles = async () => {
    // TODO: Implement when circles system is active
  }

  // Add message
  const addMessage = async (messageData: Omit<Message, 'id' | 'timestamp'>) => {
    const message: Message = {
      ...messageData,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, message])

    // TODO: Save to database when circles system is active
  }

  // Delete messages in a thread
  const deleteThread = (threadId: string) => {
    setMessages(prev => prev.filter(msg => msg.threadId !== threadId))
    // If current thread is being deleted, reset to main chat
    if (currentThread === threadId) {
      setCurrentThread(null)
    }
  }

  // Clear all messages
  const clearAllMessages = () => {
    setMessages([])
    setCurrentThread(null)
  }

  // Update tasks
  const updateTasks = (newTasks: Task[]) => {
    setTasks(newTasks)
  }

  // Complete task
  const completeTask = async (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    ))
    // TODO: Update in database
  }

  // Add contract
  const addContract = async (contractData: Omit<Contract, 'id' | 'created_at'>) => {
    const contract: Contract = {
      ...contractData,
      id: `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    }

    setContracts(prev => [...prev, contract])
    // TODO: Save to database
  }

  // Add WhatsApp message
  const addWhatsappMessage = async (messageData: Omit<WhatsAppMessage, 'id' | 'timestamp'>) => {
    const message: WhatsAppMessage = {
      ...messageData,
      id: `wa_msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }

    setWhatsappMessages(prev => [...prev, message])
    // TODO: Save to database
  }

  // Update user profile
  const updateUserProfile = async (profileData: Partial<UserProfile>) => {
    if (!user || !user.id) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        return
      }

      setUserProfile(prev => prev ? { ...prev, ...profileData } : null)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  // Join circle by invite code
  const joinCircle = async (inviteCode: string): Promise<{ success: boolean; error?: string }> => {
    // TODO: Implement when circles system is active
    return { success: false, error: 'Sistema de círculos não ativo ainda' }
  }

  // Create new circle
  const createCircle = async (
    name: string, 
    description?: string, 
    isPublic: boolean = false
  ): Promise<{ success: boolean; circle?: Circle; error?: string }> => {
    // TODO: Implement when circles system is active
    return { success: false, error: 'Sistema de círculos não ativo ainda' }
  }

  // Search public circles
  const searchCircles = async (query: string): Promise<Circle[]> => {
    // TODO: Implement when circles system is active
    return []
  }

  const value: AppContextType = {
    // UI State
    currentScreen,
    setCurrentScreen,
    darkMode,
    setDarkMode,
    leftPanelOpen,
    setLeftPanelOpen,
    rightPanelOpen,
    setRightPanelOpen,
    
    // Messages
    messages,
    addMessage,
    deleteThread,
    clearAllMessages,
    currentThread,
    setCurrentThread,
    
    // Tasks
    tasks,
    updateTasks,
    completeTask,
    
    // Contracts
    contracts,
    addContract,
    
    // WhatsApp
    whatsappChats,
    selectedChat,
    setSelectedChat,
    whatsappMessages,
    addWhatsappMessage,
    
    // User Profile
    userProfile,
    updateUserProfile,
    
    // Circles
    currentCircle,
    setCurrentCircle,
    userCircles,
    joinCircle,
    createCircle,
    searchCircles
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}