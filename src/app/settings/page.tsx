import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/components/settings/forms/ProfileForm";
import { getServerAuthSession } from "@/server/auth";

export default async function SettingsProfilePage() {
  const session = await getServerAuthSession();
  if (!session) return;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          This is how others will see you on the site.
        </p>
      </div>
      <Separator />
      <ProfileForm />
    </div>
  );
}
