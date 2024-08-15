"use client";
import { type Notification } from "@/types/notifications";
import Link from "next/link";
import { Button } from "../ui/button";
import { FollowBackButton } from "@/components/notifications/FollowBackButton";
import { api } from "@/trpc/react";

export const NotificationActionButton = ({
  route,
  followReqUserId,
  type,
  notificationId,
}: { notificationId: string } & Pick<
  Notification,
  "type" | "route" | "followReqUserId"
>) => {
  const notification = api.notifications.delete.useMutation();

  if (followReqUserId) {
    return (
      <FollowBackButton notificationId={notificationId} id={followReqUserId} />
    );
  }

  return (
    <Button
      asChild
      type={"submit"}
      onClick={() => notification.mutate({ notificationId })}
    >
      <Link href={route}>Go to {type}</Link>
    </Button>
  );
};
