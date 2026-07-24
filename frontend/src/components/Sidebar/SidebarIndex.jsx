import React from "react";
import NavigationLinks from "@/components/Sidebar/NavigationLinks";
import ConversationHistoryList from "@/components/Sidebar/ConversationHistoryList";
import UserProfileWidget from "@/components/Sidebar/UserProfileWidget";

// BKAV HaiHS: component sidebar - start
const SidebarIndex = ({
  conversations,
  setConversations,
  activeId,
  selectConversation,
  hasMore,
  isLoadingHistory,
  fetchConversations,
  page,
  currentView,
  onViewChange,
}) => {
  return (
    /* Cập nhật màu nền tổng của Sidebar - Sáng: bg-white / Tối: bg-[#0b0f19] */
    <div className="w-full h-full flex flex-col overflow-hidden bg-white dark:bg-[#0b0f19] transition-colors duration-300">
      {/* Vùng Logo thương hiệu đầu trang*/}
      <div className="px-6 py-5 shrink-0 select-none">
        {/* Đổi màu chữ Logo Agent Hub theo theme */}
        <h1 className="text-xl font-bold tracking-wider text-gray-900 dark:text-white transition-colors duration-300">
          Agent Hub
        </h1>
      </div>

      {/* Các liên kết điều hướng chính*/}
      <NavigationLinks currentView={currentView} onViewChange={onViewChange} />

      {/* Vùng hiển thị nội dung động theo View hiện tại (được trợ lực scrollbar-gutter để chống dịch chuyển chiều rộng)*/}
      <div
        className="flex-1 min-h-0 flex flex-col overflow-hidden"
        style={{ scrollbarGutter: "stable" }}
      >
        {currentView === "chat" && (
          <ConversationHistoryList
            conversations={conversations}
            setConversations={setConversations}
            activeId={activeId}
            selectConversation={selectConversation}
            hasMore={hasMore}
            isLoadingHistory={isLoadingHistory}
            fetchConversations={fetchConversations}
            page={page}
          />
        )}
      </div>

      {/* Widget thông tin cá nhân dưới đáy Sidebar*/}
      <UserProfileWidget />
    </div>
  );
};
// BKAV HaiHS: component sidebar - end

export default SidebarIndex;
