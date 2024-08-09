import { HeartIcon, MessageCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { IconHoverEffect } from "@/components/IconHoverEffect";

export const CommentButton = ({
  commentCount,
  onClick,
  isLoading,
}: {
  onClick?: () => void;
  commentCount?: number;
  isLoading?: boolean;
}) => {
  const session = useSession();

  if (session.status === "unauthenticated")
    return (
      <div className={"flex items-center gap-3 text-gray-500"}>
        <MessageCircle className={"-ml-2 size-5 text-secondary"} />
        <span>{commentCount}</span>
      </div>
    );

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={"group flex items-center"}
    >
      <IconHoverEffect>
        <MessageCircle className="-ml-2 size-5 hover:text-primary"></MessageCircle>
      </IconHoverEffect>
      <span>{commentCount}</span>
    </button>
  );
};
