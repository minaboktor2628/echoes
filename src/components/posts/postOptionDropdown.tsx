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
import { Ellipsis, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useToast } from "@/components/ui/use-toast";

export const PostOptionDropdown = ({ id }: { id: string }) => {
  const trpcUtils = api.useUtils();
  const { toast } = useToast();
  const deletePost = api.post.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Successfully deleted post.",
      });
      void trpcUtils.post.infiniteProfileFeed.invalidate();
      void trpcUtils.profile.getById.invalidate();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Uh oh!",
        description: "Something went wrong.",
      });
    },
  });

  function onDelete() {
    deletePost.mutate({ id });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Ellipsis className={"hover:bg-primary"} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Post Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Dialog>
            <DialogTrigger asChild>
              <button
                className={
                  "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:cursor-pointer hover:bg-destructive focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                }
              >
                <Trash className={"mr-2 size-4"} />
                <span>Delete Post</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This is a destructive action.
                </DialogDescription>
              </DialogHeader>
              <Button variant={"destructive"} onClick={onDelete}>
                Delete Post
              </Button>
            </DialogContent>
          </Dialog>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
