   // src/constants/routes.constants.ts
export const ROUTES = {
  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  OAUTH_CALLBACK: "/auth/callback",

  // App
  HOME: "/",
  DASHBOARD: "/dashboard",

  // Workspace
  WORKSPACES: "/workspaces",
  WORKSPACE: (id: string) => `/workspaces/${id}`,
  WORKSPACE_SETTINGS: (id: string) => `/workspaces/${id}/settings`,

  // Project
  PROJECT: (wId: string, pId: string) => `/workspaces/${wId}/projects/${pId}`,
  PROJECT_BOARD: (wId: string, pId: string) => `/workspaces/${wId}/projects/${pId}/board`,
  PROJECT_LIST: (wId: string, pId: string) => `/workspaces/${wId}/projects/${pId}/list`,
  PROJECT_ANALYTICS: (wId: string, pId: string) => `/workspaces/${wId}/projects/${pId}/analytics`,
  PROJECT_SETTINGS: (wId: string, pId: string) => `/workspaces/${wId}/projects/${pId}/settings`,

  // Task
  TASK: (id: string) => `/tasks/${id}`,

  // AI
  AI_ASSISTANT: (pId: string) => `/projects/${pId}/ai`,

  // Client Portal
  CLIENT_PORTAL: (token: string) => `/client-portal/${token}`,

  // Profile
  PROFILE: "/profile",
  SETTINGS: "/settings",
} as const;