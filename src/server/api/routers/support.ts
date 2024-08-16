import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { SendMail } from "@/lib/nodemailer";
import * as process from "node:process";
import {
  blockUserSchema,
  reportSchema,
  supportFormSchema,
} from "@/types/support";

export const supportRoute = createTRPCRouter({
  create: publicProcedure
    .input(supportFormSchema)
    .mutation(async ({ ctx, input: { content, title } }) => {
      return SendMail({
        options: {
          to: process.env.GMAIL_DOMAIN,
          subject: `Support ticket: ${title}`,
          text: `User: ${ctx?.session?.user.name}\n
          id: ${ctx?.session?.user.id}\n\n\n
          Text: ${content}`,
        },
      });
    }),

  report: protectedProcedure
    .input(reportSchema)
    .mutation(async ({ ctx, input: { id, reason, type } }) => {
      return SendMail({
        options: {
          to: process.env.GMAIL_DOMAIN,
          subject: `Report: ${type}`,
          text: `${ctx.session.user.name}(${ctx.session.user.id} reported  with\n\nid: ${id}\n\nfor${reason})`,
        },
      });
    }),

  block: protectedProcedure
    .input(blockUserSchema)
    .mutation(async ({ ctx, input: { id } }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { blockedUserIds: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { blockedUserIds: { set: [...user.blockedUserIds, id] } },
      });
    }),
});
