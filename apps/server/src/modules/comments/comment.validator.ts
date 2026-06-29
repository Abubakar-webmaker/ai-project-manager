// src/modules/comments/comment.validator.ts
import { z } from "zod";

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Comment cannot be empty").max(2000),
    mentions: z.array(z.string()).optional(),
  }),
});

export const updateCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Comment cannot be empty").max(2000),
  }),
});

export const addReactionSchema = z.object({
  body: z.object({
    emoji: z.string().min(1, "Emoji required"),
  }),
});