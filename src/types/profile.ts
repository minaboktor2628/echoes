import { z } from "zod";
export const followBackSchema = z.object({
  id: z.string(),
});

export type FollowBackSchema = z.infer<typeof followBackSchema>;
