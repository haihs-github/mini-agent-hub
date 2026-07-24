import React, { useState, useEffect } from "react";
import { FiPhone, FiMapPin, FiCheck, FiX, FiLoader } from "react-icons/fi";
import { useAuth } from "@/features/auth/AuthContext";
import { useToast } from "@/components/Toast";
import { updateProfileApi } from "@/features/settings/settingsApi";
import ConfirmModal from "@/components/ConfirmModal";
import { useLanguage } from "@/context/LanguageContext";
import {
  PROFILE_FIELDS,
  CONFIRM_TYPES,
} from "@/features/settings/constants/settingsConstants";

// BKAV HaiHS: component chỉnh sửa thông tin liên lạc - start
const PersonalInfo = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const { t, tError } = useLanguage();

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

  // BKAV HaiHS : Cập nhật state số điện thoại và địa chỉ khi thông tin người dùng thay đổi - start
  useEffect(() => {
    if (user) {
      setPhone(user.phone || "");
      setAddress(user.address || "");
    }
  }, [user]);
  // BKAV HaiHS : Cập nhật state số điện thoại và địa chỉ khi thông tin người dùng thay đổi - end

  // BKAV HaiHS : Kiểm tra định dạng số điện thoại hợp lệ (10 chữ số) - start
  const validatePhoneNumber = (num) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(num);
  };
  // BKAV HaiHS : Kiểm tra định dạng số điện thoại hợp lệ (10 chữ số) - end

  // BKAV HaiHS : Mở modal xác nhận trước khi lưu thông tin liên lạc - start
  const handleOpenSaveConfirm = (type, value) => {
    if (type === PROFILE_FIELDS.PHONE && !validatePhoneNumber(value)) {
      showToast(
        t("toast_phone_invalid") || "toast_phone_invalid",
        "warning",
      );
      return;
    }
    const confirmType =
      type === PROFILE_FIELDS.PHONE
        ? CONFIRM_TYPES.SAVE_PHONE
        : CONFIRM_TYPES.SAVE_ADDRESS;
    setConfirmModal({ isOpen: true, type: confirmType, targetValue: value });
  };
  // BKAV HaiHS : Mở modal xác nhận trước khi lưu thông tin liên lạc - end

  // BKAV HaiHS : Mở modal xác nhận trước khi hủy bỏ chỉnh sửa nếu dữ liệu bị thay đổi - start
  const handleOpenCancelConfirm = (type) => {
    const isPhone = type === PROFILE_FIELDS.PHONE;
    const isDataChanged = isPhone
      ? phone !== (user?.phone || "")
      : address !== (user?.address || "");
    if (isDataChanged) {
      const confirmType = isPhone
        ? CONFIRM_TYPES.CANCEL_PHONE
        : CONFIRM_TYPES.CANCEL_ADDRESS;
      setConfirmModal({
        isOpen: true,
        type: confirmType,
        targetValue: "",
      });
    } else {
      isPhone ? setIsEditingPhone(false) : setIsEditingAddress(false);
    }
  };
  // BKAV HaiHS : Mở modal xác nhận trước khi hủy bỏ chỉnh sửa nếu dữ liệu bị thay đổi - end

  // BKAV HaiHS : Gọi API cập nhật thông tin liên lạc và lưu vào context - start
  const executeUpdateProfile = async (targetType, value) => {
    setIsSubmitting(true);
    const isPhone = targetType === PROFILE_FIELDS.PHONE;
    const payload = {
      phone: isPhone ? value : phone,
      address: !isPhone ? value : address,
    };

    try {
      const res = await updateProfileApi(payload);
      showToast(
        t("toast_profile_success") || "toast_profile_success",
        "success",
      );

      if (updateUser && res?.data) {
        updateUser(res.data.user, res.data.token);
      }

      isPhone ? setIsEditingPhone(false) : setIsEditingAddress(false);
    } catch (err) {
      showToast(tError(err), "error");
      if (isPhone) setPhone(user?.phone || "");
      else setAddress(user?.address || "");
    } finally {
      setIsSubmitting(false);
      setConfirmModal({ isOpen: false, type: "", targetValue: "" });
    }
  };
  // BKAV HaiHS : Gọi API cập nhật thông tin liên lạc và lưu vào context - end

  // BKAV HaiHS : Thực thi hành động tương ứng sau khi người dùng xác nhận trên ConfirmModal - start
  const handleConfirmAction = () => {
    const { type, targetValue } = confirmModal;
    if (type === CONFIRM_TYPES.SAVE_PHONE) {
      executeUpdateProfile(PROFILE_FIELDS.PHONE, targetValue);
    } else if (type === CONFIRM_TYPES.SAVE_ADDRESS) {
      executeUpdateProfile(PROFILE_FIELDS.ADDRESS, targetValue);
    } else if (type === CONFIRM_TYPES.CANCEL_PHONE) {
      setPhone(user?.phone || "");
      setIsEditingPhone(false);
      setConfirmModal({ isOpen: false, type: "", targetValue: "" });
    } else if (type === CONFIRM_TYPES.CANCEL_ADDRESS) {
      setAddress(user?.address || "");
      setIsEditingAddress(false);
      setConfirmModal({ isOpen: false, type: "", targetValue: "" });
    }
  };
  // BKAV HaiHS : Thực thi hành động tương ứng sau khi người dùng xác nhận trên ConfirmModal - end

  const isSaveAction = confirmModal.type.startsWith("save");

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-sm select-none transition-colors duration-300">
        <span className="text-gray-400 text-lg">👤</span>
        <h4>{t("personalInfo")}</h4>
      </div>

      <div className="bg-white dark:bg-[#161b26] border border-gray-200 dark:border-[#232d42] rounded-2xl p-5 divide-y divide-gray-100 dark:divide-[#232d42]/60 shadow-xl transition-colors duration-300">
        {/* row số điện thoại */}
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
                  onClick={() => handleOpenCancelConfirm(PROFILE_FIELDS.PHONE)}
                  disabled={isSubmitting}
                  className="p-2 text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                >
                  <FiX size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenSaveConfirm(PROFILE_FIELDS.PHONE, phone)}
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

        {/* row địa chỉ */}
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
                    t("address_placeholder") || "address_placeholder"
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
                  onClick={() => handleOpenCancelConfirm(PROFILE_FIELDS.ADDRESS)}
                  disabled={isSubmitting}
                  className="p-2 text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                >
                  <FiX size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenSaveConfirm(PROFILE_FIELDS.ADDRESS, address)}
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
        title={isSaveAction ? t("confirm_save_title") : t("confirm_cancel_title")}
        message={isSaveAction ? t("confirm_save_msg") : t("confirm_cancel_msg")}
        confirmText={isSaveAction ? t("confirm_btn") : t("cancel_btn")}
        cancelText={t("back_btn")}
        type={isSaveAction ? "info" : "warning"}
      />
    </div>
  );
};
// BKAV HaiHS: component chỉnh sửa thông tin liên lạc - end

export default PersonalInfo;
