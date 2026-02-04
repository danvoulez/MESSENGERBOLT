import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { jwtService } from '../services/jwtService'
import { authAuditService } from '../services/authAuditService'
import { JWTClaims } from '../types/auth'

interface AuthContextType {
  user: User | null
  session: Session | null
  claims: JWTClaims | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  getAuthHistory: () => Promise<any[]>
  revokeToken: (reason: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [claims, setClaims] = useState<JWTClaims | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.access_token) {
        const tokenClaims = jwtService.extractClaims(session.access_token)
        setClaims(tokenClaims)
      }
      
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.access_token) {
          const tokenClaims = jwtService.extractClaims(session.access_token)
          setClaims(tokenClaims)
        } else {
          setClaims(null)
        }
        
        setLoading(false)

        // Log authentication events
        if (session?.user) {
          await authAuditService.logSignin(session.user.email || '', tokenClaims?.jti || '')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (data.user && !error) {
        await authAuditService.logSignup(email)
      }

      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (data.user && !error) {
        const tokenClaims = jwtService.extractClaims(data.session?.access_token || '')
        await authAuditService.logSignin(email, tokenClaims?.jti || '')
      }

      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      if (user && claims) {
        await authAuditService.logLogout(user.email || '', claims.jti)
      }

      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const getAuthHistory = async () => {
    if (!user) return []
    return authAuditService.getAuthHistory(user.email || '')
  }

  const revokeToken = async (reason: string) => {
    if (!user || !claims) return
    await authAuditService.logTokenRevocation(user.email || '', claims.jti, reason)
    await signOut()
  }

  const value = {
    user,
    session,
    claims,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    getAuthHistory,
    revokeToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}