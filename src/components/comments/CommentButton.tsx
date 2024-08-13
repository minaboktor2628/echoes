import { MessageCircle } from "lucide-react";
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
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={"group flex items-center"}
    >
      <IconHoverEffect>
        <MessageCircle className="size-5 hover:text-primary"></MessageCircle>
      </IconHoverEffect>
      <span>{commentCount}</span>
    </button>
  );
};
