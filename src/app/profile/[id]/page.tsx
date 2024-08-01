"use client";
import { api } from "@/trpc/react";
import { InfinitePostList } from "@/components/posts/InfinitePostList";

export default function Page({ params }: { params: { id: string } }) {
  const posts = api.post.infiniteProfileFeed.useInfiniteQuery(params, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return (
    <InfinitePostList
      posts={posts.data?.pages.flatMap((page) => page.posts)}
      isError={posts.isError}
      hasMore={posts.hasNextPage}
      fetchNewPosts={posts.fetchNextPage}
      isLoading={posts.isLoading}
    />
  );
}
