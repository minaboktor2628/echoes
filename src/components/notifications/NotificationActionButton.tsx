"use client";
import { type Notification } from "@/types/notifications";
import Link from "next/link";
import { Button } from "../ui/button";
import { FollowBackButton } from "@/components/notifications/FollowBackButton";

export const NotificationActionButton = ({
  route,
  followReqUserId,
  type,
}: Pick<Notification, "type" | "route" | "followReqUserId">) => {
  if (followReqUserId) {
    return <FollowBackButton id={followReqUserId} />;
  }

  return (
    <Button asChild type={"submit"}>
      <Link href={route}>Go to {type}</Link>
    </Button>
  );
};
