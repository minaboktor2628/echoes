import { z } from "zod";

export const getAllNotificationsSchema = z.object({
  userId: z.string(),
});

export const deleteNotificationSchema = z.object({
  notificationId: z.string(),
});

export type DeleteNotificationSchema = z.infer<typeof deleteNotificationSchema>;
