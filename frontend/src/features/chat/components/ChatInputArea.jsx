import React, { useState, useEffect, useRef } from "react";
import { FiSend, FiPaperclip, FiSquare, FiX } from "react-icons/fi";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/context/LanguageContext";

// BKAV HaiHS : Component khu vực nhập liệu và gửi câu hỏi trong workspace chat, hỗ trợ đính kèm ảnh và trạng thái đang trả lời - start
const ChatInputArea = ({
  onSendMessage,
  isStreaming,
  isStopping,
  onStopStream,
  attachedImages,
  setAttachedImages,
}) => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState("");
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // BKAV HaiHS: Tự động co giãn chiều cao của textarea theo nội dung nhập - start
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [prompt]);
  // BKAV HaiHS: Tự động co giãn chiều cao của textarea theo nội dung nhập - end

  // BKAV HaiHS : Tự động thu hồi và giải phóng Object URL xem trước ảnh khi component bị hủy - start
  useEffect(() => {
    return () => {
      attachedImages.forEach((img) => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [attachedImages]);
  // BKAV HaiHS : Tự động thu hồi và giải phóng Object URL xem trước ảnh khi component bị hủy - end

  // BKAV HaiHS : Xử lý khi người dùng chọn hình ảnh - start
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        showToast(
          t("toast_image_only") || "toast_image_only",
          "warning",
        );
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setAttachedImages((prev) => [
        ...prev,
        { fileObj: file, preview: previewUrl },
      ]);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  // BKAV HaiHS : Xử lý khi người dùng chọn hình ảnh - end

  // BKAV HaiHS : Xử lý khi người dùng xóa hình ảnh xem trước - start
  const removeImage = (indexToRemove) => {
    URL.revokeObjectURL(attachedImages[indexToRemove].preview);
    setAttachedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };
  // BKAV HaiHS : Xử lý khi người dùng xóa hình ảnh xem trước - end

  // BKAV HaiHS : Handler submit biểu mẫu gửi câu hỏi - start
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isStreaming) {
      if (isStopping) return;
      onStopStream();
      return;
    }
    if (!prompt.trim()) return;

    onSendMessage(prompt.trim());
    setPrompt("");
  };
  // BKAV HaiHS : Handler submit biểu mẫu gửi câu hỏi - end

  // BKAV HaiHS : Bẫy phím Enter để gửi câu hỏi thay vì xuống dòng - start
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  // BKAV HaiHS : Bẫy phím Enter để gửi câu hỏi thay vì xuống dòng - end

  return (
    <div className="p-4 bg-gray-50 dark:bg-[#0b0f19] border-t border-gray-200 dark:border-[#1e293b]/60 shrink-0 transition-colors duration-300">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto relative bg-white border border-gray-200 dark:bg-[#161b26] dark:border-[#232d42] rounded-2xl focus-within:border-blue-500/50 transition-all shadow-2xl overflow-hidden px-4 py-3"
      >
        {/* Khay hiển thị xem trước ảnh đính kèm */}
        {attachedImages.length > 0 && (
          <div className="flex flex-wrap gap-2.5 pb-3 border-b border-gray-100 dark:border-[#232d42]/60 mb-2 animate-fade-in transition-colors">
            {attachedImages.map((imgObj, idx) => (
              <div
                key={idx}
                className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-200 dark:border-[#2d3748] group shadow-inner"
              >
                <img
                  src={imgObj.preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-0.5 right-0.5 bg-black/70 rounded-full p-0.5 text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  <FiX size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Ô nhập textarea và nút chức năng chân trang */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-all cursor-pointer"
            title={t("attach_image") || "attach_image"}
          >
            <FiPaperclip size={18} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
            accept="image/*"
          />

          <textarea
            ref={textareaRef}
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              t("chat_placeholder") || "chat_placeholder"
            }
            className="cyber-scrollbar flex-1 bg-transparent border-0 focus:outline-none resize-none text-sm text-gray-900 dark:text-gray-100 max-h-36 placeholder-gray-400 dark:placeholder-gray-600 leading-6 py-1.5 transition-colors overflow-y-auto"
            style={{ height: "auto" }}
          />

          <button
            type="submit"
            disabled={isStopping || (!isStreaming && !prompt.trim())}
            className={`p-2.5 rounded-full transition-all flex justify-center items-center cursor-pointer shadow-lg ${
              isStopping
                ? "bg-gray-400 dark:bg-[#1e293b] text-gray-200 dark:text-gray-500 cursor-not-allowed"
                : isStreaming
                ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                : "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-200 dark:disabled:bg-[#0f131f] disabled:text-gray-400 dark:disabled:text-gray-700 disabled:shadow-none"
            }`}
          >
            {isStopping ? (
              <svg className="animate-spin h-3.5 w-3.5 text-white dark:text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isStreaming ? (
              <FiSquare size={14} fill="white" />
            ) : (
              <FiSend size={14} />
            )}
          </button>
        </div>
      </form>
      
      {/* Cảnh báo an toàn dữ liệu cuối trang */}
      <div className="text-center text-[10px] text-gray-500 dark:text-gray-600 tracking-wide mt-2 transition-colors">
        {t("ai_disclaimer") || "ai_disclaimer"}
      </div>
    </div>
  );
};
// BKAV HaiHS : Component khu vực nhập liệu và gửi câu hỏi trong workspace chat, hỗ trợ đính kèm ảnh và trạng thái đang trả lời - end

export default ChatInputArea;
