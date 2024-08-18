"use client";
import { api } from "@/trpc/react";
import { InfinitePostList } from "@/components/posts/InfinitePostList";
import { ProfileImage } from "@/components/ProfileImage";
import { getPlural } from "@/lib/utils";
import { FollowButton } from "@/components/profile/FollowButton";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { UserDropDownMenu } from "@/components/profile/UserDropDownMenu";
import Error from "next/error";

const AUTHENTICATED_TABS = ["Recent", "Mentioned In", "Diary"] as const;
const UNAUTHENTICATED_TABS = ["Recent", "Mentioned In"] as const;

export default function Page({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const { data: profile } = api.profile.getById.useQuery(params);

  const TABS =
    status === "authenticated" && session?.user.id === params.id
      ? AUTHENTICATED_TABS
      : UNAUTHENTICATED_TABS;
  const [selectedTab, setSelectedTab] =
    useState<(typeof TABS)[number]>("Recent");

  const posts = api.post.infiniteProfileFeed.useInfiniteQuery(
    { id: params.id, tab: selectedTab },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  if (!profile) return <Error statusCode={404} />;

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
            {profile?.followsCount} Following
          </div>
          <span className={"text-gray-500"}>{profile?.bio}</span>
        </div>
        <FollowButton
          accountVisibility={profile.accountVisibility}
          userId={params.id}
          userName={profile?.name}
          isFollowing={profile?.isFollowing}
        />
        <UserDropDownMenu
          status={status}
          isMyProfile={profile.isMyProfile}
          id={params.id}
          name={profile.name}
        />
      </div>
      <div className={"flex"}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`flex-grow p-2 hover:bg-accent focus-visible:bg-gray-200 ${tab === selectedTab ? "border-b-4 border-primary font-bold" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>
      {profile.isMyProfile ||
      profile.accountVisibility === "public" ||
      profile.isFollowing ? (
        <InfinitePostList
          isMyProfile={profile?.isMyProfile}
          posts={posts.data?.pages.flatMap((page) => page.posts)}
          isError={posts.isError}
          hasMore={posts.hasNextPage}
          fetchNewPosts={posts.fetchNextPage}
          isLoading={posts.isLoading}
        />
      ) : (
        <span className={"text-center text-xl"}>
          This user&apos;s profile is private. They must accept your follow
          request in order for you to be able to see their posts.
        </span>
      )}

      {/*{profile.accountVisibility === "private" &&*/}
      {/*!profile.isFollowing &&*/}
      {/*profile.name !== session?.user?.name ? (*/}
      {/*  <span className={"text-center text-xl"}>*/}
      {/*    This user&apos;s profile is private. They must accept your follow*/}
      {/*    request in order for you to be able to see their posts.*/}
      {/*  </span>*/}
      {/*) : (*/}
      {/*  <InfinitePostList*/}
      {/*    isMyProfile={profile?.isMyProfile}*/}
      {/*    posts={posts.data?.pages.flatMap((page) => page.posts)}*/}
      {/*    isError={posts.isError}*/}
      {/*    hasMore={posts.hasNextPage}*/}
      {/*    fetchNewPosts={posts.fetchNextPage}*/}
      {/*    isLoading={posts.isLoading}*/}
      {/*  />*/}
      {/*)}*/}
    </>
  );
}
