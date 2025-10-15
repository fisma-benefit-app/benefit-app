import { useState, useEffect } from "react";

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
    if (isVisible && type !== "loading") {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, type, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-32 right-5 z-50 max-w-sm w-full bg-white border border-gray-300 p-4 rounded-lg shadow-lg transition-all duration-300 transform">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="text-sm mt-1 text-gray-700">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default function Alert() {
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
