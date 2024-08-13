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
            {/*- {profile?.likeCount}{" "}*/}
            {/*{getPlural(profile?.likeCount || 0, "Like", "Likes")}*/}
          </div>
          <span className={"text-gray-300"}>{profile?.bio}</span>
        </div>
        <FollowButton
          userId={params.id}
          userName={profile?.name}
          isFollowing={profile?.isFollowing}
        />
        <UserDropDownMenu
          key={params.id}
          id={params.id}
          name={profile.name}
        ></UserDropDownMenu>
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
      <InfinitePostList
        isMyProfile={profile?.isMyProfile}
        posts={posts.data?.pages.flatMap((page) => page.posts)}
        isError={posts.isError}
        hasMore={posts.hasNextPage}
        fetchNewPosts={posts.fetchNextPage}
        isLoading={posts.isLoading}
      />
    </>
  );
}
