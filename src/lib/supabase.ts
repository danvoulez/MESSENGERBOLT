import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { localAuthService } from '../services/localAuthService'

// Get Supabase configuration from environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zcsbfkatxfwafastugfq.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Validate if we have a proper JWT anon key (should start with eyJ and have 3 parts)
const isValidJWT = (key: string): boolean => {
  return key.startsWith('eyJ') && 
         key.split('.').length === 3 && 
         !key.includes('PLACEHOLDER')
}

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl !== 'https://placeholder.supabase.co' && 
                           isValidJWT(supabaseAnonKey)

let supabase: any

if (hasValidCredentials) {
  // ✅ REAL SUPABASE - Using proper anon key
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('🔥 SUPABASE REAL CONECTADO!')
  console.log('✅ URL:', supabaseUrl)
  console.log('✅ Anon Key válida:', supabaseAnonKey.substring(0, 50) + '...')
  console.log('🚀 Banco de dados na nuvem ativo!')
} else {
  // 🏠 LOCAL FALLBACK - When no valid anon key
  console.log('🏠 MODO LOCAL ATIVO')
  console.log('ℹ️  Para usar Supabase real, configure VITE_SUPABASE_ANON_KEY')
  console.log('📋 A chave deve começar com "eyJ" (JWT válido)')
  
  supabase = {
    auth: {
      signUp: localAuthService.signUp.bind(localAuthService),
      signInWithPassword: localAuthService.signInWithPassword.bind(localAuthService),
      signOut: localAuthService.signOut.bind(localAuthService),
      getSession: localAuthService.getSession.bind(localAuthService),
      resetPasswordForEmail: localAuthService.resetPasswordForEmail.bind(localAuthService),
      onAuthStateChange: localAuthService.onAuthStateChange.bind(localAuthService)
    },
    from: (table: string) => ({
      insert: (data: any) => ({
        select: () => ({
          single: () => Promise.resolve({ 
            data: { ...data, id: `local_${Date.now()}`, created_at: new Date().toISOString() }, 
            error: null 
          })
        })
      }),
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          order: (column: string, options?: any) => ({
            limit: (count: number) => Promise.resolve({ data: [], error: null })
          }),
          single: () => Promise.resolve({ data: null, error: null })
        }),
        order: (column: string, options?: any) => Promise.resolve({ data: [], error: null }),
        is: (column: string, value: any) => ({
          order: (column: string, options?: any) => Promise.resolve({ data: [], error: null })
        })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => Promise.resolve({ error: null })
      }),
      delete: () => ({
        eq: (column: string, value: any) => Promise.resolve({ error: null })
      })
    })
  }
}

export { supabase }
export default supabase