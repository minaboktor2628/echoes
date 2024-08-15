import { DeleteCommentSchema } from "@/types/comment";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/use-toast";

export const DeleteCommentForm = ({
  commentId,
  postId,
  createdById,
}: DeleteCommentSchema) => {
  const trpcUtils = api.useUtils();
  const deleteComment = api.comment.delete.useMutation({
    onSuccess: async () => {
      await trpcUtils.post.getById.invalidate();
      toast({
        title: "Success!",
        description: "You deleted your comment.",
      });
    },
  });

  const onClick = () => {
    deleteComment.mutate({
      commentId,
      postId,
      createdById,
    });
  };

  return <Button onClick={onClick}>Delete Comment</Button>;
};
