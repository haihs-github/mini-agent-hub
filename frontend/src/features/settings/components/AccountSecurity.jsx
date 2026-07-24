import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiKey, FiTrash2, FiUserX, FiLogOut, FiLoader } from "react-icons/fi";
import ChangePasswordModal from "@/features/auth/components/ChangePasswordModal";
import ConfirmModal from "@/components/ConfirmModal";
import { clearAllChatHistoryApi } from "@/features/chat/chatApi";
import { deleteAccountApi } from "@/features/users/userApi";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/features/auth/AuthContext";
import { useLanguage } from "@/context/LanguageContext"; // BKAV HaiHS: Import hook ngôn ngữ

// BKAV HaiHS: Component bảo mật tài khoản - start
const AccountSecurity = ({ setConversations }) => {
  const { showToast } = useToast();
  const { logout } = useAuth();
  const { t, tError } = useLanguage(); // BKAV HaiHS: Khai báo hàm dịch thuật

  const navigate = useNavigate();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  const [isClearing, setIsClearing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExecuteClearHistory = async () => {
    setIsClearing(true);
    try {
      await clearAllChatHistoryApi();
      showToast(t("toast_clear_success"), "success");
      if (setConversations) setConversations([]);
    } catch (err) {
      showToast(tError(err), "error");
    } finally {
      setIsClearing(false);
      setIsClearModalOpen(false);
    }
  };

  const handleExecuteDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccountApi();
      showToast(t("toast_delete_acc_success"), "success");
      logout();
      navigate("/");
    } catch (err) {
      showToast(tError(err), "error");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleExecuteSignOut = () => {
    logout();
    navigate("/");
    setIsSignOutModalOpen(false);
  };

  return (
    <div className="space-y-4 animate-fade-in select-none">
      <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-sm transition-colors duration-300">
        <span className="text-gray-400 text-lg">🛡️</span>
        <h4>{t("accountSecurity")}</h4>
      </div>

      <div className="bg-white dark:bg-[#161b26] border border-gray-200 dark:border-[#232d42] rounded-2xl p-5 divide-y divide-gray-100 dark:divide-[#232d42]/60 shadow-xl transition-colors duration-300">
        {/* ROW 1: PASSWORD & SECURITY */}
        <div className="flex items-center justify-between py-4 first:pt-1 last:pb-1 group">
          <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-[#232d42] flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-inner transition-colors duration-300">
              <FiKey size={16} />
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <h5 className="text-xs font-bold text-gray-900 dark:text-white transition-colors">
                {t("passwordSecurity")}
              </h5>
              <p className="text-[11px] text-gray-500 font-medium truncate">
                {t("changePassword")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-4 py-1.5 bg-white dark:bg-[#1e2533] border border-gray-200 dark:border-[#232d42] hover:bg-gray-100 dark:hover:bg-gray-800 text-[11px] font-bold text-blue-600 dark:text-blue-400 rounded-full transition-all shrink-0 shadow-md cursor-pointer"
          >
            {t("updateBtn")}
          </button>
        </div>

        {/* ROW 2: CLEAR CHAT HISTORY */}
        <div className="flex items-center justify-between py-4 first:pt-1 last:pb-1 group">
          <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-[#232d42] flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 shadow-inner transition-colors duration-300">
              <FiTrash2 size={16} />
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <h5 className="text-xs font-bold text-gray-900 dark:text-white transition-colors">
                {t("clearChat")}
              </h5>
              <p className="text-[11px] text-gray-500 font-medium truncate">
                {t("clearChatDesc")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsClearModalOpen(true)}
            disabled={isClearing}
            className="px-5 py-1.5 bg-transparent border border-orange-500/30 text-orange-600 dark:text-orange-400 text-[11px] font-bold rounded-full hover:bg-orange-50 dark:hover:bg-orange-500/5 transition-all shrink-0 shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
          >
            {isClearing && <FiLoader size={12} className="animate-spin" />}
            <span>{t("clear_button")}</span>
          </button>
        </div>

        {/* ROW 3: DELETE ACCOUNT */}
        <div className="flex items-center justify-between py-4 first:pt-1 last:pb-1 group">
          <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-[#232d42] flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 shadow-inner transition-colors duration-300">
              <FiUserX size={16} />
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <h5 className="text-xs font-bold text-gray-900 dark:text-white transition-colors">
                {t("deleteAccount")}
              </h5>
              <p className="text-[11px] text-gray-500 font-medium truncate">
                {t("deleteAccountDesc")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isDeleting}
            className="px-5 py-1.5 bg-red-50 dark:bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500 hover:text-red-700 dark:hover:text-white text-[11px] font-bold rounded-full transition-all shrink-0 shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
          >
            {isDeleting && <FiLoader size={12} className="animate-spin" />}
            <span>{t("deleteBtn")}</span>
          </button>
        </div>

        {/* ROW 4: SIGN OUT */}
        <div className="flex items-center justify-between py-4 first:pt-1 last:pb-1 group">
          <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-[#232d42] flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0 shadow-inner transition-colors duration-300">
              <FiLogOut size={16} />
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <h5 className="text-xs font-bold text-gray-900 dark:text-white transition-colors">
                {t("signOut")}
              </h5>
              <p className="text-[11px] text-gray-500 font-medium truncate">
                {t("signOutDesc")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSignOutModalOpen(true)}
            className="px-4 py-1.5 bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-[#232d42] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:text-white text-[11px] font-bold rounded-full transition-all shrink-0 shadow-md cursor-pointer"
          >
            {t("signOut")}
          </button>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
      <ConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleExecuteClearHistory}
        title={t("clearChat")}
        message={t("clearChatDesc")}
        confirmText={t("clearBtn")}
        cancelText={t("doneBtn")}
        type="danger"
      />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleExecuteDeleteAccount}
        title={t("deleteAccount")}
        message={t("deleteAccountDesc")}
        confirmText={t("deleteBtn")}
        cancelText={t("doneBtn")}
        type="danger"
      />
      <ConfirmModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleExecuteSignOut}
        title={t("signOut")}
        message={t("signOutDesc")}
        confirmText={t("signOut")}
        cancelText={t("doneBtn")}
        type="warning"
      />
    </div>
  );
};
// BKAV HaiHS: Component bảo mật tài khoản - end

export default AccountSecurity;
