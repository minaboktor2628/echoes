import type { MentionedUser, Post } from "@/types/post";
import InfiniteScroll from "react-infinite-scroll-component";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/trpc/react";
import { HeartButton } from "@/components/posts/HeartButton";
import { UserHoverCard } from "@/components/posts/userHoverCard";
type InfinitePostListProps = {
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  fetchNewPosts: () => Promise<unknown>;
  posts?: Post[];
};

export const InfinitePostList = ({
  posts,
  fetchNewPosts,
  hasMore,
  isError,
  isLoading,
}: InfinitePostListProps) => {
  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1>Error...</h1>;
  if (posts === null || posts === undefined || posts.length === 0)
    return <NoTweets />;

  return (
    <ul>
      <InfiniteScroll
        next={fetchNewPosts}
        loader={"Loading..."}
        dataLength={posts.length}
        hasMore={hasMore}
      >
        {posts.map((post) => {
          return <PostCard {...post} key={post.id} />;
        })}
      </InfiniteScroll>
    </ul>
  );
};

const PostCard = ({
  id,
  content,
  user,
  createdAt,
  likeCount,
  likedByMe,
  mentions,
}: Post) => {
  const trpcUtils = api.useUtils();
  const toggleLike = api.post.toggleLike.useMutation({
    onSuccess: async ({ addedLike }) => {
      await trpcUtils.post.infiniteFeed.invalidate();
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
        <Avatar>
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback>{user?.name}</AvatarFallback>
        </Avatar>
      </Link>
      <div className={"flex flex-grow flex-col"}>
        <div className={"flex gap-1"}>
          <Link
            className={
              "font-semibold outline-none hover:underline focus-visible:underline"
            }
            href={`/profile/${user.id}`}
          >
            {user.name}
          </Link>
          <span className={"text-gray-500"}>-</span>
          <span className={"text-gray-500"}>
            {DateTimeFormater.format(createdAt)}
          </span>
        </div>
        <div className={"whitespace-pre-wrap"}>
          {replaceMentions(content, mentions!)}
        </div>
        <HeartButton
          onClick={onSubmit}
          isLoading={toggleLike.isPending}
          likeCount={likeCount}
          likedByMe={likedByMe}
        />
      </div>
    </li>
  );
};

const replaceMentions = (text: string, mentions: MentionedUser) => {
  const mentionPattern = /@\[(.*?)]\(.*?\)/g;
  let match;
  const parts = [];

  let lastIndex = 0;
  while ((match = mentionPattern.exec(text)) !== null) {
    // Push the text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Push the React component
    parts.push(<UserHoverCard {...mentions} />);

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
