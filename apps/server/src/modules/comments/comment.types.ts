// src/modules/comments/comment.types.ts
export interface CreateCommentDTO {
  content: string;
  mentions?: string[];
}

export interface UpdateCommentDTO {
  content: string;
}