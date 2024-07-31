import { useSession } from "next-auth/react";
import { Home, User } from "lucide-react";

export function useLinks() {
  const session = useSession();
  const user = session.data?.user;
  const Links = [
    {
      url: "/",
      access: "guest",
      title: "Home",
      icon: Home,
    },
  ];

  if (user !== null) {
    Links.push({
      url: `/profile/${user?.id}`,
      access: "guest",
      title: "Profile",
      icon: User,
    });
  }

  return { Links };
}
