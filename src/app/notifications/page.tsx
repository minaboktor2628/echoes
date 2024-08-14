import { api } from "@/trpc/server";
import { getServerAuthSession } from "@/server/auth";
import { NotificationCard } from "@/components/notifications/NotificationCard";

export default async function Page() {
  const session = await getServerAuthSession();
  if (!session) return null;

  return <NotificationList userId={session.user.id} />;
}

const NotificationList = async ({ userId }: { userId: string }) => {
  const notifications = await api.notifications.get({ userId });
  if (!notifications || notifications.notification.length === 0)
    return (
      <h2 className={"text-grey-500 my-4 text-center text-2xl"}>
        Woohoo! You&apos;re all caught up!
      </h2>
    );

  return (
    <div className="flex flex-col space-y-2">
      {notifications.notification.map((notification) => (
        <NotificationCard {...notification} key={notification.id} />
      ))}
    </div>
  );
};
