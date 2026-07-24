import React, { useState } from "react";
import ChatHeader from "@/features/chat/components/ChatWorkspace/ChatHeader";
import MessageList from "@/features/chat/components/ChatWorkspace/MessageList";
import ChatInputArea from "@/features/chat/components/ChatWorkspace/ChatInputArea";

// BKAV HaiHS : Component chính của workspace chat, kết hợp header, danh sách tin nhắn và khu vực nhập liệu - start
const ChatWindow = ({
  activeConversationId,
  messages,
  isStreaming,
  isStopping,
  isWaitingSkeleton,
  sendMessage,
  handleStopStream,
  attachedImages,
  setAttachedImages,
  loadMoreMessages,
  hasMoreMessages,
  isLoadingMore,
}) => {
  const [selectedModel, setSelectedModel] = useState("qwen/qwen3.6-27b");

  return (
    /* BKAV HaiHS: Đồng bộ màu nền của toàn bộ vùng ChatWindow theo theme */
    <div className="w-full h-full flex flex-col overflow-hidden bg-gray-50 dark:bg-[#0b0f19] transition-colors duration-300">
      {/* 1. Thanh đầu trang chọn model AI */}
      <ChatHeader
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />

      {/* 2. Danh sách tin nhắn kèm bộ điều phối cuộn vô hạn ngược dòng dữ liệu */}
      <MessageList
        activeConversationId={activeConversationId}
        messages={messages}
        isWaitingSkeleton={isWaitingSkeleton}
        isStreaming={isStreaming}
        loadMoreMessages={loadMoreMessages}
        hasMoreMessages={hasMoreMessages}
        isLoadingMore={isLoadingMore}
      />

      {/* 3. Ô nhập liệu đa năng */}
      <ChatInputArea
        onSendMessage={(prompt, images) =>
          sendMessage(prompt, selectedModel, images)
        }
        isStreaming={isStreaming}
        isStopping={isStopping}
        onStopStream={handleStopStream}
        attachedImages={attachedImages}
        setAttachedImages={setAttachedImages}
      />
    </div>
  );
};
// BKAV HaiHS : Component chính của workspace chat, kết hợp header, danh sách tin nhắn và khu vực nhập liệu - end

export default ChatWindow;
