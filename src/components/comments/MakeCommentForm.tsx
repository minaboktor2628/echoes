"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { api } from "@/trpc/react";
import { makeCommentSchema, type MakeCommentSchema } from "@/types/post";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { ProfileImage } from "@/components/ProfileImage";
import { useSession } from "next-auth/react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SendIcon } from "lucide-react";
import React, { forwardRef } from "react";

type props = {
  postId: string;
  commentId?: string;
  initialValues?: string;
  type: "create" | "update";
};

export const MakeCommentForm = forwardRef<HTMLInputElement, props>(
  ({ postId, initialValues, type, commentId }, ref) => {
    const { data: session } = useSession();
    const { toast } = useToast();
    const trpcUtils = api.useUtils();
    const createMutation = api.comment.create.useMutation({
      onSuccess: (comment) => {
        void trpcUtils.post.getById.invalidate();
        toast({
          title: "You made a comment!",
          description: `"${comment.content.replace(/@\[(.*?)]\(.*?\)/g, "@$1")}"`,
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Uh oh!",
          description: "Something went wrong.",
        });
      },
    });

    const updateMutation = api.comment.update.useMutation({
      onSuccess: (comment) => {
        void trpcUtils.post.getById.invalidate();
        toast({
          title: "You updated a comment!",
          description: `"${comment.content.replace(/@\[(.*?)]\(.*?\)/g, "@$1")}"`,
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Uh oh!",
          description: "Something went wrong.",
        });
      },
    });

    const form = useForm<MakeCommentSchema>({
      resolver: zodResolver(makeCommentSchema),
      defaultValues: {
        content: initialValues ?? "",
        postId,
      },
    });

    function onSubmit(values: MakeCommentSchema) {
      if (type === "create") {
        createMutation.mutate(values);
      } else if (type === "update" && commentId) {
        updateMutation.mutate({ ...values, commentId });
      }
      form.reset();
    }

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-row items-center space-x-2 bg-accent p-2"
        >
          <ProfileImage src={session?.user?.image} className={"size-8"} />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className={"w-full"}>
                <FormControl>
                  <Input
                    placeholder={"Comment"}
                    className={"w-full text-base"}
                    {...field}
                    ref={ref}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <button
            disabled={updateMutation.isPending || createMutation.isPending}
            type="submit"
          >
            {updateMutation.isPending || createMutation.isPending ? (
              <LoadingSpinner />
            ) : (
              <SendIcon className={"size-6 hover:text-primary"} />
            )}
          </button>
        </form>
      </Form>
    );
  },
);

MakeCommentForm.displayName = "MakeCommentForm";
