"use client";
import { PostForm } from "@/components/posts/MakePostForm";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfinitePostList } from "@/components/posts/InfinitePostList";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { getPosts, infiniteListSchema } from "@/types/post";
import { Header } from "@/components/layouts/header";

const TABS = ["Recent", "Following"] as const;
type Tabs = (typeof TABS)[number];
export default function Home() {
  const { status } = useSession();
  const [selectedTab, setSelectedTab] = useState<Tabs>("Recent");
  return (
    <>
      {status === "authenticated" && (
        <div>
          <div className={"flex"}>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`flex-grow p-2 hover:bg-gray-200 focus-visible:bg-gray-200 ${tab === selectedTab ? "border-b-4 border-primary font-bold" : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <Card className={"rounded-none border-0"}>
            <CardHeader>
              <CardTitle>Make a post</CardTitle>
            </CardHeader>
            <CardContent>
              <PostForm />
            </CardContent>
          </Card>
        </div>
      )}
      <Posts onlyFollowing={selectedTab === "Following"} />
    </>
  );
}

function Posts({ onlyFollowing }: getPosts) {
  const posts = api.post.infiniteFeed.useInfiniteQuery(
    { onlyFollowing },
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
