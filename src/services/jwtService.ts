import { JWTClaims, RevokedToken } from '../types/auth';
import { authAuditService } from './authAuditService';

class JWTService {
  private readonly issuer = 'https://db.zcsbfkatxfwafastugfq.supabase.co/auth/v1';
  private readonly audience = 'authenticated';
  private readonly tenant = 'voulezvous';

  /**
   * Extrai claims do JWT do Supabase
   */
  extractClaims(token: string): JWTClaims | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      
      return {
        sub: decoded.email || decoded.sub,
        iss: decoded.iss || this.issuer,
        aud: decoded.aud || this.audience,
        exp: decoded.exp,
        iat: decoded.iat,
        nbf: decoded.nbf || decoded.iat,
        jti: decoded.jti || this.generateJTI(),
        tenant: this.tenant,
        role: decoded.role,
        permissions: decoded.permissions || []
      };
    } catch (error) {
      console.error('Erro ao extrair claims do JWT:', error);
      return null;
    }
  }

  /**
   * Valida JWT
   */
  async validateToken(token: string): Promise<{ valid: boolean; claims?: JWTClaims; error?: string }> {
    try {
      const claims = this.extractClaims(token);
      
      if (!claims) {
        return { valid: false, error: 'Token inválido' };
      }

      // Verifica expiração
      const now = Math.floor(Date.now() / 1000);
      if (claims.exp < now) {
        return { valid: false, error: 'Token expirado' };
      }

      // Verifica not before
      if (claims.nbf > now) {
        return { valid: false, error: 'Token ainda não válido' };
      }

      // Verifica se token foi revogado
      const isRevoked = await authAuditService.isTokenRevoked(claims.jti);
      if (isRevoked) {
        return { valid: false, error: 'Token revogado' };
      }

      // Verifica issuer e audience
      if (claims.iss !== this.issuer || claims.aud !== this.audience) {
        return { valid: false, error: 'Token de origem inválida' };
      }

      return { valid: true, claims };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Erro na validação' 
      };
    }
  }

  /**
   * Gera JTI único
   */
  private generateJTI(): string {
    return `jti_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Verifica se token precisa ser renovado (faltam menos de 5 minutos)
   */
  shouldRefreshToken(claims: JWTClaims): boolean {
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = claims.exp - now;
    return timeUntilExpiry < 300; // 5 minutos
  }

  /**
   * Extrai informações do token para auditoria
   */
  getTokenInfo(token: string): { jti: string; email: string } | null {
    const claims = this.extractClaims(token);
    if (!claims) return null;
    
    return {
      jti: claims.jti,
      email: claims.sub
    };
  }
}

export const jwtService = new JWTService();