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
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { appearanceFormSchema, AppearanceFormValues } from "@/types/settings";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useTheme } from "next-themes";

export function AppearanceForm() {
  const { data: session, status } = useSession();
  const trpcUtils = api.useUtils();
  const { setTheme } = useTheme();

  const appearance = api.settings.appearance.useMutation({
    onSuccess: async () => {
      void trpcUtils.settings.invalidate();
      toast({
        title: "You updated your profile appearance!",
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

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: session?.user.preferences.theme,
    },
  });

  if (status === "loading") return <LoadingSpinner big />;

  function onSubmit(data: AppearanceFormValues) {
    appearance.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Theme</FormLabel>
              <FormDescription>
                Select the theme for this website.
              </FormDescription>
              <FormMessage />
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormItem className={"py-2"}>
                  <FormLabel className="hover:cursor-pointer [&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem
                        value="system"
                        onClick={() => setTheme("system")}
                      />
                    </FormControl>{" "}
                    System
                  </FormLabel>
                </FormItem>

                <div className="grid max-w-md grid-cols-2 gap-8">
                  <FormItem>
                    <FormLabel className="hover:cursor-pointer [&:has([data-state=checked])>div]:border-primary">
                      <FormControl>
                        <RadioGroupItem
                          onClick={() => setTheme("light")}
                          value="light"
                          className="sr-only"
                        />
                      </FormControl>
                      <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                        <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                          <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                            <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                          </div>
                        </div>
                      </div>
                      <span className="block w-full p-2 text-center font-normal">
                        Light
                      </span>
                    </FormLabel>
                  </FormItem>

                  <FormItem>
                    <FormLabel className="hover:cursor-pointer [&:has([data-state=checked])>div]:border-primary">
                      <FormControl>
                        <RadioGroupItem
                          onClick={() => setTheme("dark")}
                          value="dark"
                          className="sr-only"
                        />
                      </FormControl>
                      <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
                        <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                          <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                            <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-slate-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-slate-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                          </div>
                        </div>
                      </div>
                      <span className="block w-full p-2 text-center font-normal">
                        Dark
                      </span>
                    </FormLabel>
                  </FormItem>
                </div>
              </RadioGroup>
            </FormItem>
          )}
        />
        <Button type="submit">Update preferences</Button>
      </form>
    </Form>
  );
}
