"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Ellipsis,
  KeyIcon,
  MessageCircleWarning,
  Pencil,
  Trash,
} from "lucide-react";
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
import { UpdatePostForm } from "@/components/posts/forms/UpdatePostForm";
import { UpdateProps } from "@/types/post";
import { TogglePostPrivate } from "@/components/posts/forms/TogglePostPrivateForm";
import { ReportForm } from "@/components/ReportForm";

export const PostOptionDropdown = ({
  id,
  content,
  mentions,
  isDiary,
  isMyPost,
}: UpdateProps) => {
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
        <DropdownMenuLabel>Post Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Dialog>
            <DialogTrigger asChild>
              <button className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                <MessageCircleWarning className={"mr-2 size-4"} />
                <span>Report Comment</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report a comment</DialogTitle>
              </DialogHeader>
              <ReportForm id={id} type={"post"} />
            </DialogContent>
          </Dialog>
        </DropdownMenuGroup>
        {isMyPost && (
          <>
            <DropdownMenuGroup>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    <Pencil className={"mr-2 size-4"} />
                    <span>Edit Post</span>
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This post will now appear as edited to others.
                    </DialogDescription>
                  </DialogHeader>
                  <UpdatePostForm
                    isMyPost={isMyPost}
                    content={content}
                    id={id}
                    mentions={mentions}
                    isDiary={isDiary}
                  />
                </DialogContent>
              </Dialog>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    <MessageCircleWarning className={"mr-2 size-4"} />
                    <span>Report post</span>
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Report a post</DialogTitle>
                  </DialogHeader>
                  <ReportForm id={id} type={"comment"} />
                </DialogContent>
              </Dialog>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    <KeyIcon className={"mr-2 size-4"} />
                    <span>Diary Settings</span>
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This affects how this post will be viewed on your profile.
                    </DialogDescription>
                  </DialogHeader>
                  <TogglePostPrivate postId={id} isDiary={isDiary} />
                  {/*<UpdatePostForm content={content} id={id} mentions={mentions} />*/}
                </DialogContent>
              </Dialog>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:cursor-pointer hover:bg-destructive focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
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
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
