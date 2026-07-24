import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { FiLogOut } from "react-icons/fi";
import ConfirmModal from "@/components/ConfirmModal";
import { useLanguage } from "@/context/LanguageContext";

// BKAV HaiHS : Component widget hiển thị thông tin người dùng và nút đăng xuất ở cuối sidebar - start
const UserProfileWidget = () => {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  // BKAV HaiHS : Xử lý dọn sạch mã xác thực và đưa trình duyệt về trang chủ để nạp biểu mẫu đăng nhập - start
  const handleSignOut = () => {
    localStorage.removeItem("token");
    if (logout) {
      logout();
    }
    navigate("/");
    setIsModalOpen(false);
  };
  // BKAV HaiHS : Xử lý dọn sạch mã xác thực và đưa trình duyệt về trang chủ để nạp biểu mẫu đăng nhập - end

  // BKAV HaiHS : Handler mở modal xác nhận đăng xuất - start
  const handleOpenConfirm = () => {
    setIsModalOpen(true);
  };
  // BKAV HaiHS : Handler mở modal xác nhận đăng xuất - end

  // BKAV HaiHS : Handler điều hướng sang trang cài đặt tài khoản - start
  const handleNavigateSettings = () => {
    navigate("/settings");
  };
  // BKAV HaiHS : Handler điều hướng sang trang cài đặt tài khoản - end

  return (
    <div className="mt-auto p-4 border-t border-gray-200 dark:border-[#1e293b]/60 flex items-center justify-between bg-gray-50 dark:bg-[#0a0e18] select-none shrink-0 transition-colors duration-300">
      <div
        onClick={handleNavigateSettings}
        className="flex items-center gap-3 overflow-hidden cursor-pointer hover:opacity-80 active:scale-[0.98] transition-all duration-200"
      >
        {/* Avatar trích xuất 2 ký tự đầu theo tên đầy đủ */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex justify-center items-center font-bold text-white uppercase shrink-0 shadow-lg">
          {user?.fullname ? user.fullname.substring(0, 2).toUpperCase() : "US"}
        </div>

        {/* Thông tin họ tên và vai trò */}
        <div className="flex flex-col overflow-hidden text-left">
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate capitalize transition-colors duration-300">
            {user?.fullname || user?.email?.split("@")[0] || "superadmin"}
          </span>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase mt-0.5 transition-colors duration-300">
            {user?.role || t("hub_member") || "hub_member"}
          </span>
        </div>
      </div>

      {/* Nút mở rộng xác nhận đăng xuất */}
      <button
        type="button"
        onClick={handleOpenConfirm}
        title={t("signOut") || "signOut"}
        className="p-2 rounded-xl hover:bg-red-500/10 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all cursor-pointer"
      >
        <FiLogOut size={16} />
      </button>

      {/* Hộp thoại xác nhận hành động đăng xuất */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleSignOut}
        title={t("signOut") || "signOut"}
        message={t("signOutDesc") || "signOutDesc"}
        confirmText={t("signOut") || "signOut"}
        cancelText={t("doneBtn") || "doneBtn"}
        type="warning"
      />
    </div>
  );
};
// BKAV HaiHS : Component widget hiển thị thông tin người dùng và nút đăng xuất ở cuối sidebar - end

export default UserProfileWidget;
