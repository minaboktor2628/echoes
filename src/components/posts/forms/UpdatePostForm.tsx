"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@/trpc/react";
import {
  type UpdatePostFormSchema,
  updatePostSchema,
  type UpdateProps,
} from "@/types/post";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Mention, MentionsInput } from "react-mentions";
import { type ReactNode, useState } from "react";
import { ProfileImage } from "@/components/ProfileImage";
import { Switch } from "@/components/ui/switch";

export function UpdatePostForm({ id, content, isDiary }: UpdateProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const response = api.user.getAllUsers.useQuery(query);
  const trpcUtils = api.useUtils();
  const post = api.post.update.useMutation({
    onSuccess: (post) => {
      toast({
        title: "You updates a quote!",
        description: `"${post.content.replace(/@\[(.*?)]\(.*?\)/g, "@$1")}"`,
      });
      void trpcUtils.post.infiniteProfileFeed.invalidate();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Uh oh!",
        description: "Something went wrong.",
      });
    },
  });

  const form = useForm<UpdatePostFormSchema>({
    resolver: zodResolver(updatePostSchema),
    defaultValues: {
      content: content,
      id: id,
      isDiary: isDiary,
    },
  });

  function onSubmit(values: UpdatePostFormSchema) {
    post.mutate(values);
    form.reset();
  }

  const fetchUsers = (
    query: string,
    callback: (data: { id: string; display: string }[]) => void,
  ) => {
    try {
      setQuery(query);
      void response.refetch().then(() => callback(response.data!));
    } catch (error) {
      callback([]);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-2"
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className={"flex gap-4"}>
                  <ProfileImage src={session?.user?.image} />
                  <MentionsInput
                    className={"flex w-full "}
                    placeholder={"Mention users by typing '@'"}
                    customSuggestionsContainer={SuggestedContainer}
                    {...field}
                  >
                    <Mention
                      data={fetchUsers}
                      trigger={"@"}
                      className={"text-primary underline"}
                      appendSpaceOnAdd
                    />
                  </MentionsInput>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
          <Button disabled={post.isPending} type="submit">
            {post.isPending ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function SuggestedContainer(children: ReactNode) {
  return (
    <Card>
      <CardContent className={"p-2"}>{children}</CardContent>
    </Card>
  );
}
