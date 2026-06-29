// src/modules/auth/auth.types.ts
export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

// Aliases for service layer
export type RegisterInput = RegisterDTO;
export type LoginInput = LoginDTO;

export interface TokenPayload {
  userId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}