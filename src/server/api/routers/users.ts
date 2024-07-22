import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
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
        label: follower.name!,
      }));
  }),
});
