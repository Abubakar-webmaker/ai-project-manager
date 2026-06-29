// src/features/task/types/task.types.ts
export interface Subtask {
  _id: string;
  title: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface ChecklistItem {
  _id: string;
  text: string;
  isChecked: boolean;
}

export interface Checklist {
  _id: string;
  title: string;
  items: ChecklistItem[];
}

export interface Attachment {
  _id: string;
  filename: string;
  url: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: string | { _id: string; name: string; color: string; icon: string };
  workspace: string;
  createdBy: { _id: string; name: string; avatar?: string };
  assignees: { _id: string; name: string; email: string; avatar?: string }[];
  status: "todo" | "in_progress" | "in_review" | "done" | "blocked";
  priority: "none" | "low" | "medium" | "high" | "critical";
  labels: string[];
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  position: number;
  parentTask?: string;
  subtasks: Subtask[];
  checklists: Checklist[];
  attachments: Attachment[];
  aiGenerated: boolean;
  timeTracking: {
    isTracking: boolean;
    trackedSeconds: number;
    lastStarted?: string;
  };
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanBoard {
  todo: Task[];
  in_progress: Task[];
  in_review: Task[];
  done: Task[];
  blocked: Task[];
}