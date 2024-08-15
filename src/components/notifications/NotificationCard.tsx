import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RocketIcon } from "@radix-ui/react-icons";
import { DeleteNotificationForm } from "@/components/notifications/DeleteNotificationForm";
import { type Notification } from "@/types/notifications";
import { NotificationActionButton } from "@/components/notifications/NotificationActionButton";
import { formatDistanceToNow } from "date-fns";
import { X } from "lucide-react";

export const NotificationCard = ({
  id,
  type,
  content,
  title,
  createdAt,
  followReqUserId,
  route,
  onDelete,
}: Notification & { onDelete: (id: string) => void }) => {
  let formattedDate = formatDistanceToNow(createdAt, { addSuffix: true });

  if (formattedDate.startsWith("about ")) {
    formattedDate = formattedDate.replace("about ", "");
  }

  return (
    <Alert className={"w-full"}>
      <RocketIcon className="size-4" />
      <AlertTitle className={"flex flex-row justify-between"}>
        <div>
          <span>{title}</span>
          <span className={"text-gray-500"}> - </span>
          <span className={"text-gray-500"}>{formattedDate}</span>
        </div>
        <DeleteNotificationForm onDelete={onDelete} notificationId={id}>
          <button type={"submit"} className={"m-0 p-0"}>
            <X />
          </button>
        </DeleteNotificationForm>
      </AlertTitle>
      <AlertDescription
        className={"flex flex-row justify-between pt-2 text-center"}
      >
        {content}
        <NotificationActionButton
          onDelete={onDelete}
          notificationId={id}
          type={type}
          followReqUserId={followReqUserId}
          route={route}
        />
      </AlertDescription>
    </Alert>
  );
};
