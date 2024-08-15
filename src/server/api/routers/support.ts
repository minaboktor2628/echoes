import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { SendMail } from "@/lib/nodemailer";
import * as process from "node:process";
import { reportSchema, supportFormSchema } from "@/types/support";

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
});
