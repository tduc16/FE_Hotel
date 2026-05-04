import React from "react";

type RoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

interface RoomStatusBadgeProps {
  status: RoomStatus | string;
}

export default function RoomStatusBadge({ status }: RoomStatusBadgeProps) {
  let badgeClasses = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ";
  let label = status;

  switch (status) {
    case "AVAILABLE":
      badgeClasses += "bg-primary/10 text-primary";
      label = "Trống";
      break;
    case "OCCUPIED":
      badgeClasses += "bg-error/10 text-error";
      label = "Đang sử dụng";
      break;
    case "MAINTENANCE":
      badgeClasses += "bg-surface-container-highest text-on-surface-variant";
      label = "Bảo trì";
      break;
    default:
      badgeClasses += "bg-surface-container-highest text-on-surface-variant";
      break;
  }

  return <span className={badgeClasses}>{label}</span>;
}
