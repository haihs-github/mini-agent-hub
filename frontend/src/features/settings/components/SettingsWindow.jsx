import React from "react";
import { FiMenu } from "react-icons/fi";
import PersonalInfo from "@/features/settings/components/PersonalInfo";
import Personalization from "@/features/settings/components/Personalization";
import AccountSecurity from "@/features/settings/components/AccountSecurity";
import { useLanguage } from "@/context/LanguageContext";
import { useSidebar } from "@/components/layout/AppLayout";

// BKAV HaiHS: Component chính của trang cài đặt hệ thống - start
const SettingsWindow = ({ setConversations }) => {
  const { t } = useLanguage();
  const { setIsSidebarOpen } = useSidebar();

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-gray-50 dark:bg-[#0b0f19] transition-colors duration-300">
      {/* sticky header */}
      <div className="w-full border-b border-gray-200 dark:border-[#232d42]/40 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md shrink-0 px-4 py-4 md:px-8 md:py-5 z-10 transition-colors duration-300">
        <div className="w-full max-w-4xl mx-auto flex items-start gap-3 select-none">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden cursor-pointer shrink-0 mt-0.5 transition-colors duration-300"
            title={t("open_menu") || "open_menu"}
          >
            <FiMenu size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide transition-colors duration-300">
              {t("workspaceSettings") || "workspaceSettings"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300 mt-1.5">
              {t("settingsDesc") || "settingsDesc"}
            </p>
          </div>
        </div>
      </div>

      {/* vùng nội dung cuộn */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
        <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">
          {/* thông tin cá nhân */}
          <PersonalInfo />

          {/* cá nhân hóa giao diện */}
          <Personalization />

          {/* bảo mật tài khoản */}
          <AccountSecurity setConversations={setConversations} />
        </div>
      </div>
    </div>
  );
};
// BKAV HaiHS: Component chính của trang cài đặt hệ thống - end

export default SettingsWindow;
