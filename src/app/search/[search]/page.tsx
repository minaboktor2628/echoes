"use client";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";
import { ProfileImage } from "@/components/ProfileImage";
import { getPlural } from "@/lib/utils";
import { FollowButton } from "@/components/profile/FollowButton";
import { UserDropDownMenu } from "@/components/profile/UserDropDownMenu";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { InfinitePostList } from "@/components/posts/InfinitePostList";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const TABS = ["Users", "Posts"] as const;
type Tabs = (typeof TABS)[number];

export default function Page({ params }: { params: { search: string } }) {
  const { status } = useSession();
  const [selectedTab, setSelectedTab] = useState<Tabs>("Users");
  const users = api.profile.getBySearch.useQuery({
    searchString: params.search,
  });
  const posts = api.post.infiniteSearchFeed.useInfiniteQuery(
    { onlyFollowing: false, searchString: params.search },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  if (users.isLoading || posts.isLoading) return <LoadingSpinner big />;

  return (
    <div className="">
      <div className={"pb-6 pl-10 pt-6"}>
        <h2 className="text-2xl font-bold tracking-tight">Search</h2>
        <p className="text-muted-foreground">Search for users or posts.</p>
      </div>
      <Separator />
      <div>
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
        {selectedTab === "Users" && (
          <div>
            {users.data?.users.length === 0 ? (
              <h2 className={"text-grey-500 my-4 text-center text-2xl"}>
                No Users Found
              </h2>
            ) : (
              users?.data?.users.map((profile) => (
                <div
                  className={"flex items-center border-t p-6"}
                  key={profile.id}
                >
                  <ProfileImage src={profile?.image} className={"size-14"} />
                  <div className={"ml-6 flex-grow"}>
                    <h1 className={"text-lg font-bold"}>{profile?.name}</h1>
                    <div className={"text-gray-500"}>
                      {profile?.postCount}{" "}
                      {getPlural(profile?.postCount ?? 0, "Post", "Posts")} -{" "}
                      {profile?.followerCount}{" "}
                      {getPlural(
                        profile?.followerCount ?? 0,
                        "Follower",
                        "Followers",
                      )}{" "}
                      - {profile?.followsCount} Following
                    </div>
                    <span className={"text-gray-500"}>{profile?.bio}</span>
                  </div>
                  <FollowButton
                    accountVisibility={profile.accountVisibility}
                    userId={profile.id}
                    userName={profile?.name}
                    isFollowing={profile?.isFollowing}
                  />
                  <UserDropDownMenu
                    status={status}
                    isMyProfile={profile.isMyProfile}
                    id={profile.id}
                    name={profile.name}
                  />
                </div>
              ))
            )}
          </div>
        )}

        {selectedTab === "Posts" && (
          <div>
            {posts.data?.pages.flatMap((page) => page.posts).length === 0 ? (
              <h2 className={"text-grey-500 my-4 text-center text-2xl"}>
                No Posts Found
              </h2>
            ) : (
              <InfinitePostList
                posts={posts.data?.pages.flatMap((page) => page.posts)}
                isError={posts.isError}
                hasMore={posts.hasNextPage}
                fetchNewPosts={posts.fetchNextPage}
                isLoading={posts.isLoading}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
