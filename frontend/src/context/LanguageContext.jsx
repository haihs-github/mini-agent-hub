import React, { createContext, useContext } from "react";
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import { translations } from "./translations"; // BKAV HaiHS: Import từ điển ngôn ngữ từ file riêng biệt

const LanguageContext = createContext();

// BKAV HaiHS : Khởi tạo cấu hình thư viện i18next - start
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translations.en },
    vi: { translation: translations.vi },
  },
  lng: localStorage.getItem("language") || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React tự động chống XSS
  },
});
// BKAV HaiHS : Khởi tạo cấu hình thư viện i18next - end

// BKAV HaiHS : Provider chuyển ngôn ngữ sử dụng React Context - start
export const LanguageProvider = ({ children }) => {
  const { t, i18n: i18nInstance } = useTranslation();

  const setLanguage = (lang) => {
    i18nInstance.changeLanguage(lang);
    localStorage.setItem("language", lang); // Ghi nhớ ngôn ngữ đã chọn vào bộ nhớ thiết bị
  };

  const language = i18nInstance.language;

  // BKAV HaiHS : Hàm định vị và dịch các mã lỗi phản hồi từ hệ thống Backend - start
  const tError = (error, defaultKey = "toast_error") => {
    if (error?._alreadyToasted) {
      return null;
    }
    const errData = error?.response?.data;
    const errorCode = errData?.code;
    const translatedMsg = errorCode ? t(errorCode) : null;
    
    // Nếu tìm thấy bản dịch cho mã lỗi từ Backend (ví dụ: USER_NOT_FOUND) -> Trả về bản dịch
    // Nếu không -> Trả về trường 'message' gốc của Backend hoặc key lỗi mặc định
    return translatedMsg && translatedMsg !== errorCode
      ? translatedMsg
      : errData?.message || t(defaultKey) || "An error occurred";
  };
  // BKAV HaiHS : Hàm định vị và dịch các mã lỗi phản hồi từ hệ thống Backend - end

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tError }}>
      {children}
    </LanguageContext.Provider>
  );
};
// BKAV HaiHS : Provider chuyển ngôn ngữ sử dụng React Context - end

export const useLanguage = () => useContext(LanguageContext);
