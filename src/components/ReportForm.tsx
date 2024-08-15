import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { reportSchema, type ReportSchema } from "@/types/support";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export const ReportForm = ({ id, type }: { id: string; type: string }) => {
  const report = api.support.report.useMutation({
    onSuccess: () => {
      toast({
        title: "Your submitted a support ticket!",
        description: "We will get back to you soon.",
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

  const form = useForm<ReportSchema>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type,
      id,
      reason: "",
    },
  });

  const onSubmit = (values: ReportSchema) => {
    report.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-4">
        <FormField
          control={form.control}
          name="reason"
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
        <Button disabled={report.isPending}>
          {report.isPending ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
};
