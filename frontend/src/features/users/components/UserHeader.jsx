import React from "react";
import { FiUserPlus, FiMenu } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";
import { useSidebar } from "@/components/layout/AppLayout";

// BKAV HaiHS: Component header của trang quản lý người dùng, hiển thị tiêu đề và nút thêm người dùng - start
const UserHeader = ({ onAddClick, canCreate }) => {
  const { t } = useLanguage();
  const { setIsSidebarOpen } = useSidebar();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-0 select-none">
      <div className="flex items-start gap-3">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -ml-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden cursor-pointer shrink-0 mt-1.5 transition-colors duration-300"
          title={t("open_menu") || "open_menu"}
        >
          <FiMenu size={20} />
        </button>
        <div>
          {/* tiêu đề trang */}
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors duration-300">
            {t("user_title") || "user_title"}
          </h2>
          {/* mô tả phụ */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-2xl leading-relaxed transition-colors duration-300">
            {t("user_desc") || "user_desc"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {canCreate && (
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold px-4 py-2.5 rounded-xl text-white transition-all shadow-lg shadow-blue-600/10 cursor-pointer"
          >
            <FiUserPlus size={14} />
            <span>{t("user_add") || "user_add"}</span>
          </button>
        )}
      </div>
    </div>
  );
};
// BKAV HaiHS: Component header của trang quản lý người dùng, hiển thị tiêu đề và nút thêm người dùng - end

export default UserHeader;
