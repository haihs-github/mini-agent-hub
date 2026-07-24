import React, { useState, useRef } from "react";
import {
  FiMessageSquare,
  FiMoreHorizontal,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";
import { useOutsideClick } from "@/hooks/useOutsideClick";

// BKAV HaiHS : Component hiển thị từng mục cuộc hội thoại trong danh sách lịch sử - start
const ConversationItem = ({
  conversation,
  isActive,
  onSelect,
  onOpenRename,
  onOpenDelete,
}) => {
  const { t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // BKAV HaiHS : Sử dụng hook dùng chung lắng nghe sự kiện click ra ngoài để đóng menu tùy chọn - start
  useOutsideClick(menuRef, () => {
    setShowMenu(false);
  });
  // BKAV HaiHS : Sử dụng hook dùng chung lắng nghe sự kiện click ra ngoài để đóng menu tùy chọn - end

  // BKAV HaiHS : Handler xử lý chọn cuộc hội thoại - start
  const handleSelect = () => {
    onSelect(conversation.id);
  };
  // BKAV HaiHS : Handler xử lý chọn cuộc hội thoại - end

  // BKAV HaiHS : Handler xử lý mở modal đổi tên - start
  const handleRenameClick = (e) => {
    e.stopPropagation(); // Chặn lan truyền sự kiện chọn cuộc hội thoại của thẻ cha
    setShowMenu(false);
    onOpenRename(conversation);
  };
  // BKAV HaiHS : Handler xử lý mở modal đổi tên - end

  // BKAV HaiHS : Handler xử lý mở modal xóa hội thoại - start
  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Chặn lan truyền sự kiện chọn cuộc hội thoại của thẻ cha
    setShowMenu(false);
    onOpenDelete(conversation);
  };
  // BKAV HaiHS : Handler xử lý mở modal xóa hội thoại - end

  // BKAV HaiHS : Handler xử lý mở menu tùy chọn phụ - start
  const handleMenuToggleClick = (e) => {
    e.stopPropagation(); // Chặn lan truyền sự kiện chọn cuộc hội thoại của thẻ cha
    setShowMenu(!showMenu);
  };
  // BKAV HaiHS : Handler xử lý mở menu tùy chọn phụ - end

  return (
    <div className="relative group px-2">
      {/* NÚT CHỌN HỘI THOẠI */}
      <button
        onClick={handleSelect}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 text-left pr-12 border ${
          isActive
            ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-[#1e293b]/80 dark:border-[#3b82f6]/30 dark:text-white font-semibold"
            : "bg-transparent border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-[#161b26] dark:hover:text-gray-200"
        } ${showMenu ? "bg-gray-100 text-gray-900 dark:bg-[#161b26] dark:text-white" : ""}`}
      >
        <FiMessageSquare
          size={16}
          className={`shrink-0 transition-colors duration-200 ${isActive ? "text-blue-500 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}
        />
        <span className="truncate flex-1">
          {conversation.title || t("untitled_conversation") || "untitled_conversation"}
        </span>
      </button>

      {/* NÚT TÙY CHỌN PHỤ VÀ MENU POPUP */}
      <div
        className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 ${
          showMenu ? "block" : "hidden group-hover:block"
        }`}
        ref={menuRef}
      >
        <button
          onClick={handleMenuToggleClick}
          className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2d3748] text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer block"
        >
          <FiMoreHorizontal size={16} />
        </button>

        {/* MENU THẢ XUỐNG CHI TIẾT TÍNH NĂNG */}
        {showMenu && (
          <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#1e2430] border border-gray-200 dark:border-[#2d3748] rounded-xl shadow-2xl py-1.5 animate-fade-in z-50">
            <button
              onClick={handleRenameClick}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d3748] hover:text-gray-900 dark:hover:text-white transition-colors text-left"
            >
              <FiEdit2 size={13} />
              {t("rename") || "rename"}
            </button>
            <button
              onClick={handleDeleteClick}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 transition-colors text-left"
            >
              <FiTrash2 size={13} />
              {t("delete_chat") || "delete_chat"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
// BKAV HaiHS : Component hiển thị từng mục cuộc hội thoại trong danh sách lịch sử - end

export default ConversationItem;
