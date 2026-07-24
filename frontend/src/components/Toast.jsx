import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiTriangle,
  FiX,
} from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";

// BKAV HaiHS : Khởi tạo Context quản lý trạng thái Toast toàn hệ thống - start
const ToastContext = createContext(null);
// BKAV HaiHS : Khởi tạo Context quản lý trạng thái Toast toàn hệ thống - end

// BKAV HaiHS : Provider cung cấp dịch vụ hiển thị Toast - start
export const ToastProvider = ({ children }) => {
  const { t } = useLanguage();
  const [toasts, setToasts] = useState([]);

  // BKAV HaiHS : Hàm kích hoạt hiển thị Toast tự động đóng sau 2.5 giây - start
  const showToast = useCallback((message, type = "info") => {
    if (!message) return;
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [{ id, message, type }, ...prev]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);
  // BKAV HaiHS : Hàm kích hoạt hiển thị Toast tự động đóng sau 2.5 giây - end

  // BKAV HaiHS : Hàm đóng/tắt nhanh một Toast bằng cách click thủ công - start
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  // BKAV HaiHS : Hàm đóng/tắt nhanh một Toast bằng cách click thủ công - end

  // BKAV HaiHS : Đăng ký sự kiện lắng nghe để kích hoạt toast từ các file JS thuần - start
  useEffect(() => {
    const handleShowToast = (e) => {
      const { message, type } = e.detail || {};
      showToast(message, type);
    };
    window.addEventListener("show-toast", handleShowToast);
    return () => window.removeEventListener("show-toast", handleShowToast);
  }, [showToast]);
  // BKAV HaiHS : Đăng ký sự kiện lắng nghe để kích hoạt toast từ các file JS thuần - end

  // BKAV HaiHS : Hàm phụ trả về Icon React tương ứng với loại Toast - start
  const renderIcon = (type) => {
    switch (type) {
      case "success":
        return <FiCheckCircle className="text-green-500 text-xl shrink-0" />;
      case "error":
        return <FiAlertCircle className="text-red-500 text-xl shrink-0" />;
      case "warning":
        return <FiTriangle className="text-yellow-500 text-xl shrink-0" />;
      default:
        return <FiInfo className="text-blue-500 text-xl shrink-0" />;
    }
  };
  // BKAV HaiHS : Hàm phụ trả về Icon React tương ứng với loại Toast - end

  // BKAV HaiHS : Hàm phụ trả về mã CSS Tailwind đường viền bên trái của Card Toast - start
  const getBorderColor = (type) => {
    switch (type) {
      case "success":
        return "border-green-500";
      case "error":
        return "border-red-500";
      case "warning":
        return "border-yellow-500";
      default:
        return "border-blue-500";
    }
  };
  // BKAV HaiHS : Hàm phụ trả về mã CSS Tailwind đường viền bên trái của Card Toast - end

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Danh sách các thông báo Toast xếp chồng */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-4 bg-white border border-gray-100 dark:border-0 dark:bg-[#1c2436] border-l-4 ${getBorderColor(
              toast.type,
            )} text-gray-600 dark:text-gray-200 px-5 py-4 rounded-r-lg shadow-2xl animate-toast-slide-in`}
          >
            {/* Khối chứa icon và nội dung văn bản */}
            <div className="flex items-center gap-3">
              {renderIcon(toast.type)}
              <div className="flex flex-col text-sm pr-2">
                <span className="font-bold text-gray-900 dark:text-white transition-colors duration-300">
                  {toast.type === "success"
                    ? t("toast_success") || "toast_success"
                    : toast.type === "error"
                      ? t("toast_error") || "toast_error"
                      : toast.type === "warning"
                        ? t("toast_warning") || "toast_warning"
                        : t("toast_info") || "toast_info"}
                </span>
                <span className="mt-0.5 text-gray-500 dark:text-gray-300 transition-colors duration-300">
                  {t(toast.message) || toast.message}
                </span>
              </div>
            </div>

            {/* Nút X đóng nhanh thông báo */}
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <FiX size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
// BKAV HaiHS : Provider cung cấp dịch vụ hiển thị Toast - end

// BKAV HaiHS : Custom hook dùng chung để triệu gọi showToast từ các Component - start
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast phải được đặt bên trong một ToastProvider!");
  }
  return context;
};
// BKAV HaiHS : Custom hook dùng chung để triệu gọi showToast từ các Component - end
