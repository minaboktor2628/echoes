import { useSession } from "next-auth/react";
import { VscHeart, VscHeartFilled } from "react-icons/vsc";
import { IconHoverEffect } from "@/components/IconHoverEffect";

export const HeartButton = ({
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
