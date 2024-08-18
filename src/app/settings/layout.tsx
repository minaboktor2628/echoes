import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "@/components/SidebarNav";
import React from "react";
import { getServerAuthSession } from "@/server/auth";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and emails preferences.",
};

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings",
  },

  {
    title: "Appearance",
    href: "/settings/appearance",
  },
  {
    title: "Notifications",
    href: "/settings/notifications",
  },
  {
    title: "Blocked Users",
    href: "/settings/blocked-users",
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default async function SettingsLayout({
  children,
}: SettingsLayoutProps) {
  const session = await getServerAuthSession();
  if (!session)
    return (
      <h1 className={"text-center"}>Please log in to see the settings page</h1>
    );

  return (
    <div className=" space-y-6 p-10 pb-16 ">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
