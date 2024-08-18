"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { revalidatePath } from "next/cache";

export const UnblockUserButton = ({ id }: { id: string }) => {
  const router = useRouter();
  const unblock = api.settings.unblockUser.useMutation({
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You successfully unblocked this user.",
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

  return (
    <Button
      onClick={() => {
        router.refresh();
        unblock.mutate({ id });
      }}
    >
      Unblock
    </Button>
  );
};
