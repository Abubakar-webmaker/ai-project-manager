// src/modules/workspaces/workspace.validator.ts
import { z } from "zod";

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    description: z.string().max(200).optional(),
    color: z.string().optional(),
  }),
});

export const updateWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    description: z.string().max(200).optional(),
    color: z.string().optional(),
    settings: z
      .object({
        allowGuestAccess: z.boolean().optional(),
        defaultProjectVisibility: z.enum(["public", "private"]).optional(),
      })
      .optional(),
  }),
});

export const inviteMemberSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    role: z.enum(["admin", "member"]).default("member"),
  }),
});

export const updateMemberRoleSchema = z.object({
  body: z.object({
    role: z.enum(["admin", "member"]),
  }),
});