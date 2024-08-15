import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { makeCommentSchema, toggleLikeSchema } from "@/types/post";
import { SendMail } from "@/lib/nodemailer";
import { render } from "@react-email/components";
import CommentTemplate from "../../../../emails/CommentTemplate";
import { deleteCommentSchema, updateCommentSchema } from "@/types/comment";

export const commentRoute = createTRPCRouter({
  create: protectedProcedure
    .input(makeCommentSchema)
    .mutation(async ({ ctx, input: { content, postId } }) => {
      const comment = await ctx.db.comment.create({
        data: {
          content,
          user: { connect: { id: ctx.session.user.id } },
          post: { connect: { id: postId } },
        },
      });

      const postUser = await ctx.db.post.findUnique({
        where: { id: postId },
        select: { createdBy: true },
      });

      if (!postUser) return comment;

      if (
        postUser?.createdBy.socialEmails &&
        postUser?.createdBy.id !== ctx.session.user.id
      ) {
        await SendMail({
          options: {
            to: postUser.createdBy.email,
            subject: "A user made a comment on your post!",
            html: render(
              CommentTemplate({
                postLink: `/posts/${postId}`,
                commentByImg: ctx.session.user.image!,
                commentById: ctx.session.user.id,
                commentUsername: ctx.session.user.name!,
                username: postUser.createdBy.name,
              }),
            ),
          },
        });
      }

      await ctx.db.notification.create({
        data: {
          user: { connect: { id: postUser.createdBy.id } },
          title: "You got a comment!",
          content: `${ctx.session.user.name} commented on your post.`,
          type: "comment",
          route: `/posts/${postId}`,
        },
      });

      return comment;
    }),

  toggleLike: protectedProcedure
    .input(toggleLikeSchema)
    .mutation(async ({ ctx, input: { id } }) => {
      const data = { userId: ctx.session.user.id, commentId: id };

      const existingLike = await ctx.db.commentLike.findUnique({
        where: { commentId_userId: data },
      });

      const postedBy = await ctx.db.post.findUnique({
        where: { id },
        select: { createdBy: { select: { id: true } }, id: true },
      });

      if (existingLike == null) {
        await ctx.db.commentLike.create({ data });
        if (postedBy) {
          await ctx.db.notification.create({
            data: {
              user: { connect: { id: postedBy.createdBy.id } },
              title: "You got a like!",
              content: `${ctx.session.user.name} liked your comment.`,
              type: "commentLike",
              route: `/post/${postedBy.id}`,
            },
          });
        }
        return { addedLike: true };
      } else {
        await ctx.db.commentLike.delete({ where: { commentId_userId: data } });
        return { addedLike: true };
      }
    }),

  delete: protectedProcedure
    .input(deleteCommentSchema)
    .mutation(async ({ ctx, input: { commentId, postId, createdById } }) => {
      if (createdById === ctx.session.user.id) {
        return ctx.db.comment.delete({
          where: { id: commentId },
        });
      }

      const post = await ctx.db.post.findUnique({
        where: { id: postId },
        select: { createdBy: { select: { id: true } } },
      });

      if (post?.createdBy.id === ctx.session.user.id) {
        return ctx.db.comment.delete({
          where: { id: commentId },
        });
      }

      return null;
    }),

  update: protectedProcedure
    .input(updateCommentSchema)
    .mutation(async ({ ctx, input: { commentId, content } }) => {
      return ctx.db.comment.update({
        where: { id: commentId },
        data: { content },
      });
    }),
});
