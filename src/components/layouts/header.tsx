"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  BellIcon,
  LogInIcon,
  LogOutIcon,
  PanelLeft,
  Settings,
  SettingsIcon,
  User2Icon,
  UserSquareIcon,
} from "lucide-react";
import { type RouteLink, useLinks } from "@/hooks/useLinks";
import { signIn, signOut, useSession } from "next-auth/react";
import { ProfileImage } from "@/components/ProfileImage";
import { IconHoverEffect } from "@/components/IconHoverEffect";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SupportTicketForm } from "@/components/SupportTicketForm";
import { api } from "@/trpc/react";
function getLinks(
  Links: RouteLink[],
  status: "unauthenticated" | "authenticated" | "loading",
) {
  const links = Links;
  status === "authenticated" &&
    links.push({
      url: `/settings`,
      access: "user",
      label: "settings",
      title: "Settings",
      icon: Settings,
    });
  return links;
}
export const Header = () => {
  const { data: session, status } = useSession();
  const { Links: links } = useLinks();
  const [isLinkClicked, setIsLinkClicked] = useState(false);
  const pathname = usePathname();
  const Links = getLinks(links, status);
  const { data: notifications } = api.notifications.get.useQuery({
    userId: session?.user.id ?? "",
  });

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet open={isLinkClicked} onOpenChange={setIsLinkClicked}>
        <SheetTrigger asChild>
          <div className={"relative inline-block sm:hidden"}>
            <Button size="icon" variant="outline" className="sm:hidden">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
            {status === "authenticated" &&
              notifications != undefined &&
              notifications?.notification.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
                </span>
              )}
          </div>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            {Links.map((link, index) => (
              <Link
                key={index}
                href={link.url}
                onClick={() => setIsLinkClicked(false)}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-primary"
              >
                <div className="relative inline-block">
                  <link.icon className="h-5 w-5" />
                  {link.icon === BellIcon &&
                    status === "authenticated" &&
                    notifications != undefined &&
                    notifications?.notification.length > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
                      </span>
                    )}
                </div>
                <span className="sr-only">{link.title}</span>
                {link.title}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      {pathname !== "/" && (
        <Link href={".."}>
          <IconHoverEffect>
            <ArrowLeftIcon className={"size-8"} />
          </IconHoverEffect>
        </Link>
      )}
      {/*<h1 className={"text-center text-xl font-bold"}>{currentPath}</h1>*/}
      <div className="relative ml-auto flex-1 md:grow-0">
        {/*<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />*/}
        {/*<Input*/}
        {/*  type="search"*/}
        {/*  placeholder="Search..."*/}
        {/*  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"*/}
        {/*/>*/}
      </div>
      {/*<ModeToggle />*/}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <ProfileImage src={session?.user?.image} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href={
                status === "authenticated"
                  ? `/profile/${session?.user?.id}`
                  : "/api/auth/signin/discord"
              }
            >
              <User2Icon className={"mr-2 size-4"} />
              <span>My Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={
                status === "authenticated"
                  ? "/settings"
                  : "/api/auth/signin/discord"
              }
            >
              <SettingsIcon className={"mr-2 size-4"} />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuGroup>
            <Dialog>
              <DialogTrigger asChild>
                <button className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                  <UserSquareIcon className={"mr-2 size-4"} />
                  <span>Support</span>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Support Ticket</DialogTitle>
                  <DialogDescription>Enter information below</DialogDescription>
                </DialogHeader>
                <SupportTicketForm />
              </DialogContent>
            </Dialog>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              status === "authenticated" ? signOut() : signIn("discord")
            }
          >
            {status === "authenticated" ? (
              <>
                <LogOutIcon className={"mr-2 size-4"} />
                <span>Logout</span>
              </>
            ) : (
              <>
                <LogInIcon className={"mr-2 size-4"} />
                <span>Login</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
