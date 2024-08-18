import {
  type createTRPCContext,
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
  searchInfiniteListSchema,
  toggleLikeSchema,
  togglePostPrivateSchema,
  updatePostSchema,
} from "@/types/post";
import { type inferAsyncReturnType } from "@trpc/server";
import { type Prisma } from "@prisma/client";
import { SendMail } from "@/lib/nodemailer";
import { MentionedUserEmail } from "../../../../emails/MentionedTemplate";
import { render } from "@react-email/components";

export const postRouter = createTRPCRouter({
  getById: publicProcedure
    .input(getPostByIdSchema)
    .query(async ({ ctx, input: { id } }) => {
      const post = await ctx.db.post.findUnique({
        where: {
          id,
          createdBy: { id: { notIn: ctx?.session?.user.blockedUserIds } },
          OR: [
            { createdBy: { accountVisibility: "public" } },
            {
              createdBy: {
                accountVisibility: "private",
                followers: { some: { id: ctx?.session?.user.id } },
              },
            },
            { createdBy: { id: ctx?.session?.user.id } },
          ],
        },
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
              accountVisibility: true,
            },
          },
        },
      });

      if (!post || post.isDiary === true) return null;

      return {
        id: post.id,
        comments: post.comments.map((comment) => ({
          id: comment.id,
          postId: post.id,
          content: comment.content,
          user: comment.user,
          likeCount: comment._count.likes,
          isMyPost: post.createdBy.id === ctx?.session?.user.id,
          createdAt: comment.createdAt,
          isMyComment: comment.user.id === ctx?.session?.user.id,
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
        accountVisibility: post.createdBy.accountVisibility,
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
            where: { id: { in: by } },
            select: { email: true, name: true, id: true, mentionEmails: true },
          })
          .then((users) => users.filter(Boolean));

        for (const user of usersMentioned) {
          if (user.mentionEmails) {
            const emailTemplate = MentionedUserEmail({
              mentionedByImg: ctx.session.user.image ?? "",
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

          await ctx.db.notification.create({
            data: {
              user: { connect: { id: user.id } },
              title: "You were mentioned!",
              content: `${ctx.session.user.name} mentioned you in a post.`,
              type: "mention",
              route: `/posts/${post.id}`,
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
          .then((r) => r?.mentions.map((mention) => mention.id))) ?? [];

      const newMentionedUsers = by.filter(
        (mention) => !oldPostMentions.includes(mention),
      );

      if (newMentionedUsers.length > 0) {
        const usersMentioned = await ctx.db.user
          .findMany({
            where: { id: { in: newMentionedUsers }, mentionEmails: true },
            select: { email: true, name: true, id: true },
          })
          .then((r) => r.filter(Boolean));

        for (const user of usersMentioned) {
          const emailTemplate = MentionedUserEmail({
            mentionedByImg: ctx.session.user.image ?? "",
            postLink: `/posts/${post.id}`,
            content: content,
            mentionedByUsername: ctx.session.user.name!,
            postedDate: new Date(),
            mentionedByEmail: ctx.session.user.email!,
            mentionedById: ctx.session.user.id,
            username: user.name,
          });

          await ctx.db.notification.create({
            data: {
              user: { connect: { id: user.id } },
              title: "You were mentioned!",
              content: `${ctx.session.user.name} mentioned you in a post.`,
              type: "mention",
              route: `/posts/${post.id}`,
            },
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
      const postedBy = await ctx.db.post.findUnique({
        where: { id },
        select: { createdBy: { select: { id: true } } },
      });

      if (existingLike == null) {
        await ctx.db.like.create({ data });
        if (postedBy) {
          await ctx.db.notification.create({
            data: {
              user: { connect: { id: postedBy.createdBy.id } },
              title: "You got a like!",
              content: `${ctx.session.user.name} liked your post.`,
              type: "like",
              route: `/posts/${id}`,
            },
          });
        }
        return { addedLike: true };
      } else {
        await ctx.db.like.delete({ where: { postId_userId: data } });
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
                    id: { not: ctx?.session?.user.id },
                  },
                },
        });
      },
    ),

  infiniteSearchFeed: publicProcedure
    .input(searchInfiniteListSchema)
    .query(
      async ({
        input: { limit = 30, cursor, searchString, onlyFollowing = false },
        ctx,
      }) => {
        const where: Prisma.PostWhereInput = {
          AND: [
            { isDiary: false }, // Add this line to exclude diary posts
            {
              OR: [
                { content: { contains: searchString, mode: "insensitive" } },
                {
                  createdBy: {
                    name: { contains: searchString, mode: "insensitive" },
                  },
                },
              ],
            },
          ],
        };

        return getInfiniteTweets({
          limit,
          cursor,
          ctx,
          where,
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

export async function getInfiniteTweets({
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
    where: {
      AND: [
        where ? where : {},
        {
          // createdBy: { id: { notIn: ctx?.session?.user.blockedUserIds ?? [] } },
          OR: [
            {
              createdBy: {
                accountVisibility: "public",
                id: { notIn: ctx?.session?.user.blockedUserIds ?? [] },
              },
            },
            {
              createdBy: {
                id: { notIn: ctx?.session?.user.blockedUserIds ?? [] },
                accountVisibility: "private",
                followers: { some: { id: ctx?.session?.user.id } },
              },
            },
            { createdBy: { id: ctx?.session?.user.id } },
          ],
        },
      ],
    },
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
