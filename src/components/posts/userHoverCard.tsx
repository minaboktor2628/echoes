import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { MentionedUser } from "@/types/post";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProfileImage } from "@/components/ProfileImage";

type UserHoverCardProps = MentionedUser & {
  at?: boolean;
  className?: string;
};

export function UserHoverCard({
  image,
  name,
  id,
  className,
  at = false,
  createdAt,
  bio,
}: UserHoverCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button className={cn("m-0 p-0", className)} asChild variant="link">
          <Link href={`/profile/${id}`}>
            {at ? "@" : ""}
            {name}
          </Link>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="">
        <div className="flex justify-between space-x-4">
          <ProfileImage src={image} />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">@{name}</h4>
            <p className="text-sm">{bio}</p>
            <div className="flex items-center pt-2">
              <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
              <span className="text-xs text-muted-foreground">
                Joined{" "}
                {createdAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
