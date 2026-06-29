// src/modules/projects/project.types.ts
export interface CreateProjectDTO {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  visibility?: "public" | "private";
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
  settings?: {
    enableTimeTracking?: boolean;
    enableGamification?: boolean;
    enableClientPortal?: boolean;
    sprintDuration?: number;
  };
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  visibility?: "public" | "private";
  status?: "active" | "on_hold" | "completed" | "archived";
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
  settings?: {
    enableTimeTracking?: boolean;
    enableGamification?: boolean;
    enableClientPortal?: boolean;
    sprintDuration?: number;
  };
}

export interface AddProjectMemberDTO {
  userId: string;
  role: "manager" | "member" | "viewer";
}