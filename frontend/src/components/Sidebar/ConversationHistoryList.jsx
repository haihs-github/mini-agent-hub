import React from "react";
import ConversationItem from "@/components/Sidebar/ConversationItem";
import { FiPlus, FiLoader } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";
import ConfirmModal from "@/components/ConfirmModal";
import { useConversationHistoryList } from "./hooks/useConversationHistoryList";
import { RenameDeleteModal } from "./components/RenameDeleteModal";

// BKAV HaiHS : Component danh sách lịch sử hội thoại trong sidebar - start
const ConversationHistoryList = ({
  conversations,
  setConversations,
  activeId,
  selectConversation,
  hasMore,
  isLoadingHistory,
  fetchConversations,
  page,
}) => {
  // BKAV HaiHS : Sử dụng hook đa ngôn ngữ toàn cục - start
  const { t } = useLanguage();
  // BKAV HaiHS : Sử dụng hook đa ngôn ngữ toàn cục - end

  // BKAV HaiHS : Nạp custom hook để tách biệt logic (Infinite Scroll, Rename/Delete API và States) ra khỏi UI - start
  const {
    targetConv,
    setTargetConv,
    modalType,
    setModalType,
    newTitle,
    setNewTitle,
    isActionLoading,
    isConfirmCancelOpen,
    setIsConfirmCancelOpen,
    loadMoreRef,
    handleCloseModalWithCheck,
    handleRenameSubmit,
    handleDeleteSubmit,
  } = useConversationHistoryList({
    conversations,
    setConversations,
    activeId,
    selectConversation,
    hasMore,
    isLoadingHistory,
    fetchConversations,
    page,
  });
  // BKAV HaiHS : Nạp custom hook để tách biệt logic (Infinite Scroll, Rename/Delete API và States) ra khỏi UI - end

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* NÚT THÊM HỘI THOẠI MỚI CHUẨN DESIGN */}
      <div className="px-4 py-3">
        <button
          onClick={() => selectConversation("new-chat")}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.98] text-white text-sm font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/10 cursor-pointer"
        >
          <FiPlus size={16} />
          <span>{t("new_conversation") || "new_conversation"}</span>
        </button>
      </div>

      {/* VÙNG CUỘN DANH SÁCH LỊCH SỬ */}
      <div className="flex-1 overflow-y-auto space-y-1.5 py-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-800 transition-colors">
        {conversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={activeId === conv.id}
            onSelect={selectConversation}
            onOpenRename={(c) => {
              setTargetConv(c);
              setNewTitle(c.title);
              setModalType("rename");
            }}
            onOpenDelete={(c) => {
              setTargetConv(c);
              setModalType("delete");
            }}
          />
        ))}

        {/* DIV ĐÁY NHẬN DIỆN LOAD MORE PHÂN TRANG */}
        <div
          ref={loadMoreRef}
          className="h-10 w-full flex justify-center items-center"
        >
          {isLoadingHistory && (
            <FiLoader className="animate-spin text-blue-500 text-lg" />
          )}
        </div>
      </div>

      {/* HỆ THỐNG POPUP MODAL XÁC NHẬN SỬA / XÓA DÙNG COMPONENT ĐÃ TÁCH */}
      {modalType && (
        <RenameDeleteModal
          modalType={modalType}
          targetConv={targetConv}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          isActionLoading={isActionLoading}
          onClose={handleCloseModalWithCheck}
          onSubmit={
            modalType === "rename" ? handleRenameSubmit : handleDeleteSubmit
          }
        />
      )}

      {isConfirmCancelOpen && (
        <ConfirmModal
          isOpen={isConfirmCancelOpen}
          onClose={() => setIsConfirmCancelOpen(false)}
          onConfirm={() => {
            setIsConfirmCancelOpen(false);
            setModalType(null);
          }}
          title={t("confirm_cancel") || "confirm_cancel"}
          message={t("confirm_cancel_msg") || "confirm_cancel_msg"}
          confirmText={t("agree_cancel") || "agree_cancel"}
          cancelText={t("keep_editing") || "keep_editing"}
          type="warning"
        />
      )}
    </div>
  );
};
// BKAV HaiHS : Component danh sách lịch sử hội thoại trong sidebar - end

export default ConversationHistoryList;
