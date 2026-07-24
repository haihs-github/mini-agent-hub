import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext"; // BKAV HaiHS: Import hook ngôn ngữ

// BKAV HaiHS : Component hiển thị tin nhắn của người dùng trong workspace chat, hỗ trợ cả text và ảnh đính kèm - start
const UserMessageItem = ({ message }) => {
  const { t } = useLanguage(); // BKAV HaiHS: Khai báo hàm dịch thuật
  const [isExpanded, setIsExpanded] = useState(false);

  const content = message.content || "";
  const maxLength = 400;
  const isLong = content.length > maxLength;

  const displayContent =
    isExpanded || !isLong ? content : content.slice(0, maxLength) + "...";

  return (
    <div className="flex flex-col items-end gap-2 max-w-[75%] ml-auto animate-slide-up">
      {/* 1. HIỂN THỊ MẢNG ẢNH ĐÃ ĐÍNH KÈM (NẾU CÓ) */}
      {message.images && message.images.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-end">
          {message.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={t("user_image_alt") || "Đính kèm từ người dùng"}
              className="max-w-[200px] max-h-[150px] rounded-xl object-cover border border-gray-200 dark:border-[#232d42] shadow-md transition-colors cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(img, "_blank")}
            />
          ))}
        </div>
      )}

      {/* 2. TEXT CHÍNH CỦA USER */}
      <div className="bg-blue-600 text-white dark:bg-[#1e293b] dark:text-gray-100 rounded-2xl rounded-tr-none px-5 py-3.5 text-sm leading-relaxed shadow-lg border border-transparent dark:border-[#2d3748]/40 selection:bg-blue-500/30 transition-colors duration-300">
        <p className="whitespace-pre-wrap">{displayContent}</p>

        {isLong && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-xs font-semibold text-blue-200 hover:text-white dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer block underline"
          >
            {isExpanded
              ? t("show_less") || "Thu nhỏ"
              : t("show_more") || "Xem thêm"}
          </button>
        )}
      </div>
    </div>
  );
};
// BKAV HaiHS : Component hiển thị tin nhắn của người dùng trong workspace chat, hỗ trợ cả text và ảnh đính kèm - end

export default UserMessageItem;
