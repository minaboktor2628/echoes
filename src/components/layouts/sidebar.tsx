"use client";
import { Home, LogIn, LogOut, User } from "lucide-react";
import Link from "next/link";
import { Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useLinks } from "@/hooks/useLinks";

export const SideBar = () => {
  const { Links } = useLinks();
  const pathname = usePathname();
  const session = useSession();
  const isActive = (path: string) => {
    return path === pathname;
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        {Links.map((link, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Link
                href={link.url}
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${isActive(link.url) ? "bg-accent text-accent-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground md:h-8 md:w-8`}
              >
                <link.icon className="h-5 w-5" />
                <span className="sr-only">{link.title}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{link.title}</TooltipContent>
          </Tooltip>
        ))}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                void (session.status === "unauthenticated"
                  ? signIn("github")
                  : signOut());
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8`}
            >
              {session.status === "unauthenticated" ? (
                <LogIn className="h-5 w-5" />
              ) : (
                <LogOut className="h-5 w-5" />
              )}

              <span className="sr-only">
                {session.status === "unauthenticated" ? "sign in" : "sign out"}
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {session.status === "unauthenticated" ? "Sign in" : "Sign out"}
          </TooltipContent>
        </Tooltip>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={"/settings"}
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${isActive("#") ? "bg-accent text-accent-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground md:h-8 md:w-8`}
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
};
