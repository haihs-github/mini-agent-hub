import React, { useState } from "react";
import { FiCopy, FiThumbsUp, FiCheck } from "react-icons/fi";
import { useToast } from "@/components/Toast";
import { RiRobotLine } from "react-icons/ri";
import { useLanguage } from "@/context/LanguageContext"; // BKAV HaiHS: Import hook ngôn ngữ

// BKAV HaiHS : Component hiển thị tin nhắn của AI trong workspace chat, hỗ trợ trạng thái đang trả lời, thông tin meta và nút tương tác like/copy - start
const AIMessageItem = ({ message }) => {
  const { showToast } = useToast();
  const { t } = useLanguage(); // BKAV HaiHS: Khai báo hàm dịch thuật
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  // Xử lý sao chép văn bản vào bộ nhớ đệm
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      showToast(
        t("toast_copy_success") || "Đã sao chép câu trả lời vào bộ nhớ tạm!",
        "success",
      );
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast(t("toast_copy_fail") || "Không thể sao chép văn bản!", "error");
    }
  };

  return (
    <div className="flex gap-4 max-w-[85%] mr-auto animate-fade-in group">
      {/* AVATAR BOT ROBOT */}
      <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 dark:bg-blue-600/10 dark:border-blue-500/30 flex justify-center items-center font-bold text-blue-600 dark:text-blue-400 shrink-0 shadow-inner transition-colors duration-300">
        <RiRobotLine size={16} />
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {/* KHU VỰC HIỂN THỊ NỘI DUNG TEXT CHỮ CHẠY */}
        <div className="text-gray-800 dark:text-gray-200 text-sm leading-7 whitespace-pre-wrap selection:bg-blue-600/30 font-normal transition-colors duration-300">
          {message.content || (
            <span className="text-gray-400 dark:text-gray-600 italic transition-colors duration-300">
              {t("chat_loading") || "Đang tải câu trả lời..."}
            </span>
          )}
        </div>

        {/* CHỈ HIỂN THỊ THÔNG TIN META VÀ NÚT BẤM KHI AI ĐÃ XỬ LÝ XONG */}
        {!message.isStreaming && message.content && (
          <div className="flex flex-col gap-2 mt-1 pt-2 border-t border-gray-200 dark:border-[#1e293b]/30 animate-fade-in transition-colors duration-300">
            {/* Tên Model và Thời gian phản hồi */}
            <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium flex-wrap">
              <span className="uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 transition-colors duration-300">
                {message.modelName || "GROQ-AI"}
              </span>
              <span>•</span>
              <span>
                {t("response_time") || "Thời gian phản hồi"}:{" "}
                {message.responseTime || "1.2s"}
              </span>
              {/* Hiển thị trạng thái Dừng bởi người dùng nếu có */}
              {message.isStopped && (
                <>
                  <span>•</span>
                  <span className="text-red-500 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded transition-colors duration-300">
                    {t("stopped_by_user") || "Đã dừng"}
                  </span>
                </>
              )}
              {/* Hiển thị số lượng Token nếu có */}
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

            {/* Bộ đôi nút Tương tác */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLiked(!liked)}
                className={`p-2 rounded-lg transition-colors cursor-pointer transition-colors duration-300 ${
                  liked
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-[#161b26]"
                }`}
                title={t("useful_btn") || "Hữu ích"}
              >
                <FiThumbsUp size={14} />
              </button>

              <button
                onClick={handleCopy}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-[#161b26] transition-colors cursor-pointer transition-colors duration-300"
                title={t("copy_btn") || "Sao chép câu trả lời"}
              >
                {copied ? (
                  <FiCheck size={14} className="text-green-500" />
                ) : (
                  <FiCopy size={14} />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// BKAV HaiHS : Component hiển thị tin nhắn của AI trong workspace chat, hỗ trợ trạng thái đang trả lời, thông tin meta và nút tương tác like/copy - end

export default AIMessageItem;
