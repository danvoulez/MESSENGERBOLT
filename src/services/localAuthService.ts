interface LocalUser {
  id: string;
  email: string;
  password: string;
  user_metadata: {
    name?: string;
    avatar_url?: string;
  };
  created_at: string;
}

interface LocalSession {
  access_token: string;
  user: LocalUser;
  expires_at: number;
}

class LocalAuthService {
  private users: LocalUser[] = [];
  private currentSession: LocalSession | null = null;
  private storageKey = 'minicontratos-local-auth';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.users = data.users || [];
        this.currentSession = data.session || null;
      }
    } catch (error) {
      console.warn('Erro ao carregar dados locais:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        users: this.users,
        session: this.currentSession
      }));
    } catch (error) {
      console.warn('Erro ao salvar dados locais:', error);
    }
  }

  private generateToken(user: LocalUser): string {
    const payload = {
      sub: user.email,
      iss: 'minicontratos-local',
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 horas
      iat: Math.floor(Date.now() / 1000),
      jti: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_metadata: user.user_metadata
    };
    
    // Token simples para desenvolvimento local
    return btoa(JSON.stringify(payload));
  }

  async signUp(email: string, password: string) {
    try {
      // Verifica se usuário já existe
      const existingUser = this.users.find(u => u.email === email);
      if (existingUser) {
        return { 
          data: null, 
          error: { message: 'Usuário já existe' } 
        };
      }

      // Cria novo usuário
      const newUser: LocalUser = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        password, // Em produção, isso seria hasheado
        user_metadata: {
          name: email.split('@')[0]
        },
        created_at: new Date().toISOString()
      };

      this.users.push(newUser);
      this.saveToStorage();

      return { 
        data: { user: newUser }, 
        error: null 
      };
    } catch (error) {
      return { 
        data: null, 
        error: { message: 'Erro ao criar usuário' } 
      };
    }
  }

  async signInWithPassword(email: string, password: string) {
    try {
      const user = this.users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return { 
          data: null, 
          error: { message: 'Credenciais inválidas' } 
        };
      }

      // Cria sessão
      this.currentSession = {
        access_token: this.generateToken(user),
        user,
        expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
      };

      this.saveToStorage();

      return { 
        data: { 
          session: this.currentSession,
          user: user 
        }, 
        error: null 
      };
    } catch (error) {
      return { 
        data: null, 
        error: { message: 'Erro ao fazer login' } 
      };
    }
  }

  async getSession() {
    if (!this.currentSession) {
      return { data: { session: null }, error: null };
    }

    // Verifica se sessão expirou
    if (Date.now() > this.currentSession.expires_at) {
      this.currentSession = null;
      this.saveToStorage();
      return { data: { session: null }, error: null };
    }

    return { 
      data: { session: this.currentSession }, 
      error: null 
    };
  }

  async signOut() {
    this.currentSession = null;
    this.saveToStorage();
    return { error: null };
  }

  async resetPasswordForEmail(email: string) {
    const user = this.users.find(u => u.email === email);
    if (user) {
      console.log(`Reset de senha solicitado para: ${email}`);
      return { error: null };
    }
    return { error: { message: 'Email não encontrado' } };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    // Simula o listener do Supabase
    const checkSession = () => {
      this.getSession().then(({ data }) => {
        if (data.session) {
          callback('SIGNED_IN', data.session);
        } else {
          callback('SIGNED_OUT', null);
        }
      });
    };

    // Verifica sessão inicial
    setTimeout(checkSession, 100);

    // Retorna função de cleanup
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            console.log('Local auth listener unsubscribed');
          }
        }
      }
    };
  }
}

export const localAuthService = new LocalAuthService();