import React from "react";
import { createPortal } from "react-dom";
import { FiAlertTriangle, FiLoader } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";

export function RenameDeleteModal({
  modalType,
  targetConv,
  newTitle,
  setNewTitle,
  isActionLoading,
  onClose,
  onSubmit,
}) {
  const { t } = useLanguage();

  return createPortal(
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in outline-none"
    >
      <div className="bg-white dark:bg-[#161b26] border border-gray-200 dark:border-[#232d42] rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 transition-colors duration-300">
        <div className="flex items-center gap-3 text-yellow-500">
          <FiAlertTriangle size={24} />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">
            {modalType === "rename"
              ? t("rename_conversation") || "rename_conversation"
              : t("delete_warning") || "delete_warning"}
          </h3>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
          {modalType === "rename"
            ? t("rename_description") || "rename_description"
            : (t("delete_confirm_msg") || "delete_confirm_msg {title}").replace("{title}", targetConv?.title)}
        </p>

        {modalType === "rename" && (
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#0f131f] border border-gray-200 dark:border-[#232d42] focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none transition-colors duration-300"
            placeholder={t("placeholder_rename") || "placeholder_rename"}
            autoFocus
          />
        )}

        <div className="flex justify-end gap-3 pt-2 text-sm font-semibold">
          <button
            onClick={onClose}
            disabled={isActionLoading}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
          >
            {t("cancel") || "cancel"}
          </button>
          <button
            onClick={onSubmit}
            disabled={
              isActionLoading ||
              (modalType === "rename" && !newTitle.trim())
            }
            className={`px-4 py-2 rounded-xl text-white transition-colors flex items-center gap-2 cursor-pointer ${
              modalType === "rename"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isActionLoading && <FiLoader className="animate-spin" />}
            <span>{t("confirm") || "confirm"}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
