import React, { useState } from "react";
import { FiChevronDown, FiCpu, FiMenu } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext"; // BKAV HaiHS: Import hook ngôn ngữ
import { useSidebar } from "@/components/layout/AppLayout";

// BKAV HaiHS : Component header của workspace chat, chứa trạng thái kết nối và dropdown chọn model AI - start
const ChatHeader = ({ selectedModel, setSelectedModel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage(); // BKAV HaiHS: Khai báo hàm dịch thuật
  const { setIsSidebarOpen } = useSidebar();

  // Các model ai
  const models = [
    {
      id: "qwen/qwen3.6-27b",
      name: "qwen/qwen3.6-27b",
      desc: t("model_desc_llama") || "Siêu tốc độ, tối ưu hội thoại",
    },
    {
      id: "flowise",
      name: "flowise",
      desc: t("model_desc_flowise") || "Hệ thống AI quy trình kéo thả",
    },
  ];

  // Lấy tên model đang chọn để hiển thị trên nút dropdown
  const currentModelName =
    models.find((m) => m.id === selectedModel)?.name ||
    t("select_model") ||
    "Chọn Model AI";

  return (
    <div className="h-16 border-b border-gray-200 dark:border-[#1e293b]/60 flex items-center justify-between px-6 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md z-10 shrink-0 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -ml-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden cursor-pointer shrink-0 transition-colors duration-300"
          title="Mở menu"
        >
          <FiMenu size={18} />
        </button>
      </div>

      {/* DROPDOWN CHỌN MODEL*/}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-gray-50 dark:bg-[#161b26] border border-gray-200 dark:border-[#232d42] hover:border-gray-400 dark:hover:border-gray-600 text-xs font-semibold px-4 py-2 rounded-xl transition-all text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          <FiCpu className="text-blue-600 dark:text-blue-400" />
          <span>{currentModelName}</span>
          <FiChevronDown
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#161b26] border border-gray-200 dark:border-[#232d42] rounded-xl shadow-2xl py-1.5 z-50 animate-fade-in transition-colors duration-300">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  setSelectedModel(model.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-[#1e293b] flex flex-col transition-colors ${
                  selectedModel === model.id
                    ? "bg-gray-100 dark:bg-[#1e293b]/60 border-l-2 border-blue-500"
                    : ""
                }`}
              >
                <span className="text-xs font-bold text-gray-900 dark:text-white transition-colors duration-300">
                  {model.name}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 transition-colors duration-300">
                  {model.desc}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
// BKAV HaiHS : Component header của workspace chat, chứa trạng thái kết nối và dropdown chọn model AI - end

export default ChatHeader;
