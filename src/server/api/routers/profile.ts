import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
import { SendMail } from "@/lib/nodemailer";
import { render } from "@react-email/components";
import FollowTemplate from "../../../../emails/FollowTemplate";

export const profileRouter = createTRPCRouter({
  toggleFollow: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      let addedFollow: boolean;
      const currentUserId = ctx.session.user.id;
      const existingFollow = await ctx.db.user.findFirst({
        where: { id, followers: { some: { id: currentUserId } } },
        select: { socialEmails: true, email: true },
      });

      if (existingFollow == null) {
        const user = await ctx.db.user.update({
          where: { id },
          data: { followers: { connect: { id: currentUserId } } },
        });
        addedFollow = true;

        if (user.socialEmails) {
          await SendMail({
            options: {
              to: user.email,
              subject: "You got a follow!",
              html: render(
                FollowTemplate({
                  followedById: ctx.session.user.id,
                  followedByImg: ctx.session.user.image!,
                  profileLink: `/profile/${ctx.session.user.id}`,
                  followedUsername: ctx.session.user.name!,
                  username: user.name,
                }),
              ),
            },
          });
        }
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

      if (profile?.followers == undefined) return;

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
