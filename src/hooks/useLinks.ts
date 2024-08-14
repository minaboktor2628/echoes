import { useSession } from "next-auth/react";
import { BellIcon, Home, LucideProps, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { ForwardRefExoticComponent, RefAttributes } from "react";
export type RouteLink = {
  url: string;
  access: string;
  title: string;
  label: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
};

export function useLinks() {
  const session = useSession();
  const user = session.data?.user;
  const pathname = usePathname();

  const Links: RouteLink[] = [
    {
      url: "/",
      access: "guest",
      title: "Home",
      label: "home",
      icon: Home,
    },
  ];

  if (user !== null) {
    Links.push(
      {
        url: `/profile/${user?.id}`,
        access: "guest",
        label: "profile",
        title: "Profile",
        icon: User,
      },
      {
        access: "user",
        icon: BellIcon,
        label: "notifications",
        title: "Notifications",
        url: "/notifications",
      },
    );
  }
  const currentPath =
    Links.find((link) => pathname.includes(link.label))?.title ?? "Home";

  return { Links, currentPath };
}
