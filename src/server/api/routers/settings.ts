import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  appearanceFormSchema,
  notificationsFormSchema,
  profileFormSchema,
} from "@/types/settings";
import { z } from "zod";
export const settingsRoute = createTRPCRouter({
  unblockUser: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { id } }) => {
      const currentBLockedUsers = ctx.session.user.blockedUserIds ?? [];
      const updatedBlockedUsers = currentBLockedUsers.filter(
        (blockedId) => blockedId !== id,
      );

      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { blockedUserIds: updatedBlockedUsers },
      });
    }),

  profile: protectedProcedure
    .input(profileFormSchema)
    .mutation(async ({ ctx, input: { accountVisibility, bio, email } }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { bio, accountVisibility, email },
      });
    }),

  appearance: protectedProcedure
    .input(appearanceFormSchema)
    .mutation(async ({ ctx, input: { theme } }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { theme },
      });
    }),

  notifications: protectedProcedure
    .input(notificationsFormSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          communicationEmails: input.communicationEmails,
          directMessageEmails: input.directMessageEmails,
          marketingEmails: input.marketingEmails,
          mentionEmails: input.mentionEmails,
          socialEmails: input.socialEmails,
        },
      });
    }),
});
