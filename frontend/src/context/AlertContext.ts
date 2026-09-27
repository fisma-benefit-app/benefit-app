import { createContext } from "react";

export type NotificationType = "success" | "error" | "loading" | "info";

export interface Notification {
  id: string; // custom ID (operation ID)
  title: string;
  message: string;
  type: NotificationType;
  isVisible: boolean;
  action?: {
    label: string;
    onClick: () => void | Promise<void>;
  };
}

export interface AlertContextType {
  showNotification: (
    title: string,
    message: string,
    type?: NotificationType,
    id?: string, // optional ID for tracking same operation
    action?: Notification["action"],
  ) => void;
  updateNotification: (
    id: string,
    title: string,
    message: string,
    type: NotificationType,
  ) => void;
  hideNotification: (id: string) => void;
}

export const AlertContext = createContext<AlertContextType | null>(null);
