"use client";

import { api } from "@/trpc/react";
import {
  deleteNotificationSchema,
  type DeleteNotificationSchema,
} from "@/types/notifications";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export const DeleteNotificationForm = ({
  notificationId,
}: {
  notificationId: string;
}) => {
  const notification = api.notifications.delete.useMutation();
  const router = useRouter();
  const form = useForm<DeleteNotificationSchema>({
    resolver: zodResolver(deleteNotificationSchema),
    defaultValues: { notificationId },
  });

  const onSubmit = (values: DeleteNotificationSchema) => {
    notification.mutate(values);
    router.refresh();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="notificationId"
          render={() => (
            <FormItem>
              <FormControl>
                <button type={"submit"} className="m-0 p-0">
                  <X />
                </button>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
