import { Separator } from "@/components/ui/separator";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { BlockedUserCard } from "@/components/settings/BlockedUserCard";

export default async function SettingsProfilePage() {
  const session = await getServerAuthSession();
  const blockedUsers = await api.user.getBlockedUser();
  if (!session) return;
  if (blockedUsers.length === 0)
    return <span className={"text-center"}>You have no blocked users.</span>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Blocked users</h3>
        <p className="text-sm text-muted-foreground">
          You can unblock users here.
        </p>
      </div>
      <Separator />
      {blockedUsers.map((user) => (
        <BlockedUserCard {...user} key={user.id} />
      ))}
    </div>
  );
}
