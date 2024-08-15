import { api } from "@/trpc/react";
import { useForm } from "react-hook-form";
import { FollowBackSchema, followBackSchema } from "@/types/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const FollowBackButton = ({
  notificationId,
  id,
  onDelete,
}: {
  onDelete: (id: string) => void;
  id: string;
  notificationId: string;
}) => {
  const followBack = api.profile.acceptFollow.useMutation({
    onSuccess: ({ name }) => {
      toast(`You accepted ${name}'s follow request!`);
    },
  });

  const notification = api.notifications.delete.useMutation();
  const form = useForm<FollowBackSchema>({
    resolver: zodResolver(followBackSchema),
    defaultValues: { id },
  });

  const onSubmit = (values: FollowBackSchema) => {
    onDelete(notificationId);
    followBack.mutate(values);
    notification.mutate({ notificationId });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="id"
          control={form.control}
          render={() => <Button type={"submit"}>Accept</Button>}
        />
      </form>
    </Form>
  );
};
