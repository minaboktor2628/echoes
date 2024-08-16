import { api } from "@/trpc/react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export const BlockUserForm = ({ id }: { id: string }) => {
  const block = api.support.block.useMutation({
    onSuccess: () => {
      toast({
        title: "You blocked a user",
        description: "You can no longer view their posts.",
      });
    },
  });

  const onSubmit = () => {
    block.mutate({ id });
  };

  return <Button onClick={onSubmit}>Block User</Button>;
};
