import { Separator } from "@/components/ui/separator";
import React, { type ReactNode } from "react";
import { getServerAuthSession } from "@/server/auth";

export default async function layout({ children }: { children: ReactNode }) {
  const session = await getServerAuthSession();

  if (!session)
    return (
      <h1 className="flex h-screen w-screen text-center">
        Please log in to see your notifications
      </h1>
    );

  return (
    <div className=" space-y-6 p-10 pb-16 ">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground">
          See all of your most recent notifications.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
