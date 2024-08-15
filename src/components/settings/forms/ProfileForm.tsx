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
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { profileFormSchema, type ProfileFormValues } from "@/types/settings";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProfileForm() {
  const session = useSession();
  const trpcUtils = api.useUtils();

  const profile = api.settings.profile.useMutation({
    onSuccess: async () => {
      void trpcUtils.settings.invalidate();
      toast({
        title: "You updated your profile!",
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
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues: {
      bio: session.data?.user.bio ?? "",
      email: session.data?.user.email ?? "",
      accountVisibility: session.data?.user.accountVisibility,
    },
  });

  if (session.status === "loading") return <LoadingSpinner />;

  function onSubmit(data: ProfileFormValues) {
    profile.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="accountVisibility"
          render={({ field }) => (
            <FormItem className="items-center justify-between">
              <div>
                <FormLabel>Profile Visibility</FormLabel>
              </div>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your account visibility" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                If you have a private profile, you will be required to accept
                users follow requests in order for them to see your posts.
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type={"email"}
                  className="text-base"
                  placeholder={"example@gmail.com"}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is where you will receive notifications from us.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  className="resize-none text-base"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This will appear on your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  );
}
