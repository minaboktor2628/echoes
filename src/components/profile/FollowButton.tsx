import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export const FollowButton = ({
  className = "",
  onClick,
  userId,
}: {
  userId: string;
  className?: string;
  onClick?: () => void;
}) => {
  const session = useSession();
  if (
    session.status === "unauthenticated"
    // || session.data?.user.id === userId
  ) {
    return null;
  }
  return <Button className={`${0}`} onClick={onClick}></Button>;
};
