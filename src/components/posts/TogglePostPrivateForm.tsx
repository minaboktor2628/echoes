"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { togglePostPrivateSchema, TogglePostPrivateSchema } from "@/types/post";

export function TogglePostPrivate({
  postId,
  isDiary,
}: TogglePostPrivateSchema) {
  const trpcUtils = api.useUtils();

  const togglePrivatePost = api.post.togglePostPrivate.useMutation({
    onSuccess: async () => {
      await trpcUtils.post.infiniteFeed.invalidate();
      await trpcUtils.post.getById.invalidate();
      await trpcUtils.post.infiniteProfileFeed.invalidate();
      await trpcUtils.profile.getById.invalidate();
      toast({
        title: "You edited your posts view!",
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

  const form = useForm<TogglePostPrivateSchema>({
    resolver: zodResolver(togglePostPrivateSchema),
    defaultValues: { postId, isDiary },
  });

  function onSubmit(data: TogglePostPrivateSchema) {
    togglePrivatePost.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className={"flex items-center justify-between"}>
          <FormField
            control={form.control}
            name="isDiary"
            render={({ field }) => (
              <FormItem className={"flex items-center space-x-2"}>
                <FormLabel>Diary Only</FormLabel>
                <FormControl>
                  <div className={"align-middle"}>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <Button disabled={togglePrivatePost.isPending} type="submit">
            {togglePrivatePost.isPending ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
