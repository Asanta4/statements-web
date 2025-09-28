export interface GoogleJwtPayload {
  email: string;
  name: string;
  picture: string;
  sub: string;
  email_verified: boolean;
  aud: string;
  azp: string;
  exp: number;
  iat: number;
  iss: string;
}

export interface User {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
}