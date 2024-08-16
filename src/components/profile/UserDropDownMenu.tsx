import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, MessageCircleWarning, UserX } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReportForm } from "@/components/ReportForm";
import { BlockUserForm } from "@/components/BlockUserForm";

export const UserDropDownMenu = ({
  id,
  name,
  isMyProfile,
  status,
}: {
  status: "authenticated" | "unauthenticated" | "loading";
  id: string;
  name: string;
  isMyProfile: boolean;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <EllipsisVertical className="m-2 size-5 hover:text-primary" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Profile Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!isMyProfile && (
          <>
            <DropdownMenuGroup>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    <MessageCircleWarning className={"mr-2 size-4"} />
                    <span>Report user</span>
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Report a user</DialogTitle>
                  </DialogHeader>
                  <ReportForm id={id} type={"post"} />
                </DialogContent>
              </Dialog>
            </DropdownMenuGroup>
            {status === "authenticated" && (
              <DropdownMenuGroup>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                      <UserX className={"mr-2 size-4"} />
                      <span>Block User</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        You will no longer be able to see this user&apos;s
                        posts.
                      </DialogTitle>
                    </DialogHeader>
                    <BlockUserForm id={id} />
                  </DialogContent>
                </Dialog>
              </DropdownMenuGroup>
            )}
          </>
        )}
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <ShareButton
              key={id}
              className="mr-2 h-4 w-4"
              url={`/profile/${id}`}
              title={`${name}'s profile`}
            >
              <span>Share</span>
            </ShareButton>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
