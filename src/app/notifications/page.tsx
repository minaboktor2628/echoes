import { api } from "@/trpc/server";
import { getServerAuthSession } from "@/server/auth";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { NotificationsList } from "@/components/notifications/NotificationsList";

export default async function Page() {
  const session = await getServerAuthSession();
  if (!session) return null;

  return <Notifications userId={session.user.id} />;
}

const Notifications = async ({ userId }: { userId: string }) => {
  const notifications = await api.notifications.get({ userId });
  if (!notifications || notifications.notification.length === 0)
    return (
      <h2 className={"text-grey-500 my-4 text-center text-2xl"}>
        Woohoo! You&apos;re all caught up!
      </h2>
    );

  return (
    <div className="flex w-full flex-col space-y-2">
      <NotificationsList notifications={notifications.notification} />
    </div>
  );
};
