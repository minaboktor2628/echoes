import { z } from "zod";
import type { RouterOutputs } from "@/trpc/react";

export const infiniteListSchema = z.object({
  limit: z.number().optional(),
  cursor: z
    .object({
      id: z.string(),
      createdAt: z.date(),
    })
    .optional(),
});

export const postFormSchema = z.object({
  content: z.string().min(1, {
    message: "Post must be at least 1 character in length.",
  }),
  by: z.string().optional(),
});

export const toggleLikeSchema = z.object({
  id: z.string(),
});

export type PostFormSchema = z.infer<typeof postFormSchema>;

export type Post = ElementTypeFromArray<
  RouterOutputs["post"]["infiniteFeed"]["posts"]
>;
