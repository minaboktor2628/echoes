"use client";
import React from "react";
import Head from "next/head";
import { api } from "@/trpc/react";
import { ProfileImage } from "@/components/ProfileImage";
import { getPlural } from "@/lib/utils";
import { FollowButton } from "@/components/profile/FollowButton";
export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const { data: profile } = api.profile.getById.useQuery(params);
  return (
    <>
      <div className={"flex items-center border-t p-4"}>
        <Head>
          <title>{profile?.name}</title>
        </Head>
        <ProfileImage src={profile?.image} className={"size-14"} />
        <div className={"ml-2 flex-grow"}>
          <h1 className={"text-lg font-bold"}>{profile?.name}</h1>
          <div className={"text-gray-500"}>
            {profile?.postCount}{" "}
            {getPlural(profile?.postCount || 0, "Post", "Posts")} -{" "}
            {profile?.followerCount}{" "}
            {getPlural(profile?.postCount || 0, "Follower", "Followers")} -{" "}
            {profile?.followsCount} Following
          </div>
        </div>
        <FollowButton userId={params.id} />
      </div>
      {children}
    </>
  );
}
