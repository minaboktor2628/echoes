import type { Post } from "@/types/post";
import InfiniteScroll from "react-infinite-scroll-component";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { VscHeart, VscHeartFilled } from "react-icons/vsc";
import { IconHoverEffect } from "../IconHoverEffect";
import { api } from "@/trpc/react";
type InfinitePostListProps = {
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  fetchNewPosts: () => Promise<unknown>;
  posts?: Post[];
};

export const InfinitePostList = ({
  posts,
  fetchNewPosts,
  hasMore,
  isError,
  isLoading,
}: InfinitePostListProps) => {
  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1>Error...</h1>;
  if (posts === null || posts === undefined || posts.length === 0)
    return <NoTweets />;

  return (
    <ul>
      <InfiniteScroll
        next={fetchNewPosts}
        loader={"Loading..."}
        dataLength={posts.length}
        hasMore={hasMore}
      >
        {posts.map((post) => {
          return <PostCard {...post} key={post.id} />;
        })}
      </InfiniteScroll>
    </ul>
  );
};

const PostCard = ({
  id,
  content,
  user,
  createdAt,
  likeCount,
  likedByMe,
}: Post) => {
  const trpcUtils = api.useUtils();
  const toggleLike = api.post.toggleLike.useMutation({
    onSuccess: async ({ addedLike }) => {
      // const updateData: Parameters<
      //   typeof trpcUtils.post.infiniteFeed.setInfiniteData
      // >[1] = (oldData) => {
      //   if (oldData == null) return;
      //
      //   return {
      //     ...oldData,
      //     pages: oldData.pages.map((page) => {
      //       return {
      //         ...page,
      //         posts: page.posts.map((post) => {
      //           if (post.id === id) {
      //             return {
      //               ...post,
      //               likeCount: post.likeCount + (addedLike ? 1 : -1),
      //               likedByMe: addedLike,
      //             };
      //           }
      //
      //           return post;
      //         }),
      //       };
      //     }),
      //   };
      // };
      await trpcUtils.post.infiniteFeed.invalidate();
    },
  });

  const DateTimeFormater = new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
  });

  const onSubmit = () => {
    toggleLike.mutate({ id });
    // router.refresh();
  };

  return (
    <li className={"flex gap-4 border-b p-4"}>
      <Link href={`/profile/${user.id}`}>
        <Avatar>
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback>{user?.name}</AvatarFallback>
        </Avatar>
      </Link>
      <div className={"flex flex-grow flex-col"}>
        <div className={"flex gap-1"}>
          <Link
            className={
              "font-semibold outline-none hover:underline focus-visible:underline"
            }
            href={`/profile/${user.id}`}
          >
            {user.name}
          </Link>
          <span className={"text-gray-500"}>-</span>
          <span className={"text-gray-500"}>
            {DateTimeFormater.format(createdAt)}
          </span>
        </div>
        <p className={"whitespace-pre-wrap"}>{content}</p>
        <HeartButton
          onClick={onSubmit}
          isLoading={toggleLike.isPending}
          likeCount={likeCount}
          likedByMe={likedByMe}
        />
      </div>
    </li>
  );
};

const HeartButton = ({
  likedByMe,
  likeCount,
  onClick,
  isLoading,
}: {
  onClick: () => void;
  likeCount: number;
  likedByMe: boolean;
  isLoading: boolean;
}) => {
  const session = useSession();
  const HeartIcon = likedByMe ? VscHeartFilled : VscHeart;

  if (session.status === "unauthenticated")
    return (
      <div
        className={"mb-1 mt-1 flex items-center gap-3 self-start text-gray-500"}
      >
        <HeartIcon />
        <span>{likeCount}</span>
      </div>
    );

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`group -ml-2 flex items-center gap-1 self-start transition-colors duration-500 ${likedByMe ? "text-red-500" : "text-grey-500 hover:text-red-500 focus-visible:text-red-500"}`}
    >
      <IconHoverEffect red>
        <HeartIcon
          className={`transition-colors duration-200 ${likedByMe ? "fill-red-500" : "fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500"}`}
        ></HeartIcon>
      </IconHoverEffect>
      <span>{likeCount}</span>
    </button>
  );
};

const NoTweets = () => {
  return (
    <h2 className={"text-grey-500 my-4 text-center text-2xl"}>
      No posts found
    </h2>
  );
};
