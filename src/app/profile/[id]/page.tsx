"use client";
import { api } from "@/trpc/react";
import { InfinitePostList } from "@/components/posts/InfinitePostList";
import { ProfileImage } from "@/components/ProfileImage";
import { getPlural } from "@/lib/utils";
import { FollowButton } from "@/components/profile/FollowButton";
import React from "react";
import { useSession } from "next-auth/react";

export default function Page({ params }: { params: { id: string } }) {
  const { data: profile } = api.profile.getById.useQuery(params);
  const posts = api.post.infiniteProfileFeed.useInfiniteQuery(params, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  const session = useSession();
  return (
    <>
      <div className={"flex items-center border-t p-6"}>
        <ProfileImage src={profile?.image} className={"size-14"} />
        <div className={"ml-6 flex-grow"}>
          <h1 className={"text-lg font-bold"}>{profile?.name}</h1>
          <div className={"text-gray-500"}>
            {profile?.postCount}{" "}
            {getPlural(profile?.postCount ?? 0, "Post", "Posts")} -{" "}
            {profile?.followerCount}{" "}
            {getPlural(profile?.followerCount ?? 0, "Follower", "Followers")} -{" "}
            {profile?.followsCount} Following - {profile?.likeCount}{" "}
            {getPlural(profile?.likeCount || 0, "Like", "Likes")}
          </div>
        </div>
        <FollowButton
          userId={params.id}
          userName={profile?.name}
          isFollowing={profile?.isFollowing}
        />
      </div>
      <InfinitePostList
        isMyProfile={session.data?.user.id === params.id}
        posts={posts.data?.pages.flatMap((page) => page.posts)}
        isError={posts.isError}
        hasMore={posts.hasNextPage}
        fetchNewPosts={posts.fetchNextPage}
        isLoading={posts.isLoading}
      />
    </>
  );
}
