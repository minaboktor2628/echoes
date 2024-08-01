"use client";
import { api } from "@/trpc/react";
import { InfinitePostList } from "@/components/posts/InfinitePostList";
import { ProfileImage } from "@/components/ProfileImage";
import { getPlural } from "@/lib/utils";
import { FollowButton } from "@/components/profile/FollowButton";
import React from "react";

export default function Page({ params }: { params: { id: string } }) {
  const { data: profile } = api.profile.getById.useQuery(params);
  const posts = api.post.infiniteProfileFeed.useInfiniteQuery(params, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return (
    <>
      <div className={"flex items-center border-t p-4"}>
        <ProfileImage src={profile?.image} className={"size-14"} />
        <div className={"ml-2 flex-grow"}>
          <h1 className={"text-lg font-bold"}>{profile?.name}</h1>
          <div className={"text-gray-500"}>
            {profile?.postCount}{" "}
            {getPlural(profile?.postCount ?? 0, "Post", "Posts")} -{" "}
            {profile?.followerCount}{" "}
            {getPlural(profile?.postCount ?? 0, "Follower", "Followers")} -{" "}
            {profile?.followsCount} Following
          </div>
        </div>
        <FollowButton
          userId={params.id}
          userName={profile?.name}
          isFollowing={profile?.isFollowing}
        />
      </div>
      <InfinitePostList
        posts={posts.data?.pages.flatMap((page) => page.posts)}
        isError={posts.isError}
        hasMore={posts.hasNextPage}
        fetchNewPosts={posts.fetchNextPage}
        isLoading={posts.isLoading}
      />
    </>
  );
}
