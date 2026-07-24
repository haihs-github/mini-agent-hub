import React from "react";
import { FiMessageSquare, FiUsers, FiShield, FiSettings } from "react-icons/fi";
import { useAuth } from "@/features/auth/AuthContext";
import { useLanguage } from "@/context/LanguageContext"; // BKAV HaiHS: Import hook ngôn ngữ

// BKAV HaiHS: Component NavigationLinks trong sidebar, hiển thị các liên kết điều hướng đến các phần khác nhau của dashboard dựa trên quyền của người dùng - start
const NavigationLinks = ({ currentView, onViewChange }) => {
  const { permissions } = useAuth();
  const { t } = useLanguage(); // BKAV HaiHS: Khai báo hàm dịch thuật
  const userPermissions = permissions || [];

  // BKAV HaiHS: Kiểm tra phân quyền truy cập chức năng của tài khoản - start
  const hasChatPermission =
    userPermissions.includes("CHAT") || userPermissions.length > 0;
  const hasUserPermission = userPermissions.some((p) => p.startsWith("USER_"));
  const hasGroupPermission = userPermissions.some((p) =>
    p.startsWith("GROUP_"),
  );
  // BKAV HaiHS: Kiểm tra phân quyền truy cập chức năng của tài khoản - end

  // BKAV HaiHS : Định nghĩa cấu trúc danh sách menu và nhãn dịch thuật tương ứng - start
  const menuItems = [
    {
      id: "chat",
      label: t("nav_chat") || "nav_chat",
      icon: FiMessageSquare,
      show: hasChatPermission,
    },
    {
      id: "users",
      label: t("nav_users") || "nav_users",
      icon: FiUsers,
      show: hasUserPermission,
    },
    {
      id: "groups",
      label: t("nav_groups") || "nav_groups",
      icon: FiShield,
      show: hasGroupPermission,
    },
    {
      id: "settings",
      label: t("nav_settings") || "nav_settings",
      icon: FiSettings,
      show: true,
    },
  ];
  // BKAV HaiHS : Định nghĩa cấu trúc danh sách menu và nhãn dịch thuật tương ứng - end

  return (
    <nav className="space-y-1.5 px-4 select-none shrink-0">
      {menuItems.map((item) => {
        if (!item.show) return null;

        const IconComponent = item.icon;
        const isActive = currentView === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
              isActive
                ? "bg-gray-100 text-gray-900 border border-gray-200 shadow-sm dark:bg-[#161b26] dark:text-white dark:border-[#232d42] dark:shadow-lg dark:shadow-black/10"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/60 border border-transparent dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-[#161b26]/40"
            }`}
          >
            <span className="w-5 h-5 flex items-center justify-center shrink-0">
              <IconComponent
                size={18}
                className={
                  isActive
                    ? "text-blue-600 dark:text-blue-500"
                    : "text-gray-400 dark:text-gray-500"
                }
              />
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
// BKAV HaiHS: Component NavigationLinks trong sidebar, hiển thị các liên kết điều hướng đến các phần khác nhau của dashboard dựa trên quyền của người dùng - end

export default NavigationLinks;
