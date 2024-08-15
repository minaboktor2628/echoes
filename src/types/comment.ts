import { z } from "zod";

export type DeleteCommentSchema = z.infer<typeof deleteCommentSchema>;
export const deleteCommentSchema = z.object({
  createdById: z.string(),
  commentId: z.string(),
  postId: z.string(),
});

export type updateCommentSchema = z.infer<typeof updateCommentSchema>;
export const updateCommentSchema = z.object({
  commentId: z.string(),
  content: z.string(),
});
