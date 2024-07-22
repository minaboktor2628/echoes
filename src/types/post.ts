import { z } from "zod";

export const postFormSchema = z.object({
  content: z.string().min(1, {
    message: "Post must be at least 1 character in length.",
  }),
  by: z.string().optional(),
});

export type PostFormSchema = z.infer<typeof postFormSchema>;
