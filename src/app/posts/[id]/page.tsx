"use client";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Error from "next/error";
import { PostCard } from "@/components/posts/PostCard";
import { CommentCard } from "@/components/comments/CommentCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MakeCommentForm } from "@/components/comments/MakeCommentForm";
import { useRef } from "react";

export default function Page({ params }: { params: { id: string } }) {
  const { data: post, isError, isLoading } = api.post.getById.useQuery(params);
  const { status } = useSession();
  const makeCommentRef = useRef<HTMLInputElement>(null);
  if (isLoading) return <LoadingSpinner big />;
  if (!post || isError) return <Error statusCode={404} />;

  const handleFocus = () => {
    if (makeCommentRef.current) {
      makeCommentRef.current.focus();
    }
  };

  return (
    <div className={"flex min-h-screen flex-col"}>
      <PostCard
        {...post}
        isMyPost={post.isMyPost}
        commentButtonOnCLick={handleFocus}
        isPostRoute={true}
      />
      <Card className={"rounded-0 flex-1 border-0"}>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className={"space-y-4"}>
            {post.comments.map((comment) => (
              <CommentCard {...comment} key={comment.id} />
            ))}
          </ol>
        </CardContent>
      </Card>
      {status === "authenticated" && (
        <div className={"sticky bottom-0 "}>
          <MakeCommentForm
            type={"create"}
            postId={post.id}
            ref={makeCommentRef}
          />
        </div>
      )}
    </div>
  );
}
