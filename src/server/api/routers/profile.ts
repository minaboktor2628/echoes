import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const profileRouter = createTRPCRouter({
  toggleFollow: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      let addedFollow: boolean;
      const currentUserId = ctx.session.user.id;
      const existingFollow = await ctx.db.user.findFirst({
        where: { id, followers: { some: { id: currentUserId } } },
      });

      if (existingFollow == null) {
        await ctx.db.user.update({
          where: { id },
          data: { followers: { connect: { id: currentUserId } } },
        });
        addedFollow = true;
      } else {
        await ctx.db.user.update({
          where: { id },
          data: { followers: { disconnect: { id: currentUserId } } },
        });
        addedFollow = false;
      }

      return { addedFollow };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input: { id }, ctx }) => {
      const profile = await ctx.db.user.findUnique({
        where: { id },
        select: {
          id: true,
          image: true,
          bio: true,
          name: true,
          _count: {
            select: {
              followers: true,
              follows: true,
              posts: true,
            },
          },
          followers:
            ctx.session?.user.id == null
              ? undefined
              : { where: { id: ctx.session.user.id } },
        },
      });

      if (profile == undefined || profile.followers == undefined) return;

      return {
        name: profile.name,
        image: profile.image,
        bio: profile.bio,
        followerCount: profile._count.followers,
        followsCount: profile._count.follows,
        postCount: profile._count.posts,
        isMyProfile: ctx.session?.user.id === id,
        isFollowing: profile.followers.length > 0,
      };
    }),
});
