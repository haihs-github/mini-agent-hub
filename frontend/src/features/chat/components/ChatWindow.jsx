import React, { useState, useEffect } from "react";
import ChatHeader from "@/features/chat/components/ChatHeader";
import MessageList from "@/features/chat/components/MessageList";
import ChatInputArea from "@/features/chat/components/ChatInputArea";
import { getAiModelsApi } from "@/features/chat/chatApi"; // BKAV HaiHS: Import API lấy danh sách model

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
  const [models, setModels] = useState([]);

  // BKAV HaiHS : Tải danh sách model AI hoạt động từ Backend - start
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await getAiModelsApi();
        if (res?.data) {
          setModels(res.data);
          // Chọn model đầu tiên làm mặc định nếu có danh sách và model cũ không tồn tại trong danh sách mới
          if (Array.isArray(res.data) && res.data.length > 0) {
            const hasDefault = res.data.some((m) => m.id === "qwen/qwen3.6-27b");
            if (!hasDefault) {
              setSelectedModel(res.data[0].id);
            }
          }
        }
      } catch (error) {
        console.error("Không thể tải danh sách model AI từ Backend", error);
      }
    };
    fetchModels();
  }, []);
  // BKAV HaiHS : Tải danh sách model AI hoạt động từ Backend - end

  // BKAV HaiHS : Handler trung chuyển tin nhắn kèm theo model đang chọn - start
  const handleSendMessage = (prompt, images) => {
    sendMessage(prompt, selectedModel, images);
  };
  // BKAV HaiHS : Handler trung chuyển tin nhắn kèm theo model đang chọn - end

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-gray-50 dark:bg-[#0b0f19] transition-colors duration-300">
      {/* Đồng bộ màu nền theo theme */}

      {/* 1. Thanh đầu trang chọn model AI */}
      <ChatHeader
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        models={models}
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
        onSendMessage={handleSendMessage}
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
