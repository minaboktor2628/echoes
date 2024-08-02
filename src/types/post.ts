import { z } from "zod";
import type { RouterOutputs } from "@/trpc/react";

export const infiniteListSchema = z.object({
  limit: z.number().optional(),
  onlyFollowing: z.boolean().optional(),
  cursor: z
    .object({
      id: z.string(),
      createdAt: z.date(),
    })
    .optional(),
});
export const infiniteProfileListSchema = z.object({
  limit: z.number().optional(),
  id: z.string(),
  cursor: z
    .object({
      id: z.string(),
      createdAt: z.date(),
    })
    .optional(),
});

export const deletePostSchema = z.object({
  id: z.string(),
});

export type getPosts = z.infer<typeof infiniteListSchema>;

export const postFormSchema = z.object({
  content: z.string().min(1, {
    message: "Post must be at least 1 character in length.",
  }),
});

export const updatePostSchema = postFormSchema.extend({ id: z.string() });

export const toggleLikeSchema = z.object({
  id: z.string(),
});

export type UpdateProps = Pick<Post, "id" | "content" | "mentions">;

export type PostFormSchema = z.infer<typeof postFormSchema>;
export type UpdatePostFormSchema = z.infer<typeof updatePostSchema>;

export type Post = ElementTypeFromArray<
  RouterOutputs["post"]["infiniteFeed"]["posts"]
>;
export type MentionedUser = ElementTypeFromArray<Post["mentions"]>;
