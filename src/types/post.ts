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

export type getPosts = z.infer<typeof infiniteListSchema>;

export const postFormSchema = z.object({
  by: z.array(z.string()),
  content: z.string().min(1, {
    message: "Post must be at least 1 character in length.",
  }),
});

export const toggleLikeSchema = z.object({
  id: z.string(),
});

export type PostFormSchema = z.infer<typeof postFormSchema>;

export type Post = ElementTypeFromArray<
  RouterOutputs["post"]["infiniteFeed"]["posts"]
>;
export type MentionedUser = ElementTypeFromArray<Post["mentions"]>;
