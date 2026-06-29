// src/modules/workspaces/workspace.types.ts
export interface CreateWorkspaceDTO {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateWorkspaceDTO {
  name?: string;
  description?: string;
  color?: string;
  logo?: string;
  settings?: {
    allowGuestAccess?: boolean;
    defaultProjectVisibility?: "public" | "private";
  };
}

export interface InviteMemberDTO {
  email: string;
  role: "admin" | "member";
}