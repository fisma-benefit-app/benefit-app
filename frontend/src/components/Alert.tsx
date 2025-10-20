import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleInfo,
  faTriangleExclamation,
  faSpinner,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

type NotificationType = "success" | "error" | "loading" | "info";

interface NotificationState {
  title: string;
  message: string;
  type: NotificationType;
  isVisible: boolean;
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
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
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
    success: <FontAwesomeIcon icon={faCircleCheck} className="text-green-600 text-lg" />,
    error: <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-600 text-lg" />,
    loading: (
      <FontAwesomeIcon icon={faSpinner} className="text-yellow-600 text-lg animate-spin" />
    ),
    info: <FontAwesomeIcon icon={faCircleInfo} className="text-blue-600 text-lg" />,
  };

  return (
    <div
      className={`fixed top-20 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 transform rounded-lg border p-4 shadow-lg transition-all duration-300 ${typeStyles[type]}`}
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

export default function useAlert() {
  const [notification, setNotification] = useState<NotificationState>({
    title: "",
    message: "",
    type: "info",
    isVisible: false,
  });

  const showNotification = (
    title: string,
    message: string,
    type: NotificationType = "info",
  ) => {
    setNotification({ title, message, type, isVisible: true });
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  return {
    showNotification,
    hideNotification,
    NotificationComponent: () => (
      <NotificationToast
        title={notification.title}
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    ),
  };
}
