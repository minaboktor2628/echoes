"use client";

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
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";

export const MakePostForm = () => {
  const { status } = useSession();

  if (status === "unauthenticated") return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a post</CardTitle>
      </CardHeader>
      <CardContent>
        <PostForm />
      </CardContent>
    </Card>
  );
};

function PostForm() {
  const [isPopOverOpen, setIsPopOverOpen] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();

  const { data: friends } = api.user.getFriends.useQuery();

  const createPost = api.post.create.useMutation({
    onSuccess: (post) => {
      toast({
        title: "You made a quote!",
        description: `"${post.content}"`,
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
    createPost.mutate(values);
    form.reset();
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
                  <Select open={isPopOverOpen} onOpenChange={setIsPopOverOpen}>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Friends</SelectLabel>
                        {friends?.map((friend) => (
                          <SelectItem key={friend.id} value={friend.id}>
                            {friend.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <textarea
                    placeholder={"Quote..."}
                    {...field}
                    className={
                      "flex min-h-[80px] w-full flex-grow resize-none overflow-hidden border-none outline-none"
                    }
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className={"self-end"}
          disabled={form.formState.isSubmitting}
          type="submit"
        >
          {form.formState.isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
