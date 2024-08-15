import type { Post } from "@/types/post";
import InfiniteScroll from "react-infinite-scroll-component";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PostCard } from "@/components/posts/PostCard";

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
          return (
            <PostCard
              {...post}
              isMyPost={isMyProfile}
              key={post.id}
              isPostRoute={false}
            />
          );
        })}
      </InfiniteScroll>
    </ul>
  );
};
const NoTweets = () => {
  return (
    <h2 className={"text-grey-500 my-4 text-center text-2xl"}>
      No posts found
    </h2>
  );
};
