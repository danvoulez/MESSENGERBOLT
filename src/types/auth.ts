export interface AuthSpan {
  type: 'auth';
  acao: 'signup' | 'signin' | 'logout' | 'revogacao' | 'token_refresh' | 'password_reset';
  pessoa: string;
  token_jti?: string;
  ip?: string;
  user_agent?: string;
  tenant: string;
  origem: 'web' | 'mobile' | 'api';
  motivo?: string;
  timestamp: string;
  meta?: {
    session_id?: string;
    device_fingerprint?: string;
    location?: string;
    risk_score?: number;
  };
}

export interface JWTClaims {
  sub: string; // user email
  iss: string; // issuer
  aud: string; // audience
  exp: number; // expiration
  iat: number; // issued at
  nbf: number; // not before
  jti: string; // JWT ID
  tenant: string;
  role?: string;
  permissions?: string[];
}

export interface AuthSession {
  user: any;
  token: string;
  jti: string;
  expires_at: number;
  tenant: string;
}

export interface RevokedToken {
  jti: string;
  revoked_at: string;
  reason: string;
  user_email: string;
}