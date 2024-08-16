import type { MentionedUser, Post } from "@/types/post";
import { api } from "@/trpc/react";
import Link from "next/link";
import { ProfileImage } from "@/components/ProfileImage";
import { UserHoverCard } from "@/components/posts/userHoverCard";
import { PostOptionDropdown } from "@/components/posts/postOptionDropdown";
import { HeartButton } from "@/components/posts/buttons/HeartButton";
import { ReactNode, useState } from "react";
import { CommentButton } from "@/components/comments/CommentButton";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { ShareButton } from "@/components/ShareButton";
import { formatDistanceToNow } from "date-fns";

export const PostCard = ({
  id,
  content,
  user,
  edited,
  createdAt,
  likeCount,
  likedByMe,
  mentions,
  isMyPost,
  commentCount,
  isDiary,
  commentButtonOnCLick,
  isPostRoute = false,
}: Post & {
  isMyPost: boolean;
  isPostRoute: boolean;
  commentButtonOnCLick?: () => void;
}) => {
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [localLikedByMe, setLocalLikedByMe] = useState(likedByMe);

  const { status } = useSession();
  const router = useRouter();
  const postContent = replaceMentions(content, mentions);
  const trpcUtils = api.useContext();
  const toggleLike = api.post.toggleLike.useMutation({
    onMutate: async () => {
      // Optimistically update
      setLocalLikedByMe((prev) => !prev);
      setLocalLikeCount((prev) => (localLikedByMe ? prev - 1 : prev + 1));
    },
    onError: (error) => {
      // Revert on error
      setLocalLikedByMe((prev) => !prev);
      setLocalLikeCount((prev) => (localLikedByMe ? prev + 1 : prev - 1));
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update like status. Please try again.",
      });
    },
    onSuccess: async () => {
      await trpcUtils.post.infiniteFeed.invalidate();
      await trpcUtils.post.infiniteProfileFeed.invalidate();
      await trpcUtils.post.getById.invalidate();
      await trpcUtils.profile.getById.invalidate();
    },
  });

  let formattedDate = formatDistanceToNow(createdAt, { addSuffix: true });

  if (formattedDate.startsWith("about ")) {
    formattedDate = formattedDate.replace("about ", "");
  }

  const onLike = () => {
    if (status !== "authenticated") {
      toast({
        variant: "destructive",
        title: "You are not logged in.",
        description: "You must be logged in to like posts",
        action: (
          <ToastAction altText={"Log in"} onClick={() => signIn("discord")}>
            Log In
          </ToastAction>
        ),
      });
      return;
    }
    toggleLike.mutate({ id });
  };

  const onComment = () => {
    if (isPostRoute) {
      if (status === "authenticated" && commentButtonOnCLick) {
        commentButtonOnCLick();
      } else {
        toast({
          variant: "destructive",
          title: "You are not logged in.",
          description: "You must be logged in to comment",
          action: (
            <ToastAction altText={"Log in"} onClick={() => signIn("discord")}>
              Log In
            </ToastAction>
          ),
        });
      }
    } else {
      router.push(`/posts/${id}`);
    }
  };

  return (
    <li className={`"border-b flex gap-4 border-b p-4`} key={user.id}>
      <Link href={`/profile/${user.id}`}>
        <ProfileImage src={user.image} />
      </Link>
      <div className={"flex flex-grow flex-col"}>
        <div className={"flex justify-between gap-1"}>
          <div>
            <UserHoverCard
              className="-my-2 font-semibold outline-none hover:underline focus-visible:underline"
              {...user}
            />
            <span className={"text-gray-500"}> - </span>
            <span className={"text-gray-500"}>{formattedDate}</span>
            {edited && <span className={"text-gray-500"}> - Edited</span>}
          </div>

          <PostOptionDropdown
            isDiary={isDiary}
            content={content}
            isMyPost={isMyPost}
            mentions={mentions}
            id={id}
          />
        </div>
        <div className={"whitespace-pre-wrap"}>{postContent}</div>
        <div className={"flex flex-row"}>
          <ShareButton
            key={id}
            title={`Post By ${user.name}`}
            url={`/posts/${id}`}
          />
          <CommentButton commentCount={commentCount} onClick={onComment} />
          <HeartButton
            onClick={onLike}
            isLoading={toggleLike.isPending}
            likeCount={localLikeCount}
            likedByMe={localLikedByMe}
          />
        </div>
      </div>
    </li>
  );
};

export const replaceMentions = (text: string, mentions: MentionedUser[]) => {
  const mentionPattern = /@\[(.*?)]\(.*?\)/g;
  let match;
  const parts: ReactNode[] = [];

  let lastIndex = 0;
  while ((match = mentionPattern.exec(text)) !== null) {
    // Push the text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Find the matching user from mentions
    const mentionText = match[1]; // This is the text captured by (.*?)
    const mentionedUser = mentions.find((user) => user.name === mentionText);

    // Push the React component if the user is found
    if (mentionedUser) {
      parts.push(
        <UserHoverCard
          at
          className={"-my-1"}
          key={mentionedUser.id + lastIndex}
          {...mentionedUser}
        />,
      );
    } else {
      // If the user is not found, include the raw text
      parts.push(match[0]);
    }
    lastIndex = match.index + match[0].length;
  }

  // Push the remaining text after the last match
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};
