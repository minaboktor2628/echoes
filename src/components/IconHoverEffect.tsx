import { ReactNode } from "react";

export const IconHoverEffect = ({
  children,
  red = false,
}: {
  children: ReactNode;
  red?: boolean;
}) => {
  const colorClasses = red
    ? "outline-red-400 hover:bg-red-200 group-hover:bg-red-200 group-focus-visible:bg-red-200 focus-visible:bg-red-200"
    : "outline-grey-400 hover:bg-grey-200 group-hover:bg-grey-200 group-focus-visible:bg-grey-200 focus-visible:bg-grey-200";

  return (
    <div
      className={`rounded-full p-2 transition-colors duration-200 ${colorClasses}`}
    >
      {children}
    </div>
  );
};
