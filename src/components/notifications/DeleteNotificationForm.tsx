"use client";

import { api } from "@/trpc/react";
import {
  deleteNotificationSchema,
  type DeleteNotificationSchema,
} from "@/types/notifications";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import React from "react";

export const DeleteNotificationForm = ({
  notificationId,
  children,
  onDelete,
}: {
  notificationId: string;
} & { children: React.ReactNode; onDelete: (id: string) => void }) => {
  const notification = api.notifications.delete.useMutation();
  const form = useForm<DeleteNotificationSchema>({
    resolver: zodResolver(deleteNotificationSchema),
    defaultValues: { notificationId },
  });

  const onSubmit = (values: DeleteNotificationSchema) => {
    onDelete(values.notificationId);
    notification.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="notificationId"
          render={() => (
            <FormItem>
              <FormControl>{children}</FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
