"use client";
import { useEffect, useState } from "react";
import { useToast } from "../contexts/ToastContext";
import {
  Success,
  Close,
  CloseOne,
  Info,
  Warning,
  Attention,
} from "@icon-park/react";

const Toast = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger exit animation before removing
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onClose();
      }, 300); // Match animation duration
    }, toast.duration - 300);

    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles =
      "flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl shadow-lg border-2 backdrop-blur-sm transition-all duration-300 w-full";

    switch (toast.type) {
      case "success":
        return `${baseStyles} bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200`;
      case "error":
        return `${baseStyles} bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200`;
      case "warning":
        return `${baseStyles} bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200`;
      case "info":
      default:
        return `${baseStyles} bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200`;
    }
  };

  const getIcon = () => {
    const iconSize = 18;
    const iconClass = "flex-shrink-0 sm:w-5 sm:h-5";

    switch (toast.type) {
      case "success":
        return <Success theme="filled" size={iconSize} className={iconClass} />;
      case "error":
        return (
          <CloseOne theme="filled" size={iconSize} className={iconClass} />
        );
      case "warning":
        return (
          <Attention theme="filled" size={iconSize} className={iconClass} />
        );
      case "info":
      default:
        return <Info theme="filled" size={iconSize} className={iconClass} />;
    }
  };

  return (
    <div
      className={`${getToastStyles()} ${
        isExiting
          ? "opacity-0 translate-x-full scale-95"
          : "opacity-100 translate-x-0 scale-100"
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium break-words leading-relaxed">
          {toast.message}
        </p>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1.5 sm:p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors active:scale-95 min-w-[32px] min-h-[32px] sm:min-w-[24px] sm:min-h-[24px] flex items-center justify-center"
        aria-label="Tutup notifikasi"
      >
        <Close theme="outline" size={16} className="sm:w-4 sm:h-4" />
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-2 sm:right-4 z-[9999] flex flex-col gap-2 sm:gap-3 pointer-events-none max-w-[calc(100vw-1rem)] sm:max-w-md"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onClose={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
