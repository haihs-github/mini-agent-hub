import React, { useState, useEffect } from "react";
import { FiX, FiKey, FiLock, FiLoader } from "react-icons/fi";
import { changePasswordApi } from "@/features/auth/authApi";
import { useToast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/features/auth/AuthContext";
import { SUB_CONFIRM_TYPE } from "@/features/auth/constants/authConstants";
import PasswordInputField from "@/features/auth/components/PasswordInputField"; // BKAV HaiHS: Import component ô nhập mật khẩu con

// BKAV HaiHS: Component đổi mật khẩu - start
const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const { t, tError } = useLanguage();
  const { logout } = useAuth();

  // BKAV HaiHS : Khởi tạo State dạng Object tập trung để tránh State Bloat - start
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subConfirm, setSubConfirm] = useState({ isOpen: false, type: "" });
  // BKAV HaiHS : Khởi tạo State dạng Object tập trung để tránh State Bloat - end

  // BKAV HaiHS : Các biến tính toán kiểm tra điều kiện dữ liệu Form - start
  const isFormFilled =
    formData.oldPassword && formData.newPassword && formData.confirmPassword;
  const isPasswordMatched = formData.newPassword === formData.confirmPassword;
  const isNewPasswordValid = formData.newPassword.length >= 6;
  const isButtonDisabled =
    !isFormFilled || !isPasswordMatched || !isNewPasswordValid || isSubmitting;
  // BKAV HaiHS : Các biến tính toán kiểm tra điều kiện dữ liệu Form - end

  // BKAV HaiHS : Hàm xử lý khi người dùng nhấn nút Hủy - start
  const handleCancelClick = () => {
    if (
      formData.oldPassword ||
      formData.newPassword ||
      formData.confirmPassword
    ) {
      setSubConfirm({ isOpen: true, type: SUB_CONFIRM_TYPE.CANCEL });
    } else {
      onClose();
    }
  };
  // BKAV HaiHS : Hàm xử lý khi người dùng nhấn nút Hủy - end

  // BKAV HaiHS : Handler xử lý khi người dùng nhấn Cập nhật - start
  const handleUpdateClick = (e) => {
    e.preventDefault();
    if (isButtonDisabled) return;
    setSubConfirm({ isOpen: true, type: SUB_CONFIRM_TYPE.SAVE });
  };
  // BKAV HaiHS : Handler xử lý khi người dùng nhấn Cập nhật - end

  // BKAV HaiHS : Lệnh gọi API thực hiện đổi mật khẩu - start
  const executeChangePassword = async () => {
    setIsSubmitting(true);
    setSubConfirm({ isOpen: false, type: "" });

    try {
      await changePasswordApi({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      setSubConfirm({ isOpen: true, type: SUB_CONFIRM_TYPE.SUCCESS });
    } catch (err) {
      showToast(tError(err, "AUTH_WRONG_OLD_PASSWORD"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  // BKAV HaiHS : Lệnh gọi API thực hiện đổi mật khẩu - end

  // BKAV HaiHS : Handler điều phối hành động xác nhận từ ConfirmModal - start
  const handleConfirmAction = () => {
    if (subConfirm.type === SUB_CONFIRM_TYPE.SAVE) executeChangePassword();
    if (subConfirm.type === SUB_CONFIRM_TYPE.CANCEL) {
      setSubConfirm({ isOpen: false, type: "" });
      onClose();
    }
    if (subConfirm.type === SUB_CONFIRM_TYPE.SUCCESS) {
      setSubConfirm({ isOpen: false, type: "" });
      onClose();
      logout();
    }
  };
  // BKAV HaiHS : Handler điều phối hành động xác nhận từ ConfirmModal - end

  // BKAV HaiHS : Handler xử lý đóng ConfirmModal an toàn - start
  const handleCloseConfirmModal = () => {
    if (subConfirm.type === SUB_CONFIRM_TYPE.SUCCESS) {
      setSubConfirm({ isOpen: false, type: "" });
      onClose();
      logout();
    } else {
      setSubConfirm({ isOpen: false, type: "" });
    }
  };
  // BKAV HaiHS : Handler xử lý đóng ConfirmModal an toàn - end

  // BKAV HaiHS : Reset dữ liệu khi đóng/mở modal - start
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswords({
        old: false,
        new: false,
        confirm: false,
      });
      setIsSubmitting(false);
      setSubConfirm({ isOpen: false, type: "" });
    }
  }, [isOpen]);
  // BKAV HaiHS : Reset dữ liệu khi đóng/mở modal - end

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && handleCancelClick()}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4 animate-fade-in"
    >
      <div className="w-full max-w-md bg-white border border-gray-200 dark:bg-[#161b26] dark:border-[#232d42] rounded-2xl p-6 shadow-2xl relative space-y-6 transition-colors duration-300">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#232d42]/60 pb-4 select-none transition-colors duration-300">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-wide transition-colors duration-300">
            {t("updatePassword_title") || "updatePassword_title"}
          </h3>
          <button
            type="button"
            onClick={handleCancelClick}
            className="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer"
          >
            <FiX size={16} />
          </button>
        </div>

        <form onSubmit={handleUpdateClick} className="space-y-4">
          {/* Trường mật khẩu hiện tại */}
          <PasswordInputField
            label={t("curr_pwd") || "curr_pwd"}
            value={formData.oldPassword}
            onChange={(e) =>
              setFormData({ ...formData, oldPassword: e.target.value })
            }
            placeholder={t("curr_pwd") || "curr_pwd"}
            showPassword={showPasswords.old}
            onToggleShow={() =>
              setShowPasswords({
                ...showPasswords,
                old: !showPasswords.old,
              })
            }
            disabled={isSubmitting}
            Icon={FiKey}
            autoComplete="current-password"
          />

          {/* Trường mật khẩu mới */}
          <PasswordInputField
            label={t("new_pwd") || "new_pwd"}
            value={formData.newPassword}
            onChange={(e) =>
              setFormData({ ...formData, newPassword: e.target.value })
            }
            placeholder={t("new_pwd") || "new_pwd"}
            showPassword={showPasswords.new}
            onToggleShow={() =>
              setShowPasswords({
                ...showPasswords,
                new: !showPasswords.new,
              })
            }
            disabled={isSubmitting}
            Icon={FiLock}
            autoComplete="new-password"
            error={
              formData.newPassword && !isNewPasswordValid
                ? t("pwd_too_short") || "pwd_too_short"
                : ""
            }
          />

          {/* Trường xác nhận mật khẩu mới */}
          <PasswordInputField
            label={t("confirm_pwd") || "confirm_pwd"}
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({
                ...formData,
                confirmPassword: e.target.value,
              })
            }
            placeholder={t("confirm_pwd") || "confirm_pwd"}
            showPassword={showPasswords.confirm}
            onToggleShow={() =>
              setShowPasswords({
                ...showPasswords,
                confirm: !showPasswords.confirm,
              })
            }
            disabled={isSubmitting}
            Icon={FiLock}
            autoComplete="new-password"
            error={
              formData.confirmPassword && !isPasswordMatched
                ? t("pwd_mismatch") || "pwd_mismatch"
                : ""
            }
          />

          {/* Cụm nút điều khiển chân trang */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-[#232d42]/40 select-none transition-colors duration-300">
            <button
              type="button"
              onClick={handleCancelClick}
              disabled={isSubmitting}
              className="text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white px-4 py-2 rounded-xl dark:hover:bg-gray-800 transition-all cursor-pointer disabled:opacity-40"
            >
              {t("cancel_btn") || "cancel_btn"}
            </button>
            <button
              type="submit"
              disabled={isButtonDisabled}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-[#0f131f] dark:disabled:text-gray-600 text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:shadow-none transition-colors duration-300"
            >
              {isSubmitting && (
                <FiLoader size={12} className="animate-spin text-blue-400" />
              )}
              <span>{t("update_pwd_btn") || "update_pwd_btn"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Hộp thoại xác nhận hành động đổi mật khẩu hoặc hủy bỏ */}
      <ConfirmModal
        isOpen={subConfirm.isOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmAction}
        title={
          subConfirm.type === SUB_CONFIRM_TYPE.SAVE
            ? t("confirm_change_title") || "confirm_change_title"
            : subConfirm.type === SUB_CONFIRM_TYPE.CANCEL
              ? t("confirm_cancel_title") || "confirm_cancel_title"
              : t("updatePassword_title") || "updatePassword_title"
        }
        message={
          subConfirm.type === SUB_CONFIRM_TYPE.SAVE
            ? t("confirm_change_msg") || "confirm_change_msg"
            : subConfirm.type === SUB_CONFIRM_TYPE.CANCEL
              ? t("confirm_cancel_msg") || "confirm_cancel_msg"
              : t("changePasswordToastMessage") || "changePasswordToastMessage"
        }
        confirmText={
          subConfirm.type === SUB_CONFIRM_TYPE.SAVE
            ? t("agree_change_btn") || "agree_change_btn"
            : subConfirm.type === SUB_CONFIRM_TYPE.CANCEL
              ? t("agree_cancel_btn") || "agree_cancel_btn"
              : t("confirm") || "confirm"
        }
        cancelText={
          subConfirm.type === SUB_CONFIRM_TYPE.SUCCESS
            ? t("confirm") || "confirm"
            : t("go_back_btn") || "go_back_btn"
        }
        type={
          subConfirm.type === SUB_CONFIRM_TYPE.SAVE ||
          subConfirm.type === SUB_CONFIRM_TYPE.SUCCESS
            ? "info"
            : "warning"
        }
      />
    </div>
  );
};
// BKAV HaiHS: Component đổi mật khẩu - end

export default ChangePasswordModal;
