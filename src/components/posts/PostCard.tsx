import type { MentionedUser, Post } from "@/types/post";
import { api } from "@/trpc/react";
import Link from "next/link";
import { ProfileImage } from "@/components/ProfileImage";
import { UserHoverCard } from "@/components/posts/userHoverCard";
import { PostOptionDropdown } from "@/components/posts/postOptionDropdown";
import { HeartButton } from "@/components/posts/HeartButton";
import { ReactNode } from "react";
import { CommentButton } from "@/components/comments/CommentButton";
import { useRouter } from "next/navigation";

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
  commentButtonOnCLick,
  isLoadComments = false,
}: Post & {
  isMyPost: boolean;
  isLoadComments?: boolean;
  commentButtonOnCLick?: () => void;
}) => {
  const router = useRouter();
  const postContent = replaceMentions(content, mentions);
  const trpcUtils = api.useUtils();
  const toggleLike = api.post.toggleLike.useMutation({
    onSuccess: async () => {
      await trpcUtils.post.infiniteFeed.invalidate();
      await trpcUtils.post.getById.invalidate();
      await trpcUtils.post.infiniteProfileFeed.invalidate();
      await trpcUtils.profile.getById.invalidate();
    },
  });

  const DateTimeFormater = new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
  });

  const onLike = () => {
    toggleLike.mutate({ id });
  };

  const onCommentButtonClickOutsidePostRoute = () => {
    if (!isLoadComments) {
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
            <span className={"text-gray-500"}>
              {DateTimeFormater.format(createdAt)}
            </span>
            {edited && <span className={"text-gray-500"}> - Edited</span>}
          </div>
          {isMyPost && (
            <PostOptionDropdown content={content} mentions={mentions} id={id} />
          )}
        </div>
        <div className={"whitespace-pre-wrap"}>{postContent}</div>
        <div className={"flex"}>
          <CommentButton
            commentCount={commentCount}
            onClick={
              isLoadComments
                ? commentButtonOnCLick
                : onCommentButtonClickOutsidePostRoute
            }
          />
          <HeartButton
            onClick={onLike}
            isLoading={toggleLike.isPending}
            likeCount={likeCount}
            likedByMe={likedByMe}
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
