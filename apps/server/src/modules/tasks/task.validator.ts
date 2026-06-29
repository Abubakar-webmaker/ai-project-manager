// src/modules/tasks/task.validator.ts
import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title required").max(200),
    description: z.string().max(2000).optional(),
    status: z
      .enum(["todo", "in_progress", "in_review", "done", "blocked"])
      .optional(),
    priority: z
      .enum(["none", "low", "medium", "high", "critical"])
      .optional(),
    assignees: z.array(z.string()).optional(),
    dueDate: z.string().optional(),
    startDate: z.string().optional(),
    estimatedHours: z.number().min(0).optional(),
    labels: z.array(z.string()).optional(),
    parentTask: z.string().optional(),
    position: z.number().optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    status: z
      .enum(["todo", "in_progress", "in_review", "done", "blocked"])
      .optional(),
    priority: z
      .enum(["none", "low", "medium", "high", "critical"])
      .optional(),
    assignees: z.array(z.string()).optional(),
    dueDate: z.string().optional(),
    startDate: z.string().optional(),
    estimatedHours: z.number().min(0).optional(),
    labels: z.array(z.string()).optional(),
    position: z.number().optional(),
  }),
});

export const moveTaskSchema = z.object({
  body: z.object({
    status: z.enum(["todo", "in_progress", "in_review", "done", "blocked"]),
    position: z.number().min(0),
  }),
});

export const addSubtaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Subtask title required").max(200),
  }),
});

export const addChecklistSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Checklist title required").max(200),
  }),
});

export const addChecklistItemSchema = z.object({
  body: z.object({
    text: z.string().min(1, "Item text required").max(200),
  }),
});