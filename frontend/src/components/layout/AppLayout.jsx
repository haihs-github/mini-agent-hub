import React, { useState, createContext, useContext } from "react";

// BKAV HaiHS : Tao Context de quan ly trang thai dong mo sidebar - start
const SidebarContext = createContext({
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
});
// BKAV HaiHS : Tao Context de quan ly trang thai dong mo sidebar - end

// BKAV HaiHS : Hook dung de lay trang thai dong mo sidebar - start
export const useSidebar = () => useContext(SidebarContext);
// BKAV HaiHS : Hook dung de lay trang thai dong mo sidebar - end

// BKAV HaiHS : Component chia layout chính của ứng dụng - start
const AppLayout = ({
  sidebar,
  isSidebarOpen = false,
  setIsSidebarOpen = () => {},
  children,
}) => {
  // Dong sidebar tu dong khi click chon menu hoac item trong sidebar o mobile
  const handleSidebarClick = (e) => {
    const target = e.target;
    // Neu click vao modal, drop-down hoac confirm modal thi khong tu dong dong
    if (target.closest(".fixed") || target.closest(".absolute")) {
      return;
    }
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest(".cursor-pointer")
    ) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
      <div className="w-full h-screen bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-white flex overflow-hidden font-sans transition-colors duration-300 relative">
        {/* Lớp phủ mờ nền khi sidebar mở trên điện thoại */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Cột Sidebar Trái - Responsive trượt ra vào */}
        <aside
          onClick={handleSidebarClick}
          className={`fixed md:static inset-y-0 left-0 w-[300px] h-full bg-white dark:bg-[#0d121f] border-r border-gray-200 dark:border-[#1e293b] flex flex-col shrink-0 z-50 md:z-auto transition-transform duration-300 ease-in-out transform ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }`}
        >
          {sidebar}
        </aside>

        {/* Vùng không gian làm việc bên phải */}
        <main className="flex-1 h-full flex flex-col overflow-hidden relative bg-gray-50 dark:bg-[#0b0f19] transition-colors duration-300">
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
};
// BKAV HaiHS : Component chia layout chính của ứng dụng - end

export default AppLayout;
