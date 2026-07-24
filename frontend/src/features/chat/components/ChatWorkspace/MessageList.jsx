import { useState, useEffect, useRef } from "react";
import { FiLoader } from "react-icons/fi";
import UserMessageItem from "@/features/chat/components/ChatWorkspace/UserMessageItem";
import AIMessageItem from "@/features/chat/components/ChatWorkspace/AIMessageItem";
import { useLanguage } from "@/context/LanguageContext";

// BKAV HaiHS : Component danh sách tin nhắn hỗ trợ phân trang cuộn ngược và đồng bộ ảnh khi refresh trang - start
const MessageList = ({
  activeConversationId,
  messages,
  isWaitingSkeleton,
  isStreaming,
  loadMoreMessages,
  hasMoreMessages,
  isLoadingMore,
}) => {
  const scrollContainerRef = useRef(null);
  const { t } = useLanguage();
  const [previousScrollHeight, setPreviousScrollHeight] = useState(0);
  const [isScrollToBottomNeeded, setIsScrollToBottomNeeded] = useState(true);

  const BASE_URL = "http://localhost:3000/";

  useEffect(() => {
    if (scrollContainerRef.current && isScrollToBottomNeeded) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isStreaming, isWaitingSkeleton, isScrollToBottomNeeded]);

  useEffect(() => {
    if (
      scrollContainerRef.current &&
      previousScrollHeight > 0 &&
      !isScrollToBottomNeeded
    ) {
      const container = scrollContainerRef.current;
      container.scrollTop = container.scrollHeight - previousScrollHeight;
      setPreviousScrollHeight(0);
    }
  }, [messages, previousScrollHeight, isScrollToBottomNeeded]);

  const handleScroll = async (e) => {
    const container = e.currentTarget;
    if (
      container.scrollTop === 0 &&
      hasMoreMessages &&
      !isLoadingMore &&
      loadMoreMessages &&
      activeConversationId
    ) {
      setIsScrollToBottomNeeded(false);
      setPreviousScrollHeight(container.scrollHeight);
      await loadMoreMessages(activeConversationId);
    } else if (
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + 50
    ) {
      setIsScrollToBottomNeeded(true);
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-gray-50 dark:bg-[#0b0f19] cyber-scrollbar transition-colors duration-300"
    >
      <style>{`
        .cyber-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .cyber-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .cyber-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
        .dark .cyber-scrollbar::-webkit-scrollbar-thumb { background: #232d42; }
        .cyber-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
      `}</style>

      {isLoadingMore && (
        <div className="w-full flex justify-center py-2 animate-fade-in">
          <FiLoader size={16} className="text-blue-500 animate-spin" />
        </div>
      )}

      {isWaitingSkeleton && messages.length === 0 ? (
        <div className="space-y-6 animate-pulse max-w-4xl mx-auto w-full py-4 select-none">
          {/* Skeleton Tin nhắn AI 1 */}
          <div className="flex gap-4 max-w-[70%] mr-auto">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#1e293b]/60 shrink-0"></div>
            <div className="flex-1 space-y-2.5 pt-1">
              <div className="h-3 bg-gray-200 dark:bg-[#1e293b]/60 rounded-md w-[85%]"></div>
              <div className="h-3 bg-gray-200 dark:bg-[#1e293b]/60 rounded-md w-[95%]"></div>
              <div className="h-3 bg-gray-200 dark:bg-[#1e293b]/60 rounded-md w-[60%]"></div>
            </div>
          </div>
          {/* Skeleton Tin nhắn User */}
          <div className="flex gap-4 max-w-[60%] ml-auto justify-end">
            <div className="flex-1 space-y-2.5 pt-1 flex flex-col items-end">
              <div className="h-3 bg-blue-100 dark:bg-blue-500/10 rounded-md w-[80%]"></div>
              <div className="h-3 bg-blue-100 dark:bg-blue-500/10 rounded-md w-[50%]"></div>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/10 shrink-0"></div>
          </div>
          {/* Skeleton Tin nhắn AI 2 */}
          <div className="flex gap-4 max-w-[80%] mr-auto">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#1e293b]/60 shrink-0"></div>
            <div className="flex-1 space-y-2.5 pt-1">
              <div className="h-3 bg-gray-200 dark:bg-[#1e293b]/60 rounded-md w-[90%]"></div>
              <div className="h-3 bg-gray-200 dark:bg-[#1e293b]/60 rounded-md w-[75%]"></div>
              <div className="h-3 bg-gray-200 dark:bg-[#1e293b]/60 rounded-md w-[40%]"></div>
            </div>
          </div>
        </div>
      ) : messages.length === 0 && !isWaitingSkeleton ? (
        <div className="h-full flex flex-col justify-center items-center text-center opacity-40 select-none animate-fade-in">
          <span className="text-6xl mb-4">🧠</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-wide transition-colors duration-300">
            {t("chat_welcome_title") || "Mini Agent Hub Workspace"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs leading-5 transition-colors duration-300">
            {t("chat_welcome_desc") ||
              "Hãy chọn một mô hình AI và gửi câu hỏi đầu tiên để bắt đầu cuộc trò chuyện đột phá bứt phá."}
          </p>
        </div>
      ) : (
        messages.map((msg) => {
          const isUser = msg.role === "user";

          const imageUrls = [];
          if (msg.attachments && msg.attachments.length > 0) {
            msg.attachments.forEach((att) => {
              const path = att.filePath || "";
              imageUrls.push(
                path.startsWith("http") ? path : `${BASE_URL}${path}`,
              );
            });
          } else if (msg.images && msg.images.length > 0) {
            imageUrls.push(...msg.images);
          }

          const normalizedMsg = {
            ...msg,
            images: imageUrls,
            attachments:
              msg.attachments || imageUrls.map((url) => ({ filePath: url })),
          };

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} w-full animate-fade-in`}
            >
              {isUser ? (
                <UserMessageItem message={normalizedMsg} />
              ) : (
                <AIMessageItem message={normalizedMsg} />
              )}

              {imageUrls.length > 0 && !isUser && (
                <div className="grid grid-cols-1 gap-2 max-w-[70%] mt-2 ml-12">
                  {imageUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-[#232d42] bg-white dark:bg-[#0b0f19] shadow-2xl max-w-xs sm:max-w-sm transition-colors duration-300"
                    >
                      <img
                        src={url}
                        alt="Attached content"
                        className="w-full max-h-60 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(url, "_blank")}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      {isWaitingSkeleton && messages.length > 0 && (
        <div className="flex gap-4 max-w-[80%] mr-auto animate-pulse">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/10 flex justify-center items-center text-sm shrink-0 transition-colors duration-300"></div>
          <div className="flex flex-col gap-2.5 flex-1 pt-1">
            <div className="h-3.5 bg-gray-200 border border-gray-300 dark:bg-[#161b26] dark:border-[#232d42] rounded-md w-[90%] transition-colors duration-300"></div>
            <div className="h-3.5 bg-gray-200 border border-gray-300 dark:bg-[#161b26] dark:border-[#232d42] rounded-md w-[65%] transition-colors duration-300"></div>
          </div>
        </div>
      )}
    </div>
  );
};
// BKAV HaiHS : Component danh sách tin nhắn hỗ trợ phân trang cuộn ngược và đồng bộ ảnh khi refresh trang - end

export default MessageList;
