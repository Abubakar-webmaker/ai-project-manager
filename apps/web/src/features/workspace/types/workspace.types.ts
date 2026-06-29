// src/features/workspace/types/workspace.types.ts
export interface WorkspaceMember {
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    isOnline: boolean;
  };
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

export interface Workspace {
  _id: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  color: string;
  owner: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  members: WorkspaceMember[];
  plan: "free" | "pro" | "enterprise";
  settings: {
    allowGuestAccess: boolean;
    defaultProjectVisibility: "public" | "private";
  };
  createdAt: string;
}