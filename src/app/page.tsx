"use client";
import { PostForm } from "@/components/posts/MakePostForm";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfinitePostList } from "@/components/posts/InfinitePostList";
import { api } from "@/trpc/react";

export default function Home() {
  const { status } = useSession();
  if (status === "unauthenticated") return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Make a post</CardTitle>
        </CardHeader>
        <CardContent>
          <PostForm />
        </CardContent>
      </Card>
      <RecentPosts />
    </>
  );
}

function RecentPosts() {
  const posts = api.post.infiniteFeed.useInfiniteQuery(
    {},
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

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
