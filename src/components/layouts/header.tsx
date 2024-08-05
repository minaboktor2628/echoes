"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import Link from "next/link";
import { useLinks } from "@/hooks/useLinks";
import { signIn, signOut, useSession } from "next-auth/react";
import { ProfileImage } from "@/components/ProfileImage";
import { IconHoverEffect } from "@/components/IconHoverEffect";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
export const Header = () => {
  const { data: session, status } = useSession();
  const { Links } = useLinks();
  const [isLinkClicked, setIsLinkClicked] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet open={isLinkClicked} onOpenChange={setIsLinkClicked}>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            {Links.map((link, index) => (
              <Link
                key={index}
                href={link.url}
                onClick={() => setIsLinkClicked(false)}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <link.icon className="h-5 w-5" />
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
            <Link href={"/settings"}>Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              status === "authenticated" ? signOut() : signIn("discord")
            }
          >
            {status === "authenticated" ? "Logout" : "Login"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
