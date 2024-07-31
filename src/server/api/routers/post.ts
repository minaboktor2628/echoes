import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  infiniteListSchema,
  postFormSchema,
  toggleLikeSchema,
} from "@/types/post";

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(postFormSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          content: input.content,
          createdBy: { connect: { id: ctx.session.user.id } },
          mentions: input.by
            ? { connect: input.by.map((id) => ({ id })) }
            : undefined,
        },
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

  infiniteFeed: publicProcedure
    .input(infiniteListSchema)
    .query(async ({ input: { limit = 20, cursor }, ctx }) => {
      const posts = await ctx.db.post.findMany({
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          content: true,
          createdAt: true,
          _count: { select: { likes: true } },
          likes:
            ctx.session?.user.id == null
              ? false
              : { where: { userId: ctx.session?.user.id } },
          mentions: {
            select: {
              name: true,
              id: true,
              image: true,
              createdAt: true,
              description: true,
            },
          },
          createdBy: {
            select: {
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
          likedByMe: post.likes.length > 0,
          mentions: post.mentions,
        })),
        nextCursor,
      };
    }),
});
