import React from "react";
import { RiRobotLine } from "react-icons/ri";
import { useLanguage } from "@/context/LanguageContext";

// BKAV HaiHS : Component hiển thị tin nhắn của AI trong workspace chat, hỗ trợ trạng thái đang trả lời và thông tin meta - start
const AIMessageItem = ({ message }) => {
  const { t } = useLanguage();

  return (
    <div className="flex gap-4 max-w-[85%] mr-auto animate-fade-in group">
      {/* Avatar bot robot */}
      <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 dark:bg-blue-600/10 dark:border-blue-500/30 flex justify-center items-center font-bold text-blue-600 dark:text-blue-400 shrink-0 shadow-inner transition-colors duration-300">
        <RiRobotLine size={16} />
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {/* Khu vực hiển thị nội dung câu trả lời */}
        <div className="text-gray-800 dark:text-gray-200 text-sm leading-7 whitespace-pre-wrap selection:bg-blue-600/30 font-normal transition-colors duration-300">
          {message.content || (
            <span className="text-gray-400 dark:text-gray-600 italic transition-colors duration-300">
              {t("chat_loading") || "chat_loading"}
            </span>
          )}
        </div>

        {/* Chỉ hiển thị thông tin phản hồi khi AI đã xử lý xong */}
        {!message.isStreaming && message.content && (
          <div className="flex flex-col gap-2 mt-1 pt-2 border-t border-gray-200 dark:border-[#1e293b]/30 animate-fade-in transition-colors duration-300">
            {/* Tên model và thời gian phản hồi */}
            <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium flex-wrap">
              <span className="uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 transition-colors duration-300">
                {message.modelName || "GROQ-AI"}
              </span>
              <span>•</span>
              <span>
                {t("response_time") || "response_time"}:{" "}
                {message.responseTime || "1.2s"}
              </span>
              {/* Trạng thái dừng bởi người dùng */}
              {message.isStopped && (
                <>
                  <span>•</span>
                  <span className="text-red-500 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded transition-colors duration-300">
                    {t("stopped_by_user") || "stopped_by_user"}
                  </span>
                </>
              )}
              {/* Số lượng token tiêu thụ */}
              {(message.usage || (message.totalTokens !== undefined && message.totalTokens !== null)) && (
                <>
                  <span>•</span>
                  <span className="text-blue-500 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded transition-colors duration-300">
                    Tokens: {message.usage?.total_tokens ?? message.totalTokens ?? 0} (
                    {message.usage?.prompt_tokens ?? message.promptTokens ?? 0} prompt,{" "}
                    {message.usage?.completion_tokens ?? message.completionTokens ?? 0} completion)
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// BKAV HaiHS : Component hiển thị tin nhắn của AI trong workspace chat, hỗ trợ trạng thái đang trả lời và thông tin meta - end

export default AIMessageItem;
