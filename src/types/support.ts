import { z } from "zod";

export type ReportSchema = z.infer<typeof reportSchema>;
export const reportSchema = z.object({
  reason: z.string(),
  type: z.string(),
  id: z.string(),
});

export type SupportFormSchema = z.infer<typeof supportFormSchema>;
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
