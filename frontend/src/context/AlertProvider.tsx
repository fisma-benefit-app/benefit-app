import React, { createContext, useContext, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleInfo,
  faTriangleExclamation,
  faSpinner,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

type NotificationType = "success" | "error" | "loading" | "info";

interface Notification {
  id: string; // custom ID (operation ID)
  title: string;
  message: string;
  type: NotificationType;
  isVisible: boolean;
}

interface AlertContextType {
  showNotification: (
    title: string,
    message: string,
    type?: NotificationType,
    id?: string, // optional ID for tracking same operation
  ) => void;
  updateNotification: (
    id: string,
    title: string,
    message: string,
    type: NotificationType,
  ) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (
    title: string,
    message: string,
    type: NotificationType = "info",
    id: string = `${Date.now()}`, // default unique id if not given
  ) => {
    setNotifications((prev) => {
      const existing = prev.find((n) => n.id === id);
      if (existing) {
        // Update existing instead of adding
        return prev.map((n) =>
          n.id === id ? { ...n, title, message, type, isVisible: true } : n,
        );
      }
      // Add new
      return [...prev, { id, title, message, type, isVisible: true }];
    });
  };

  const updateNotification = (
    id: string,
    title: string,
    message: string,
    type: NotificationType,
  ) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, title, message, type, isVisible: true } : n,
      ),
    );

    // Auto-close after 5s unless error or loading
    if (type !== "error" && type !== "loading") {
      setTimeout(() => hideNotification(id), 5000);
    }
  };

  const hideNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isVisible: false } : n)),
    );
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 300);
  };

  const NotificationContainer = () => (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-9999 flex flex-col items-center gap-3">
      {notifications.map((n) => (
        <NotificationToast
          key={n.id}
          {...n}
          onClose={() => hideNotification(n.id)}
        />
      ))}
    </div>
  );

  return (
    <AlertContext.Provider value={{ showNotification, updateNotification }}>
      {children}
      <NotificationContainer />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context)
    throw new Error("useAlert() must be used within an <AlertProvider>");
  return context;
}

function NotificationToast({
  title,
  message,
  type,
  isVisible,
  onClose,
}: {
  title: string;
  message: string;
  type: NotificationType;
  isVisible: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (isVisible && type !== "loading" && type !== "error") {
      const timer = setTimeout(() => onClose(), 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, type, onClose]);

  if (!isVisible) return null;

  const typeStyles: Record<NotificationType, string> = {
    success: "bg-green-100 border-green-500 text-green-900",
    error: "bg-red-100 border-red-500 text-red-900",
    loading: "bg-yellow-100 border-yellow-500 text-yellow-900",
    info: "bg-blue-100 border-blue-500 text-blue-900",
  };

  const typeIcons: Record<NotificationType, JSX.Element> = {
    success: (
      <FontAwesomeIcon
        icon={faCircleCheck}
        className="text-green-600 text-lg"
      />
    ),
    error: (
      <FontAwesomeIcon
        icon={faTriangleExclamation}
        className="text-red-600 text-lg"
      />
    ),
    loading: (
      <FontAwesomeIcon
        icon={faSpinner}
        className="text-yellow-600 text-lg animate-spin"
      />
    ),
    info: (
      <FontAwesomeIcon icon={faCircleInfo} className="text-blue-600 text-lg" />
    ),
  };

  return (
    <div
      className={`w-full max-w-sm rounded-lg border p-4 shadow-lg transition-all duration-300 ${typeStyles[type]}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{typeIcons[type]}</div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-sm">{message}</p>
        </div>
        {type === "error" && (
          <button
            onClick={onClose}
            className="ml-3 text-red-700 hover:text-red-900 transition"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}
      </div>
    </div>
  );
}
