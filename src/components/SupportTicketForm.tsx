import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { supportFormSchema, type SupportFormSchema } from "@/types/support";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const SupportTicketForm = () => {
  const support = api.support.create.useMutation();

  const form = useForm<SupportFormSchema>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = (values: SupportFormSchema) => {
    support.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder={"Title of your ticket..."} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={"Enter your message here..."}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={support.isPending}>
          {support.isPending ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
};
