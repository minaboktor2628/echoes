import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import React from "react";

export const ProfileImage = ({
  src,
  className = "",
}: {
  src: string | null | undefined;
  className?: string;
}) => {
  return (
    <Avatar className={className}>
      <AvatarImage src={src || undefined} />
      <AvatarFallback>
        <User />
      </AvatarFallback>
    </Avatar>
  );
};
