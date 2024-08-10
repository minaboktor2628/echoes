import { useSession } from "next-auth/react";
// import { VscHeart, VscHeartFilled } from "react-icons/vsc";
import { IconHoverEffect } from "@/components/IconHoverEffect";
import { HeartIcon } from "lucide-react";

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

  if (session.status === "unauthenticated")
    return (
      <div className={"flex items-center gap-3 text-gray-500"}>
        <HeartIcon className="size-5 text-secondary" />
        <span>{likeCount}</span>
      </div>
    );

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={"group flex items-center"}
    >
      <IconHoverEffect>
        <HeartIcon
          className={`size-5  ${likedByMe ? "fill-primary text-primary" : "group-hover:fill-primary group-hover:text-primary group-focus-visible:fill-primary"}`}
        ></HeartIcon>
      </IconHoverEffect>
      <span>{likeCount}</span>
    </button>
  );
};
