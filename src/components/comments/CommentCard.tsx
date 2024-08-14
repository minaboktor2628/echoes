import { Comment } from "@/types/post";
import { ProfileImage } from "@/components/ProfileImage";
import Link from "next/link";
import { UserHoverCard } from "@/components/posts/userHoverCard";
import { HeartButton } from "@/components/posts/buttons/HeartButton";
import { api } from "@/trpc/react";
import { replaceMentions } from "@/components/posts/PostCard";

export const CommentCard = ({
  likedByMe,
  createdAt,
  user,
  edited,
  id,
  content,
  likeCount,
}: Comment) => {
  // const commentContent = replaceMentions(content, mentions);
  const trpcUtils = api.useUtils();
  const toggleLike = api.post.toggleCommentLike.useMutation({
    onSuccess: async () => {
      await trpcUtils.post.infiniteFeed.invalidate();
      await trpcUtils.post.getById.invalidate();
      await trpcUtils.post.infiniteProfileFeed.invalidate();
      await trpcUtils.profile.getById.invalidate();
    },
  });
  const DateTimeFormater = new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
  });

  const onLike = () => {
    toggleLike.mutate({ id });
  };

  return (
    <li className={"flex w-full flex-row border-b"}>
      <div className="ml-2 flex w-full gap-4 rounded-xl  pb-1  pt-4" key={id}>
        <div className="flex w-full flex-col">
          <div className={"flex text-center"}>
            <Link href={`/profile/${user.id}`}>
              <ProfileImage src={user.image} className={"size-7"} />
            </Link>
            <div className={"ml-2 text-center"}>
              <UserHoverCard
                className="-my-2 font-semibold outline-none hover:underline focus-visible:underline"
                {...user}
              />
              <span className={"text-gray-500"}> - </span>
              <span className={"text-gray-500"}>
                {DateTimeFormater.format(createdAt)}
              </span>
              {edited && <span className={"text-gray-500"}> - Edited</span>}
            </div>
          </div>
          <div className={"whitespace-pre-wrap pt-2"}>{content}</div>
          <div className={"mr-3 self-end"}>
            <HeartButton
              onClick={onLike}
              isLoading={toggleLike.isPending}
              likeCount={likeCount}
              likedByMe={likedByMe}
            />
          </div>
        </div>
      </div>
    </li>
  );
};
