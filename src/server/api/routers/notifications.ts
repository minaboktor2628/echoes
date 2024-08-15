import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  deleteNotificationSchema,
  getAllNotificationsSchema,
} from "@/types/notifications";

export const notificationsRoute = createTRPCRouter({
  get: protectedProcedure
    .input(getAllNotificationsSchema)
    .query(async ({ ctx, input: { userId } }) => {
      return ctx.db.user.findUnique({
        where: { id: userId },
        select: {
          notification: {
            select: {
              id: true,
              title: true,
              content: true,
              createdAt: true,
              followReqUserId: true,
              route: true,
              type: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }),

  delete: protectedProcedure
    .input(deleteNotificationSchema)
    .mutation(async ({ ctx, input: { notificationId } }) => {
      return ctx.db.notification.delete({
        where: { id: notificationId },
      });
    }),
});
