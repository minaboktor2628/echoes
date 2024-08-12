import {
  createTRPCContext,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  deletePostSchema,
  getPostByIdSchema,
  infiniteListSchema,
  infiniteProfileListSchema,
  makeCommentSchema,
  postFormSchema,
  toggleLikeSchema,
  togglePostPrivateSchema,
  updatePostSchema,
} from "@/types/post";
import { inferAsyncReturnType } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { SendMail } from "@/lib/nodemailer";
import { MentionedUserEmail } from "../../../../emails/MentionedTemplate";
import { render } from "@react-email/components";
export const postRouter = createTRPCRouter({
  comment: protectedProcedure
    .input(makeCommentSchema)
    .mutation(async ({ ctx, input: { content, postId } }) => {
      return ctx.db.comment.create({
        data: {
          content,
          user: { connect: { id: ctx.session.user.id } },
          post: { connect: { id: postId } },
        },
      });
    }),

  getById: publicProcedure
    .input(getPostByIdSchema)
    .query(async ({ ctx, input: { id } }) => {
      const post = await ctx.db.post.findUnique({
        where: { id },
        select: {
          id: true,
          isDiary: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { likes: true, comments: true } },
          comments: {
            select: {
              id: true,
              updatedAt: true,
              user: {
                select: {
                  name: true,
                  id: true,
                  image: true,
                  createdAt: true,
                  bio: true,
                },
              },
              content: true,
              createdAt: true,
              _count: { select: { likes: true } },
              likes:
                ctx.session?.user.id == undefined ||
                ctx.session?.user.id == null
                  ? false
                  : { where: { userId: ctx.session?.user.id } },
            },
          },
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

      if (!post || post.isDiary === true) return null;

      return {
        id: post.id,
        comments: post.comments.map((comment) => ({
          id: comment.id,
          content: comment.content,
          user: comment.user,
          likeCount: comment._count.likes,
          createdAt: comment.createdAt,
          edited:
            comment.createdAt.toLocaleTimeString() !==
            comment.updatedAt.toLocaleTimeString(),
          likedByMe: ctx.session == null ? false : comment.likes.length > 0,
        })),
        isDiary: post.isDiary,
        isMyPost: post.createdBy.id === ctx?.session?.user.id,
        content: post.content,
        createdAt: post.createdAt,
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        user: post.createdBy,
        edited:
          post.updatedAt.toLocaleTimeString() !==
          post.createdAt.toLocaleTimeString(),
        likedByMe: ctx.session == null ? false : post.likes.length > 0,
        mentions: post?.mentions,
      };
    }),

  create: protectedProcedure
    .input(postFormSchema)
    .mutation(async ({ ctx, input: { content, isDiary } }) => {
      const by = extractIds(content);
      const post = await ctx.db.post.create({
        data: {
          isDiary,
          content: content,
          createdBy: { connect: { id: ctx.session.user.id } },
          mentions: by ? { connect: by.map((id) => ({ id })) } : undefined,
        },
      });

      if (isDiary) return post;

      if (by.length > 0) {
        const usersMentioned = await ctx.db.user
          .findMany({
            where: { id: { in: by }, mentionEmails: true },
            select: { email: true, name: true },
          })
          .then((users) => users.filter(Boolean));

        for (const user of usersMentioned) {
          const emailTemplate = MentionedUserEmail({
            mentionedByImg: ctx.session.user.image || "",
            postLink: `/posts/${post.id}`,
            content: content,
            mentionedByUsername: ctx.session.user.name!,
            postedDate: new Date(),
            mentionedByEmail: ctx.session.user.email!,
            mentionedById: ctx.session.user.id,
            username: user.name,
          });

          await SendMail({
            options: {
              to: user.email,
              subject: "You were mentioned!",
              html: render(emailTemplate),
            },
          });
        }
      }

      return post;
    }),

  update: protectedProcedure
    .input(updatePostSchema)
    .mutation(async ({ ctx, input: { id, isDiary, content } }) => {
      const by = extractIds(content);
      const post = await ctx.db.post.update({
        where: { id },
        data: {
          isDiary,
          content: content,
          mentions: by ? { connect: by.map((id) => ({ id })) } : undefined,
        },
      });

      if (isDiary) return post;

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
            where: { id: { in: newMentionedUsers }, mentionEmails: true },
            select: { email: true, name: true },
          })
          .then((r) => r.filter(Boolean));

        for (const user of usersMentioned) {
          const emailTemplate = MentionedUserEmail({
            mentionedByImg: ctx.session.user.image || "",
            postLink: `/posts/${post.id}`,
            content: content,
            mentionedByUsername: ctx.session.user.name!,
            postedDate: new Date(),
            mentionedByEmail: ctx.session.user.email!,
            mentionedById: ctx.session.user.id,
            username: user.name,
          });

          await SendMail({
            options: {
              to: user.email,
              subject: "You were mentioned!",
              html: render(emailTemplate),
            },
          });
        }
      }

      return post;
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

  toggleCommentLike: protectedProcedure
    .input(toggleLikeSchema)
    .mutation(async ({ ctx, input: { id } }) => {
      const data = { userId: ctx.session.user.id, commentId: id };

      const existingLike = await ctx.db.commentLike.findUnique({
        where: { commentId_userId: data },
      });

      if (existingLike == null) {
        await ctx.db.commentLike.create({ data });
        return { addedLike: true };
      } else {
        await ctx.db.commentLike.delete({ where: { commentId_userId: data } });
        return { addedLike: true };
      }
    }),
  togglePostPrivate: protectedProcedure
    .input(togglePostPrivateSchema)
    .mutation(async ({ ctx, input: { postId } }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: postId },
        select: { isDiary: true },
      });

      if (!post) return;

      return ctx.db.post.update({
        where: { id: postId },
        data: {
          isDiary: !post.isDiary,
        },
      });
    }),

  infiniteProfileFeed: publicProcedure
    .input(infiniteProfileListSchema)
    .query(async ({ ctx, input: { id, tab, cursor, limit = 30 } }) => {
      let where: Prisma.PostWhereInput;

      switch (tab) {
        case "Recent":
          {
            where = { createdById: id, isDiary: false };
          }
          break;
        case "Mentioned In":
          {
            where = { mentions: { some: { id } }, isDiary: false };
          }
          break;
        case "Diary":
          {
            if (ctx?.session?.user.id) {
              where = { createdById: id, isDiary: true };
            } else {
              where = { createdById: id };
            }
          }
          break;
        default: {
          where = { createdById: id };
        }
      }

      return getInfiniteTweets({
        where,
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
          where:
            ctx.session?.user.id == null || !onlyFollowing
              ? { isDiary: false }
              : {
                  isDiary: false,
                  createdBy: {
                    followers: { some: { id: ctx.session.user.id } },
                  },
                },
        });
      },
    ),
});

function extractIds(input: string) {
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
  where,
  ctx,
  limit,
  cursor,
}: {
  where?: Prisma.PostWhereInput;
  limit: number;
  cursor: { id: string; createdAt: Date } | undefined;
  ctx: inferAsyncReturnType<typeof createTRPCContext>;
}) {
  const posts = await ctx.db.post.findMany({
    where,
    take: limit + 1,
    cursor: cursor ? { createdAt_id: cursor } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      content: true,
      isDiary: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { likes: true, comments: true } },
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
      isDiary: post.isDiary,
      content: post.content,
      createdAt: post.createdAt,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
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
