import { useConfirm } from "@/contexts/ConfirmContext";

type UserStatus = "active" | "suspended" | "banned" | "inactive";

const STATUS_CONFIG: Record<UserStatus, {
  title: string;
  message: string;
  type: "delete" | "update";
}> = {
  suspended: {
    title: "Suspend User",
    message: "Are you sure you want to suspend this user?",
    type: "delete",
  },
  active: {
    title: "Activate User", 
    message: "Are you sure you want to activate this user?",
    type: "update",
  },
  banned: {
    title: "Ban User",
    message: "Are you sure you want to ban this user? This is a severe action.",
    type: "delete",
  },
  inactive: {
    title: "Deactivate User",
    message: "Are you sure you want to deactivate this user?",
    type: "update",
  },
};

interface UseConfirmUserStatusOptions {
  onConfirm: (userId: string, status: UserStatus) => void;
}

export function useConfirmUserStatus({ onConfirm }: UseConfirmUserStatusOptions) {
  const { confirm } = useConfirm();

  const confirmStatusChange = (userId: string, status: UserStatus) => {
    const config = STATUS_CONFIG[status];
    
    confirm({
      title: config.title,
      message: config.message,
      type: config.type,
      onConfirm: () => onConfirm(userId, status),
    });
  };

  return {
    confirmStatusChange,
  };
}