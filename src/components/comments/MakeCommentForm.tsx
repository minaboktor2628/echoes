"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { api } from "@/trpc/react";
import { makeCommentSchema, MakeCommentSchema } from "@/types/post";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { ProfileImage } from "@/components/ProfileImage";
import { useSession } from "next-auth/react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SendIcon } from "lucide-react";
import React, { forwardRef } from "react";

type props = {
  postId: string;
};

export const MakeCommentForm = forwardRef<HTMLInputElement, props>(
  ({ postId }, ref) => {
    const { data: session } = useSession();
    const { toast } = useToast();
    const trpcUtils = api.useUtils();
    const comment = api.post.comment.useMutation({
      onSuccess: (post) => {
        void trpcUtils.post.getById.invalidate();
        toast({
          title: "You updates a comment!",
          description: `"${post.content.replace(/@\[(.*?)]\(.*?\)/g, "@$1")}"`,
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
        content: "",
        postId,
      },
    });

    function onSubmit(values: MakeCommentSchema) {
      comment.mutate(values);
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
          <button disabled={comment.isPending} type="submit">
            {comment.isPending ? (
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
