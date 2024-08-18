import { type RouterOutputs } from "@/trpc/react";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileImage } from "@/components/ProfileImage";
import { UnblockUserButton } from "./forms/UnblockUserButton";

export const BlockedUserCard = ({
  name,
  image,
  id,
}: RouterOutputs["user"]["getBlockedUser"][number]) => {
  return (
    <Card>
      <CardContent className={"flex flex-row justify-between p-3 "}>
        <div className={"flex flex-row text-center"}>
          <ProfileImage src={image} />
          <span className={"pl-2 text-lg"}>{name}</span>
        </div>
        <div>
          <UnblockUserButton id={id} />
        </div>
      </CardContent>
    </Card>
  );
};
