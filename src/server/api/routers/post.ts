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
    .mutation(async ({ ctx, input: { content, replyToId, postId } }) => {
      const createCommentArgs: Prisma.CommentCreateArgs = replyToId
        ? {
            data: {
              user: { connect: { id: ctx.session.user.id } },
              comment: content,
              post: { connect: { id: postId } },
              parent: { connect: { id: replyToId } },
            },
          }
        : {
            data: {
              user: { connect: { id: ctx.session.user.id } },
              comment: content,
              post: { connect: { id: postId } },
            },
          };

      return ctx.db.comment.create(createCommentArgs);
    }),

  getById: publicProcedure
    .input(getPostByIdSchema)
    .query(async ({ ctx, input: { id } }) => {
      const post = await ctx.db.post.findUnique({
        where: { id },
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
          comments: {
            orderBy: [{ createdAt: "desc" }],
            select: {
              parent: {
                select: {
                  id: true,
                },
              },
              comment: true,
              createdAt: true,
              replies: true,
              _count: { select: { likes: true, replies: true } },
              user: {
                select: {
                  name: true,
                  id: true,
                  image: true,
                  createdAt: true,
                  bio: true,
                },
              },
            },
          },
        },
      });

      if (!post) return;

      return {
        id: post.id,
        comments: post.comments,
        isMyPost: post.createdBy.id === ctx?.session?.user.id,
        content: post.content,
        createdAt: post.createdAt,
        likeCount: post._count.likes,
        commentCount: 0,
        user: post.createdBy,
        edited:
          post.updatedAt.toLocaleTimeString() !==
          post.createdAt.toLocaleTimeString(),
        likedByMe: ctx.session == null ? false : post.likes.length > 0,
        mentions: post.mentions,
      };
    }),

  create: protectedProcedure
    .input(postFormSchema)
    .mutation(async ({ ctx, input: { content } }) => {
      const by = extractIds(content);
      const post = await ctx.db.post.create({
        data: {
          content: content,
          createdBy: { connect: { id: ctx.session.user.id } },
          mentions: by ? { connect: by.map((id) => ({ id })) } : undefined,
        },
      });

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
    .mutation(async ({ ctx, input: { id, content } }) => {
      const by = extractIds(content);
      const post = await ctx.db.post.update({
        where: { id },
        data: {
          content: content,
          mentions: by ? { connect: by.map((id) => ({ id })) } : undefined,
        },
      });

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

  infiniteProfileFeed: publicProcedure
    .input(infiniteProfileListSchema)
    .query(async ({ ctx, input: { id, tab, cursor, limit = 30 } }) => {
      const where: Prisma.PostWhereInput =
        tab === "Mentioned In"
          ? {
              mentions: { some: { id } },
            }
          : {
              createdById: id,
            };

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
  //TODO
  // const commentCount = await ctx.db.comment
  //   .findMany({
  //     where: {
  //       post: { id: { in: posts.map((post) => post.id) } },
  //     },
  //   })
  //   .then((comments) => comments.length);

  return {
    posts: posts.map((post) => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      likeCount: post._count.likes,
      commentCount: 0,
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
