import type { MentionedUser, Post } from "@/types/post";
import InfiniteScroll from "react-infinite-scroll-component";
import Link from "next/link";
import { api } from "@/trpc/react";
import { HeartButton } from "@/components/posts/HeartButton";
import { UserHoverCard } from "@/components/posts/userHoverCard";
import { ReactNode } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ProfileImage } from "@/components/ProfileImage";
import { Ellipsis } from "lucide-react";
import { PostOptionDropdown } from "@/components/posts/postOptionDropdown";

type InfinitePostListProps = {
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  fetchNewPosts: () => Promise<unknown>;
  posts?: Post[];
  isMyProfile?: boolean;
};

export const InfinitePostList = ({
  posts,
  fetchNewPosts,
  hasMore,
  isError,
  isMyProfile = false,
  isLoading,
}: InfinitePostListProps) => {
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <h1>Error...</h1>;
  if (posts === null || posts === undefined || posts.length === 0)
    return <NoTweets />;

  return (
    <ul>
      <InfiniteScroll
        next={fetchNewPosts}
        loader={<LoadingSpinner />}
        dataLength={posts.length}
        hasMore={hasMore}
      >
        {posts.map((post) => {
          return <PostCard {...post} isMyPost={isMyProfile} key={post.id} />;
        })}
      </InfiniteScroll>
    </ul>
  );
};

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
}: Post & { isMyPost: boolean }) => {
  const postContent = replaceMentions(content, mentions);
  const trpcUtils = api.useUtils();
  const toggleLike = api.post.toggleLike.useMutation({
    onSuccess: async () => {
      await trpcUtils.post.infiniteFeed.invalidate();
      await trpcUtils.post.infiniteProfileFeed.invalidate();
      await trpcUtils.profile.getById.invalidate();
    },
  });

  const DateTimeFormater = new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
  });

  const onSubmit = () => {
    toggleLike.mutate({ id });
  };

  return (
    <li className={"flex gap-4 border-b p-4"} key={user.id}>
      <Link href={`/profile/${user.id}`}>
        <ProfileImage src={user.image} />
      </Link>
      <div className={"flex flex-grow flex-col"}>
        <div className={"flex justify-between gap-1"}>
          <div>
            <UserHoverCard
              className={
                "-my-2 font-semibold outline-none hover:underline focus-visible:underline"
              }
              {...user}
            />
            <span className={"text-gray-500"}> - </span>
            <span className={"text-gray-500"}>
              {DateTimeFormater.format(createdAt)}
            </span>
            {edited && <span className={" text-gray-500"}> - Edited</span>}
          </div>
          {isMyPost && (
            <PostOptionDropdown content={content} mentions={mentions} id={id} />
          )}
        </div>
        <div className={"whitespace-pre-wrap"}>{postContent}</div>
        <div className={"flex"}>
          <HeartButton
            onClick={onSubmit}
            isLoading={toggleLike.isPending}
            likeCount={likeCount}
            likedByMe={likedByMe}
          />
        </div>
      </div>
    </li>
  );
};
const replaceMentions = (text: string, mentions: MentionedUser[]) => {
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

const NoTweets = () => {
  return (
    <h2 className={"text-grey-500 my-4 text-center text-2xl"}>
      No posts found
    </h2>
  );
};
