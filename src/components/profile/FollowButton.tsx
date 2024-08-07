"use client";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { useToast } from "@/components/ui/use-toast";

export const FollowButton = ({
  userId,
  isFollowing,
  userName,
}: {
  userId: string;
  userName: string | null | undefined;
  isFollowing: boolean | undefined;
}) => {
  const trpcUtils = api.useUtils();
  const { toast } = useToast();
  const session = useSession();
  const toggleFollow = api.profile.toggleFollow.useMutation({
    onSuccess: ({ addedFollow }) => {
      toast({
        title: "Success!",
        description: `You ${addedFollow ? "followed" : "unfollowed"} ${userName}.`,
      });
      void trpcUtils.profile.getById.invalidate();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Uh oh!",
        description: `Something went wrong.`,
      });
    },
  });

  if (
    session.status === "unauthenticated" ||
    session.data?.user.id === userId
  ) {
    return null;
  }

  function onToggle() {
    toggleFollow.mutate({ id: userId });
  }

  function getButtonText(loading: boolean, following: boolean | undefined) {
    if (following) {
      return loading ? "Unfollowing..." : "Unfollow";
    } else {
      return loading ? "Following..." : "Follow";
    }
  }

  return (
    <Button
      disabled={toggleFollow.isPending}
      className={`${isFollowing ? "bg-accent" : "bg-primary"}`}
      onClick={onToggle}
    >
      {getButtonText(toggleFollow.isPending, isFollowing)}
    </Button>
  );
};
