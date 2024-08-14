import { z } from "zod";

export const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"], {
    required_error: "Please select a theme.",
  }),
});

export type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

export type UserPreferences = {
  theme: "system" | "light" | "dark";
  mentionEmails: boolean;
  communicationEmails: boolean;
  marketingEmails: boolean;
  socialEmails: boolean;
  directMessageEmails: boolean;
};

export const notificationsFormSchema = z.object({
  communicationEmails: z.boolean().default(false).optional(),
  socialEmails: z.boolean().default(true).optional(),
  marketingEmails: z.boolean().default(false).optional(),
  mentionEmails: z.boolean().default(true).optional(),
  directMessageEmails: z.boolean().default(true).optional(),
  securityEmails: z.boolean(),
});

export type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

export const profileFormSchema = z.object({
  bio: z.string().max(160).min(4),
  email: z
    .string({
      required_error: "Please select an emails to reach you at.",
    })
    .email(),
  accountVisibility: z.enum(["private", "public"]),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
