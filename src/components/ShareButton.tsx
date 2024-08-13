import { ShareIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

export const ShareButton = ({
  title,
  className,
  url,
  children,
}: {
  url: string;
  title: string;
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <button
      className="flex flex-row items-center"
      onClick={() => navigator.share({ url, title })}
    >
      <ShareIcon
        className={cn(" size-5 hover:text-primary", className)}
      ></ShareIcon>
      {children}
    </button>
  );
};
