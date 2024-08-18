import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
export const userRouter = createTRPCRouter({
  getBlockedUser: protectedProcedure.query(async ({ ctx }) => {
    // if (ctx.session.user.blockedUserIds.length === 0) return [];

    return ctx.db.user.findMany({
      where: { id: { in: ctx.session.user.blockedUserIds } },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });
  }),

  getFriends: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        followers: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }
    return user.followers
      .filter((follower) => follower.name !== null)
      .map((follower) => ({
        id: follower.id,
        label: follower.name,
      }));
  }),

  getAllUsers: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return ctx.db.user
        .findMany({
          where: {
            name: {
              contains: input,
              mode: "insensitive",
            },
          },
          select: {
            name: true,
            id: true,
          },
          take: 10,
        })
        .then((users) =>
          users.map((user) => ({
            id: user.id,
            display: user.name,
          })),
        );
    }),
});
