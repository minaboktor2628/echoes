import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  appearanceFormSchema,
  notificationsFormSchema,
  profileFormSchema,
} from "@/types/settings";

export const settingsRoute = createTRPCRouter({
  profile: protectedProcedure
    .input(profileFormSchema)
    .mutation(async ({ ctx, input: { bio, email } }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          bio: bio,
          email: email,
        },
      });
    }),

  appearance: protectedProcedure
    .input(appearanceFormSchema)
    .mutation(async ({ ctx, input: { theme } }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { preference: { update: { theme: theme } } },
      });
    }),

  notifications: protectedProcedure
    .input(notificationsFormSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          preference: {
            update: {
              communicationEmails: input.communication_emails,
              directMessageEmails: input.direct_message_emails,
              marketingEmails: input.marketing_emails,
              mentionEmails: input.mention_emails,
              socialEmails: input.social_emails,
            },
          },
        },
      });
    }),
});
