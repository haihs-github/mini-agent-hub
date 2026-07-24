import React, { useState, useEffect } from "react";
import { FiPhone, FiMapPin, FiCheck, FiX, FiLoader } from "react-icons/fi";
import { useAuth } from "@/features/auth/AuthContext";
import { useToast } from "@/components/Toast";
import { updateProfileApi } from "@/features/settings/settingsApi";
import ConfirmModal from "@/components/ConfirmModal";
import { useLanguage } from "@/context/LanguageContext"; // BKAV HaiHS: Import hook ngôn ngữ

// BKAV HaiHS: component chỉnh sửa thông tin liên lạc - start
const PersonalInfo = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const { t, tError } = useLanguage(); // BKAV HaiHS: Khai báo hàm dịch thuật

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "",
    targetValue: "",
  });

  useEffect(() => {
    if (user) {
      setPhone(user.phone || "");
      setAddress(user.address || "");
    }
  }, [user]);

  const validatePhoneNumber = (num) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(num);
  };

  const handleOpenSaveConfirm = (type, value) => {
    if (type === "phone" && !validatePhoneNumber(value)) {
      showToast(
        t("toast_phone_invalid") || "Số điện thoại không đúng!",
        "warning",
      );
      return;
    }
    setConfirmModal({ isOpen: true, type: `save_${type}`, targetValue: value });
  };

  const handleOpenCancelConfirm = (type) => {
    const isDataChanged =
      type === "phone"
        ? phone !== (user?.phone || "")
        : address !== (user?.address || "");
    if (isDataChanged) {
      setConfirmModal({
        isOpen: true,
        type: `cancel_${type}`,
        targetValue: "",
      });
    } else {
      type === "phone" ? setIsEditingPhone(false) : setIsEditingAddress(false);
    }
  };

  // BKAV HaiHS : Goi API cap nhat thong tin lien lac va luu vao context - start
  const executeUpdateProfile = async (targetType, value) => {
    setIsSubmitting(true);
    const payload = {
      phone: targetType === "phone" ? value : phone,
      address: targetType === "address" ? value : address,
    };

    try {
      const res = await updateProfileApi(payload);
      showToast(
        t("toast_profile_success") || "Cập nhật thành công!",
        "success",
      );

      if (updateUser && res?.data) {
        updateUser(res.data.user, res.data.token);
      }

      targetType === "phone"
        ? setIsEditingPhone(false)
        : setIsEditingAddress(false);
    } catch (err) {
      showToast(tError(err), "error");
      if (targetType === "phone") setPhone(user?.phone || "");
      else setAddress(user?.address || "");
    } finally {
      setIsSubmitting(false);
      setConfirmModal({ isOpen: false, type: "", targetValue: "" });
    }
  };
  // BKAV HaiHS : Goi API cap nhat thong tin lien lac va luu vao context - end

  const handleConfirmAction = () => {
    const { type, targetValue } = confirmModal;
    if (type === "save_phone") executeUpdateProfile("phone", targetValue);
    if (type === "save_address") executeUpdateProfile("address", targetValue);
    if (type === "cancel_phone") {
      setPhone(user?.phone || "");
      setIsEditingPhone(false);
      setConfirmModal({ isOpen: false, type: "", targetValue: "" });
    }
    if (type === "cancel_address") {
      setAddress(user?.address || "");
      setIsEditingAddress(false);
      setConfirmModal({ isOpen: false, type: "", targetValue: "" });
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-sm select-none transition-colors duration-300">
        <span className="text-gray-400 text-lg">👤</span>
        <h4>{t("personalInfo")}</h4>
      </div>

      <div className="bg-white dark:bg-[#161b26] border border-gray-200 dark:border-[#232d42] rounded-2xl p-5 divide-y divide-gray-100 dark:divide-[#232d42]/60 shadow-xl transition-colors duration-300">
        {/* ROW 1: PHONE NUMBER */}
        <div className="flex items-center justify-between py-4 first:pt-1 last:pb-1 group">
          <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-[#232d42] flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-inner transition-colors duration-300">
              <FiPhone size={16} />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-colors">
                {t("phoneNumber")}
              </p>
              {isEditingPhone ? (
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full max-w-sm bg-gray-50 dark:bg-[#0b0f19] border border-blue-500/40 text-xs text-gray-900 dark:text-gray-100 rounded-lg px-3 py-1.5 focus:outline-none font-mono transition-colors"
                  placeholder="0912345678"
                  autoFocus
                />
              ) : (
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-200 font-mono tracking-wide truncate transition-colors">
                  {phone || t("notConfigured")}
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {isEditingPhone ? (
              <>
                <button
                  type="button"
                  onClick={() => handleOpenCancelConfirm("phone")}
                  disabled={isSubmitting}
                  className="p-2 text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                >
                  <FiX size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenSaveConfirm("phone", phone)}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-[11px] font-bold text-white rounded-full transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <FiLoader size={12} className="animate-spin" />
                  ) : (
                    <FiCheck size={12} />
                  )}
                  {t("confirmPhone")}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingPhone(true)}
                className="px-4 py-1.5 bg-white dark:bg-[#1e2533] border border-gray-200 dark:border-[#232d42] hover:bg-gray-100 dark:hover:bg-gray-800 text-[11px] font-bold text-blue-600 dark:text-blue-400 rounded-full transition-all cursor-pointer shadow-md"
              >
                {t("updateBtn")}
              </button>
            )}
          </div>
        </div>

        {/* ROW 2: ADDRESS */}
        <div className="flex items-center justify-between py-4 first:pt-1 last:pb-1 group">
          <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-[#232d42] flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-inner transition-colors duration-300">
              <FiMapPin size={16} />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-colors">
                {t("address")}
              </p>
              {isEditingAddress ? (
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full max-w-xl bg-gray-50 dark:bg-[#0b0f19] border border-blue-500/40 text-xs text-gray-900 dark:text-gray-100 rounded-lg px-3 py-1.5 focus:outline-none transition-colors"
                  placeholder={
                    t("address_placeholder") || "e.g. Hà Nội, Vietnam"
                  }
                  autoFocus
                />
              ) : (
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-200 truncate transition-colors">
                  {address || t("notConfigured")}
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {isEditingAddress ? (
              <>
                <button
                  type="button"
                  onClick={() => handleOpenCancelConfirm("address")}
                  disabled={isSubmitting}
                  className="p-2 text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                >
                  <FiX size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenSaveConfirm("address", address)}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-[11px] font-bold text-white rounded-full transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <FiLoader size={12} className="animate-spin" />
                  ) : (
                    <FiCheck size={12} />
                  )}
                  {t("confirmPhone")}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingAddress(true)}
                className="px-4 py-1.5 bg-white dark:bg-[#1e2533] border border-gray-200 dark:border-[#232d42] hover:bg-gray-100 dark:hover:bg-gray-800 text-[11px] font-bold text-blue-600 dark:text-blue-400 rounded-full transition-all cursor-pointer shadow-md"
              >
                {t("updateBtn")}
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({ isOpen: false, type: "", targetValue: "" })
        }
        onConfirm={handleConfirmAction}
        title={
          confirmModal.type.startsWith("save")
            ? t("confirm_save_title")
            : t("confirm_cancel_title")
        }
        message={
          confirmModal.type.startsWith("save")
            ? t("confirm_save_msg")
            : t("confirm_cancel_msg")
        }
        confirmText={
          confirmModal.type.startsWith("save")
            ? t("confirm_btn")
            : t("cancel_btn")
        }
        cancelText={t("back_btn")}
        type={confirmModal.type.startsWith("save") ? "info" : "warning"}
      />
    </div>
  );
};
// BKAV HaiHS: component chỉnh sửa thông tin liên lạc - end

export default PersonalInfo;
