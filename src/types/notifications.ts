import { z } from "zod";
import type { RouterOutputs } from "@/trpc/react";

export const getAllNotificationsSchema = z.object({
  userId: z.string(),
});

export const deleteNotificationSchema = z.object({
  notificationId: z.string(),
});

export type DeleteNotificationSchema = z.infer<typeof deleteNotificationSchema>;

export type _notificationType = RouterOutputs["notifications"]["get"] | null;
export type Notification = _notificationType extends null
  ? null
  : NonNullable<_notificationType>["notification"][number];

export type NotificationType = Notification["type"];
