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
import { MakeCommentForm } from "@/components/comments/MakeCommentForm";
import { DeleteCommentForm } from "@/components/comments/DeleteCommentForm";
import { type Comment } from "@/types/post";
import { ReportForm } from "@/components/ReportForm";

export const CommentOptionDropdown = ({
  postId,
  isMyPost,
  isMyComment,
  content,
  user,
  id,
}: Pick<
  Comment,
  "isMyPost" | "user" | "id" | "content" | "isMyComment" | "postId"
>) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Ellipsis className={"hover:bg-primary"} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Comment Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isMyComment && (
          <DropdownMenuGroup>
            <Dialog>
              <DialogTrigger asChild>
                <button className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                  <Pencil className={"mr-2 size-4"} />
                  <span>Edit Comment</span>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This post will now appear as edited to others.
                  </DialogDescription>
                </DialogHeader>
                <MakeCommentForm
                  commentId={id}
                  initialValues={content}
                  type={"update"}
                  postId={postId}
                />
              </DialogContent>
            </Dialog>
          </DropdownMenuGroup>
        )}
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
              <ReportForm id={id} type={"comment"} />
            </DialogContent>
          </Dialog>
        </DropdownMenuGroup>
        {(isMyComment || isMyPost) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:cursor-pointer hover:bg-destructive focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    <Trash className={"mr-2 size-4"} />
                    <span>Delete Comment</span>
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This is a destructive action.
                    </DialogDescription>
                  </DialogHeader>
                  <DeleteCommentForm
                    commentId={id}
                    postId={postId}
                    createdById={user.id}
                  />
                </DialogContent>
              </Dialog>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
