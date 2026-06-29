// src/modules/projects/project.validator.ts
import { z } from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    description: z.string().max(500).optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    visibility: z.enum(["public", "private"]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    tags: z.array(z.string()).optional(),
    settings: z
      .object({
        enableTimeTracking: z.boolean().optional(),
        enableGamification: z.boolean().optional(),
        enableClientPortal: z.boolean().optional(),
        sprintDuration: z.number().min(1).max(90).optional(),
      })
      .optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    visibility: z.enum(["public", "private"]).optional(),
    status: z.enum(["active", "on_hold", "completed", "archived"]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    tags: z.array(z.string()).optional(),
    settings: z
      .object({
        enableTimeTracking: z.boolean().optional(),
        enableGamification: z.boolean().optional(),
        enableClientPortal: z.boolean().optional(),
        sprintDuration: z.number().min(1).max(90).optional(),
      })
      .optional(),
  }),
});

export const addMemberSchema = z.object({
  body: z.object({
    userId: z.string().min(1, "User ID required"),
    role: z.enum(["manager", "member", "viewer"]).default("member"),
  }),
});