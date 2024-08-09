"use client";
import { PostCard } from "@/components/posts/InfinitePostList";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Error from "next/error";

export default function Page({ params }: { params: { id: string } }) {
  const { data: post, isError, isLoading } = api.post.getById.useQuery(params);

  if (isLoading) return <LoadingSpinner big />;
  if (!post || isError) return <Error statusCode={404} />;

  return (
    <div>
      <PostCard {...post} />
    </div>
  );
}
