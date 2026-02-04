import { supabase } from '../lib/supabase';
import { AuthSpan } from '../types/auth';

class AuthAuditService {
  private tenant = 'voulezvous';

  /**
   * Registra span de auditoria para ações de autenticação
   */
  async logAuthSpan(span: Omit<AuthSpan, 'tenant' | 'timestamp'>): Promise<{ success: boolean; spanId?: string; error?: string }> {
    try {
      const authSpan: AuthSpan = {
        ...span,
        tenant: this.tenant,
        timestamp: new Date().toISOString()
      };

      // Registra no Supabase
      const { data, error } = await supabase
        .from('auth_spans')
        .insert({
          type: authSpan.type,
          acao: authSpan.acao,
          pessoa: authSpan.pessoa,
          token_jti: authSpan.token_jti,
          ip: authSpan.ip,
          user_agent: authSpan.user_agent,
          tenant: authSpan.tenant,
          origem: authSpan.origem,
          motivo: authSpan.motivo,
          timestamp: authSpan.timestamp,
          meta: authSpan.meta || {}
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao registrar span de auth:', error);
        return { success: false, error: error.message };
      }

      return { success: true, spanId: data.id };
    } catch (error) {
      console.error('Erro no serviço de auditoria:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  /**
   * Registra signup
   */
  async logSignup(email: string, origem: 'web' | 'mobile' | 'api' = 'web'): Promise<void> {
    await this.logAuthSpan({
      type: 'auth',
      acao: 'signup',
      pessoa: email,
      origem,
      ip: await this.getClientIP(),
      user_agent: navigator.userAgent
    });
  }

  /**
   * Registra signin
   */
  async logSignin(email: string, jti: string, origem: 'web' | 'mobile' | 'api' = 'web'): Promise<void> {
    await this.logAuthSpan({
      type: 'auth',
      acao: 'signin',
      pessoa: email,
      token_jti: jti,
      origem,
      ip: await this.getClientIP(),
      user_agent: navigator.userAgent,
      meta: {
        session_id: this.generateSessionId(),
        device_fingerprint: this.generateDeviceFingerprint()
      }
    });
  }

  /**
   * Registra logout
   */
  async logLogout(email: string, jti: string, motivo: string = 'logout'): Promise<void> {
    await this.logAuthSpan({
      type: 'auth',
      acao: 'logout',
      pessoa: email,
      token_jti: jti,
      origem: 'web',
      motivo,
      ip: await this.getClientIP(),
      user_agent: navigator.userAgent
    });
  }

  /**
   * Registra revogação de token
   */
  async logTokenRevocation(email: string, jti: string, motivo: string): Promise<void> {
    await this.logAuthSpan({
      type: 'auth',
      acao: 'revogacao',
      pessoa: email,
      token_jti: jti,
      origem: 'web',
      motivo,
      ip: await this.getClientIP(),
      user_agent: navigator.userAgent
    });

    // Adiciona token à lista de revogados
    await this.revokeToken(jti, motivo, email);
  }

  /**
   * Adiciona token à lista de revogados
   */
  private async revokeToken(jti: string, reason: string, userEmail: string): Promise<void> {
    try {
      await supabase
        .from('revoked_tokens')
        .insert({
          jti,
          revoked_at: new Date().toISOString(),
          reason,
          user_email: userEmail
        });
    } catch (error) {
      console.error('Erro ao revogar token:', error);
    }
  }

  /**
   * Verifica se token está revogado
   */
  async isTokenRevoked(jti: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('revoked_tokens')
        .select('jti')
        .eq('jti', jti)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * Obtém IP do cliente (simulado para desenvolvimento)
   */
  private async getClientIP(): Promise<string> {
    try {
      // Em produção, usar serviço real de IP
      return '127.0.0.1';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Gera ID de sessão único
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gera fingerprint do dispositivo
   */
  private generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');

    // Hash simples do fingerprint
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return `fp_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Obtém histórico de autenticação do usuário
   */
  async getAuthHistory(email: string, limit: number = 50): Promise<AuthSpan[]> {
    try {
      const { data, error } = await supabase
        .from('auth_spans')
        .select('*')
        .eq('pessoa', email)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar histórico:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro no histórico de auth:', error);
      return [];
    }
  }
}

export const authAuditService = new AuthAuditService();