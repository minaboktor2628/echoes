import { CalendarDays } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { MentionedUser } from "@/types/post";
import Link from "next/link";

export function UserHoverCard({
  image,
  name,
  id,
  createdAt,
  description,
}: MentionedUser) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button className={"p-0"} asChild variant="link">
          <Link href={`/profile/${id}`}>@{name}</Link>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage src={image ?? undefined} />
            <AvatarFallback>{name}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">@{name}</h4>
            <p className="text-sm">{description}</p>
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
