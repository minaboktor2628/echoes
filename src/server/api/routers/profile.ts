import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const profileRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input: { id }, ctx }) => {
      const profile = await ctx.db.user.findUnique({
        where: { id },
        select: {
          id: true,
          image: true,
          description: true,
          name: true,
          _count: { select: { followers: true, follows: true, posts: true } },
          followers:
            ctx.session?.user.id == null
              ? undefined
              : { where: { id: ctx.session.user.id } },
        },
      });

      if (profile == null) return;

      return {
        name: profile.name,
        image: profile.image,
        description: profile.description,
        followerCount: profile._count.followers,
        followsCount: profile._count.follows,
        postCount: profile._count.posts,
        isFollowing: profile.followers.length > 0,
      };
    }),
});
