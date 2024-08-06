import { z } from "zod";

export const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"], {
    required_error: "Please select a theme.",
  }),
});

export type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

export const notificationsFormSchema = z.object({
  communication_emails: z.boolean().default(false).optional(),
  social_emails: z.boolean().default(true).optional(),
  marketing_emails: z.boolean().default(false).optional(),
  mention_emails: z.boolean().default(true).optional(),
  direct_message_emails: z.boolean().default(true).optional(),
  security_emails: z.boolean(),
});

export type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

export const profileFormSchema = z.object({
  bio: z.string().max(160).min(4),
  email: z
    .string({
      required_error: "Please select an email to reach you at.",
    })
    .email(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
