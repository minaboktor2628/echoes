import { infer, z } from "zod";
import type { RouterOutputs } from "@/trpc/react";
import { inferAsyncReturnType } from "@trpc/server";

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

export const getPostByIdSchema = z.object({ id: z.string() });

export const infiniteProfileListSchema = z.object({
  limit: z.number().optional(),
  id: z.string(),
  tab: z.enum(["Recent", "Mentioned In"]).default("Recent").optional(),
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

export const makeCommentSchema = z.object({
  replyToId: z.string().optional(),
  postId: z.string(),
  content: z
    .string()
    .min(1, { message: "Your comment is too short." })
    .max(255, { message: "Your comment is too long." }),
});

export type MakeCommentSchema = z.infer<typeof makeCommentSchema>;

export const toggleLikeSchema = z.object({
  id: z.string(),
});

export type UpdateProps = Pick<Post, "id" | "content" | "mentions">;

export type PostFormSchema = z.infer<typeof postFormSchema>;
export type UpdatePostFormSchema = z.infer<typeof updatePostSchema>;

export type GetPostByIdReturnType = RouterOutputs["post"]["getById"] | null;
export type Comment = GetPostByIdReturnType extends null
  ? null
  : NonNullable<GetPostByIdReturnType>["comments"][number];

export type Post = ElementTypeFromArray<
  RouterOutputs["post"]["infiniteFeed"]["posts"]
>;
export type MentionedUser = ElementTypeFromArray<Post["mentions"]>;
