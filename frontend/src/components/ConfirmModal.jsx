import React, { useRef } from "react";
import { createPortal } from "react-dom";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";
import { useOutsideClick } from "@/hooks/useOutsideClick";

// BKAV HaiHS : Component Popup xác nhận hành động nguy hiểm - start
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "confirm",
  cancelText = "cancel",
  type = "danger",
}) => {
  const { t } = useLanguage();
  const modalRef = useRef(null);

  // BKAV HaiHS : Sử dụng hook dùng chung lắng nghe sự kiện click ra ngoài để đóng modal - start
  useOutsideClick(modalRef, () => {
    if (isOpen) {
      onClose();
    }
  });
  // BKAV HaiHS : Sử dụng hook dùng chung lắng nghe sự kiện click ra ngoài để đóng modal - end

  // BKAV HaiHS : Handler xử lý nút xác nhận hành động - start
  const handleConfirmClick = () => {
    onConfirm();
    onClose();
  };
  // BKAV HaiHS : Handler xử lý nút xác nhận hành động - end

  if (!isOpen) return null;

  const isDanger = type === "danger";

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none animate-fade-in">
      {/* Khung thẻ Card Modal */}
      <div
        ref={modalRef}
        className="w-full max-w-sm bg-white border border-gray-200 dark:bg-[#1a202c] dark:border-[#2d3748] rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300"
      >
        {/* Phần đầu header */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-[#2d3748] flex justify-between items-center bg-gray-50 dark:bg-[#111622]/40 transition-colors duration-300">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
            <FiAlertTriangle
              className={isDanger ? "text-red-500" : "text-amber-500"}
              size={16}
            />
            <span>{t(title) || title}</span>
          </h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors cursor-pointer"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Nội dung mô tả chi tiết */}
        <div className="p-5">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-300">
            {t(message) || message}
          </p>
        </div>

        {/* Khối nút bấm hành động cuối trang */}
        <div className="px-5 py-3.5 bg-gray-50 dark:bg-[#111622]/40 border-t border-gray-200 dark:border-[#2d3748] flex justify-end items-center gap-2.5 transition-colors duration-300">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white border border-gray-200 hover:bg-gray-100 dark:bg-[#1a202c] dark:border-[#2d3748] dark:hover:bg-gray-800 rounded-xl transition-all cursor-pointer"
          >
            {t(cancelText) || cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition-all shadow-md cursor-pointer ${
              isDanger
                ? "bg-red-600 hover:bg-red-700 shadow-red-600/10"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/10"
            }`}
          >
            {t(confirmText) || confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
// BKAV HaiHS : Component Popup xác nhận hành động nguy hiểm - end

export default ConfirmModal;
