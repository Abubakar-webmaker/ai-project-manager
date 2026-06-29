// src/features/auth/types/auth.types.ts
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  isEmailVerified: boolean;
  isOnline: boolean;
  lastSeen: string;
  preferences: {
    theme: "light" | "dark";
    notifications: {
      email: boolean;
      inApp: boolean;
      whatsapp: boolean;
    };
  };
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}