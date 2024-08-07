import {
  createTRPCContext,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  deletePostSchema,
  infiniteListSchema,
  infiniteProfileListSchema,
  postFormSchema,
  toggleLikeSchema,
  updatePostSchema,
} from "@/types/post";
import { inferAsyncReturnType } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { SendMail } from "@/lib/nodemailer";
export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(postFormSchema)
    .mutation(async ({ ctx, input: { content } }) => {
      const by = extractIds(content);
      if (by.length > 0) {
        const usersMentioned = await ctx.db.user.findMany({
          where: { id: { in: by } },
          select: { email: true },
        });

        const emailAddresses = usersMentioned.map((user) => user.email);
        await SendMail({
          options: {
            to: emailAddresses,
            subject: "You were mentioned!",
            text: "hi",
          },
        });
      }
      return ctx.db.post.create({
        data: {
          content: content,
          createdBy: { connect: { id: ctx.session.user.id } },
          mentions: by ? { connect: by.map((id) => ({ id })) } : undefined,
        },
      });
    }),

  update: protectedProcedure
    .input(updatePostSchema)
    .mutation(async ({ ctx, input: { id, content } }) => {
      const by = extractIds(content);
      const oldPostMentions =
        (await ctx.db.post
          .findUnique({
            where: { id },
            select: { mentions: { select: { id: true } } },
          })
          .then((r) => r?.mentions.map((mention) => mention.id))) || [];

      const newMentionedUsers = by.filter(
        (mention) => !oldPostMentions.includes(mention),
      );
      if (newMentionedUsers.length > 0) {
        const usersMentioned = await ctx.db.user
          .findMany({
            where: { id: { in: newMentionedUsers } },
            select: { email: true },
          })
          .then((r) => r.map((user) => user.email));

        await SendMail({
          options: {
            to: usersMentioned,
            subject: "You were mentioned!",
            text: "hi",
          },
        });
      }
      return ctx.db.post.update({
        where: { id },
        data: {
          content: content,
          mentions: by ? { connect: by.map((id) => ({ id })) } : undefined,
        },
      });
    }),

  delete: protectedProcedure
    .input(deletePostSchema)
    .mutation(async ({ ctx, input: { id } }) => {
      return ctx.db.post.delete({
        where: { id },
      });
    }),

  toggleLike: protectedProcedure
    .input(toggleLikeSchema)
    .mutation(async ({ ctx, input: { id } }) => {
      const data = { postId: id, userId: ctx.session.user.id };

      const existingLike = await ctx.db.like.findUnique({
        where: { postId_userId: data },
      });

      if (existingLike == null) {
        await ctx.db.like.create({ data });
        return { addedLike: true };
      } else {
        await ctx.db.like.delete({ where: { postId_userId: data } });
        return { addedLike: true };
      }
    }),

  infiniteProfileFeed: publicProcedure
    .input(infiniteProfileListSchema)
    .query(async ({ ctx, input: { id, cursor, limit = 30 } }) => {
      return getInfiniteTweets({
        whereClause: {
          createdById: id,
        },
        limit,
        cursor,
        ctx,
      });
    }),

  infiniteFeed: publicProcedure
    .input(infiniteListSchema)
    .query(
      async ({ input: { limit = 30, cursor, onlyFollowing = false }, ctx }) => {
        return getInfiniteTweets({
          limit,
          cursor,
          ctx,
          whereClause:
            ctx.session?.user.id == null || !onlyFollowing
              ? {}
              : {
                  createdBy: {
                    followers: { some: { id: ctx.session.user.id } },
                  },
                },
        });
      },
    ),
});

function extractIds(input: string) {
  // const regex = /@\[(.*?)]\(.*?\)/g;
  const regex = /@\[[^\]]+]\((.*?)\)/g;
  let matches: RegExpExecArray | null;
  const results: string[] = [];
  while ((matches = regex.exec(input)) !== null) {
    if (matches[1] !== undefined) {
      results.push(matches[1]);
    }
  }
  return results;
}

async function getInfiniteTweets({
  whereClause,
  ctx,
  limit,
  cursor,
}: {
  whereClause?: Prisma.PostWhereInput;
  limit: number;
  cursor: { id: string; createdAt: Date } | undefined;
  ctx: inferAsyncReturnType<typeof createTRPCContext>;
}) {
  const posts = await ctx.db.post.findMany({
    where: whereClause,
    take: limit + 1,
    cursor: cursor ? { createdAt_id: cursor } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { likes: true } },
      likes:
        ctx.session?.user.id == undefined || ctx.session?.user.id == null
          ? false
          : { where: { userId: ctx.session?.user.id } },
      mentions: {
        select: {
          name: true,
          id: true,
          image: true,
          createdAt: true,
          bio: true,
        },
      },
      createdBy: {
        select: {
          createdAt: true,
          bio: true,
          name: true,
          id: true,
          image: true,
        },
      },
    },
  });

  let nextCursor: typeof cursor | undefined;
  if (posts.length > limit) {
    const nextItem = posts.pop();
    if (nextItem != null)
      nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
  }

  return {
    posts: posts.map((post) => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      likeCount: post._count.likes,
      user: post.createdBy,
      edited:
        post.updatedAt.toLocaleTimeString() !==
        post.createdAt.toLocaleTimeString(),
      likedByMe: ctx.session == null ? false : post.likes.length > 0,
      mentions: post.mentions,
    })),
    nextCursor,
  };
}
