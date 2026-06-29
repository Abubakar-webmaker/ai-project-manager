// src/modules/tasks/task.types.ts
export interface CreateTaskDTO {
  title: string;
  description?: string;
  status?: "todo" | "in_progress" | "in_review" | "done" | "blocked";
  priority?: "none" | "low" | "medium" | "high" | "critical";
  assignees?: string[];
  dueDate?: Date;
  startDate?: Date;
  estimatedHours?: number;
  labels?: string[];
  parentTask?: string;
  position?: number;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: "todo" | "in_progress" | "in_review" | "done" | "blocked";
  priority?: "none" | "low" | "medium" | "high" | "critical";
  assignees?: string[];
  dueDate?: Date;
  startDate?: Date;
  estimatedHours?: number;
  labels?: string[];
  position?: number;
}

export interface MoveTaskDTO {
  status: "todo" | "in_progress" | "in_review" | "done" | "blocked";
  position: number;
}

export interface AddSubtaskDTO {
  title: string;
}

export interface AddChecklistDTO {
  title: string;
}