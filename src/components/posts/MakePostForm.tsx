"use client";
import defaultStyle from "../../styles/defaultStyle";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@/trpc/react";
import { type PostFormSchema, postFormSchema } from "@/types/post";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mention, MentionsInput } from "react-mentions";
import { cn } from "@/lib/utils";
import { useState } from "react";
export const MakePostForm = () => {
  const { status } = useSession();

  if (status === "unauthenticated") return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Make a post</CardTitle>
        </CardHeader>
        <CardContent>
          <PostForm />
        </CardContent>
      </Card>
      <div></div>
    </>
  );
};

export function PostForm() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const response = api.user.getAllUsers.useQuery(query);

  const post = api.post.create.useMutation({
    onSuccess: (post) => {
      toast({
        title: "You made a quote!",
        description: `"${post.content.replace(/@\[(.*?)]\(\d+\)/g, "@$1")}"`,
      });
      router.refresh();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Uh oh!",
        description: "Something went wrong.",
      });
    },
  });

  const form = useForm<PostFormSchema>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      content: "",
      by: "",
    },
  });

  function onSubmit(values: PostFormSchema) {
    post.mutate({
      content: values.content.replace(/@\[(.*?)]\(\d+\)/g, "@$1"),
      by: values.by,
    });
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

  function onAdd(id: string | number) {
    form.setValue("by", id as string);
  }
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
                  <Avatar>
                    <AvatarImage src={session?.user?.image ?? undefined} />
                    <AvatarFallback>{session?.user?.name}</AvatarFallback>
                  </Avatar>

                  <MentionsInput
                    className={cn("flex w-full text-lg", defaultStyle)}
                    placeholder={"Mention users by typing '@'"}
                    {...field}
                    customSuggestionsContainer={(children) => (
                      <Card>
                        <CardContent className={"mt-22 mb-2 pb-2"}>
                          {children}
                        </CardContent>
                      </Card>
                    )}
                  >
                    <Mention
                      data={fetchUsers}
                      trigger={"@"}
                      onAdd={onAdd}
                      className={"text-blue-200 underline"}
                      appendSpaceOnAdd
                    />
                  </MentionsInput>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className={"self-end"} disabled={post.isPending} type="submit">
          {post.isPending ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
