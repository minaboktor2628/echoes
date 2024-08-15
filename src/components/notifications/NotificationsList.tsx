"use client";

import { Notification } from "@/types/notifications";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import React from "react";

export const NotificationsList = ({
  notifications: initialNotifications,
}: {
  notifications: Notification[];
}) => {
  const [notifications, setNotifications] =
    React.useState<Notification[]>(initialNotifications);

  const handleDelete = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id),
    );
  };

  if (!notifications || notifications.length === 0)
    return (
      <h2 className={"text-grey-500 my-4 text-center text-2xl"}>
        Woohoo! You&apos;re all caught up!
      </h2>
    );

  return (
    <div className={"flex flex-col space-y-2"}>
      {notifications.map((notification) => (
        <NotificationCard
          {...notification}
          key={notification.id}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};
