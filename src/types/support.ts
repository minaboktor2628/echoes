import { z } from "zod";

export const supportFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters in length" })
    .max(255, { message: "Title must not exceed 255 characters" }),
  content: z
    .string()
    .min(3, { message: "Content must be at least 3 characters in length" })
    .max(255, { message: "Content must not exceed 255 characters" }),
});

export type SupportFormSchema = z.infer<typeof supportFormSchema>;
