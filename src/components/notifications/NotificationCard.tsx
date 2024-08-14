import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RocketIcon } from "@radix-ui/react-icons";
import { X } from "lucide-react";
import { DeleteNotificationForm } from "@/components/notifications/DeleteNotificationForm";

export const NotificationCard = ({
  content,
  title,
  id,
}: {
  id: string;
  title: string;
  content: string;
}) => {
  return (
    <Alert>
      <RocketIcon className="h-4 w-4" />
      <AlertTitle className={"flex flex-row justify-between"}>
        {title}
        <DeleteNotificationForm notificationId={id} />
      </AlertTitle>
      <AlertDescription>{content}</AlertDescription>
    </Alert>
  );
};
