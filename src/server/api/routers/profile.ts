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
      let addedFollow: "requested to follow" | "followed" | "unfollowed";
      const currentUserId = ctx.session.user.id;
      const existingFollow = await ctx.db.user.findFirst({
        where: { id, followers: { some: { id: currentUserId } } },
        select: { socialEmails: true, email: true },
      });

      if (existingFollow == null) {
        const toFollowUser = await ctx.db.user.findUnique({
          where: { id },
          select: {
            id: true,
            accountVisibility: true,
            socialEmails: true,
            email: true,
            name: true,
          },
        });
        if (toFollowUser?.accountVisibility === "public") {
          const user = await ctx.db.user.update({
            where: { id },
            data: { followers: { connect: { id: currentUserId } } },
          });
          addedFollow = "followed";

          await ctx.db.notification.create({
            data: {
              user: { connect: { id: toFollowUser?.id } },
              title: "You got a follow!",
              content: `${ctx.session.user.name} followed you.`,
              type: "follow",
              route: "/notifications",
            },
          });

          if (user.socialEmails) {
            await SendMail({
              options: {
                to: user.email,
                subject: "You got a follow!",
                html: render(
                  FollowTemplate({
                    reqOrFollow: "followed",
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
        } else if (toFollowUser?.accountVisibility === "private") {
          addedFollow = "requested to follow";
          await ctx.db.notification.create({
            data: {
              user: { connect: { id: toFollowUser?.id } },
              title: "You got a follow request!",
              content: `${ctx.session.user.name} requested to follow you.`,
              type: "followRequest",
              route: "/notifications",
              followReqUserId: currentUserId,
            },
          });

          if (toFollowUser?.socialEmails) {
            await SendMail({
              options: {
                to: toFollowUser?.email,
                subject: "You got a follow request!",
                html: render(
                  FollowTemplate({
                    followedById: ctx.session.user.id,
                    reqOrFollow: "requested to follow",
                    followedByImg: ctx.session.user.image!,
                    profileLink: `/notifications`,
                    followedUsername: ctx.session.user.name!,
                    username: toFollowUser?.name,
                  }),
                ),
              },
            });
          }
        }
      } else {
        await ctx.db.user.update({
          where: { id },
          data: { followers: { disconnect: { id: currentUserId } } },
        });
        addedFollow = "unfollowed";
      }

      // @ts-ignore
      return { addedFollow };
    }),

  acceptFollow: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { followers: { connect: { id } } },
      });

      await ctx.db.notification.create({
        data: {
          user: { connect: { id } },
          title: `${user.name} accepted your follow!`,
          content: `You can now see ${ctx.session.user.name}'s posts.`,
          type: "generic",
          route: `/profile/${ctx.session.user.id}`,
        },
      });

      return { addedFollow: true };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input: { id }, ctx }) => {
      const profile = await ctx.db.user.findUnique({
        where: { id },
        select: {
          id: true,
          accountVisibility: true,
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
        accountVisibility: profile.accountVisibility,
        followerCount: profile._count.followers,
        followsCount: profile._count.follows,
        postCount: profile._count.posts,
        isMyProfile: ctx.session?.user.id === id,
        isFollowing: profile.followers.length > 0,
      };
    }),
});
