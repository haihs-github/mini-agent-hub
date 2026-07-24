import { useState, useEffect, useRef, useCallback } from "react";
import { searchUsersApi } from "@/features/users/userApi";
import { useOutsideClick } from "@/hooks/useOutsideClick";

// BKAV HaiHS : Custom Hook quản lý toàn bộ state và logic tìm kiếm người dùng dạng dropdown Autocomplete - start
export const useUserSearch = ({ onSearchChange }) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [selectedDropdownUser, setSelectedDropdownUser] = useState(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownResults, setDropdownResults] = useState([]);
  const [dropdownPage, setDropdownPage] = useState(1);
  const [dropdownHasMore, setDropdownHasMore] = useState(true);
  const [isDropdownLoading, setIsDropdownLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownListRef = useRef(null);
  const itemRefs = useRef([]);
  const searchTimeoutRef = useRef(null);

  // BKAV HaiHS : Giữ stable reference cho onSearchChange để tránh stale closure - start
  const onSearchChangeRef = useRef(onSearchChange);
  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  }, [onSearchChange]);
  // BKAV HaiHS : Giữ stable reference cho onSearchChange để tránh stale closure - end

  // BKAV HaiHS : Tự động đóng dropdown khi click ra ngoài - start
  useOutsideClick(dropdownRef, () => setIsDropdownOpen(false));
  // BKAV HaiHS : Tự động đóng dropdown khi click ra ngoài - end

  // BKAV HaiHS : Bộ lọc chống rung cho Dropdown tìm kiếm người dùng với debounce 500ms - start
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!searchKeyword.trim()) {
      setDropdownResults([]);
      setIsDropdownOpen(false);
      return;
    }

    if (
      selectedDropdownUser &&
      (searchKeyword === selectedDropdownUser.fullname ||
        searchKeyword === selectedDropdownUser.email)
    ) {
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsDropdownLoading(true);
      try {
        const res = await searchUsersApi(searchKeyword, 1, 10);
        const fetched = res?.data || [];
        const pagination = res?.pagination || {};
        setDropdownResults(fetched);
        setDropdownPage(1);
        setDropdownHasMore(1 < (pagination.totalPages || 1));
        setIsDropdownOpen(fetched.length > 0);
      } catch (err) {
        console.error("Autocomplete search error:", err);
      } finally {
        setIsDropdownLoading(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchKeyword, activeSearchQuery, selectedDropdownUser]);
  // BKAV HaiHS : Bộ lọc chống rung cho Dropdown tìm kiếm người dùng với debounce 500ms - end

  // BKAV HaiHS : Reset chỉ số item được chọn bằng bàn phím khi danh sách kết quả thay đổi - start
  useEffect(() => {
    setFocusedIndex(-1);
    itemRefs.current = [];
  }, [dropdownResults]);
  // BKAV HaiHS : Reset chỉ số item được chọn bằng bàn phím khi danh sách kết quả thay đổi - end

  // BKAV HaiHS : Tự động cuộn item được chọn bằng phím Tab/Mũi tên vào tầm nhìn - start
  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [focusedIndex]);
  // BKAV HaiHS : Tự động cuộn item được chọn bằng phím Tab/Mũi tên vào tầm nhìn - end

  // BKAV HaiHS : Hàm dùng chung để reset trạng thái tìm kiếm dropdown và thông báo thay đổi trang - start
  const resetDropdownState = useCallback(() => {
    setIsDropdownOpen(false);
    setDropdownResults([]);
    setFocusedIndex(-1);
    onSearchChangeRef.current({ page: 1 });
  }, []);
  // BKAV HaiHS : Hàm dùng chung để reset trạng thái tìm kiếm dropdown và thông báo thay đổi trang - end

  // BKAV HaiHS : Cuộn vô hạn trong dropdown người dùng để tải thêm dữ liệu - start
  const handleDropdownScroll = async (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop <= clientHeight + 5 &&
      dropdownHasMore &&
      !isDropdownLoading
    ) {
      setIsDropdownLoading(true);
      try {
        const nextPage = dropdownPage + 1;
        const res = await searchUsersApi(searchKeyword, nextPage, 10);
        const fetched = res?.data || [];
        const pagination = res?.pagination || {};
        setDropdownResults((prev) => [...prev, ...fetched]);
        setDropdownPage(nextPage);
        setDropdownHasMore(nextPage < (pagination.totalPages || 1));
      } catch (err) {
        console.error("Dropdown load more error:", err);
      } finally {
        setIsDropdownLoading(false);
      }
    }
  };
  // BKAV HaiHS : Cuộn vô hạn trong dropdown người dùng để tải thêm dữ liệu - end

  // BKAV HaiHS : Chọn người dùng từ dropdown để lọc bảng danh sách - start
  const handleSelectDropdownUser = (user) => {
    setSelectedDropdownUser(user);
    setSearchKeyword(user.fullname || user.email);
    setActiveSearchQuery("");
    resetDropdownState();
  };
  // BKAV HaiHS : Chọn người dùng từ dropdown để lọc bảng danh sách - end

  // BKAV HaiHS : Thực thi tìm kiếm người dùng theo từ khóa gõ vào - start
  const handleCommitSearch = () => {
    if (!searchKeyword.trim()) return;
    setActiveSearchQuery(searchKeyword);
    setSelectedDropdownUser(null);
    setSearchKeyword("");
    resetDropdownState();
  };
  // BKAV HaiHS : Thực thi tìm kiếm người dùng theo từ khóa gõ vào - end

  // BKAV HaiHS : Xóa bỏ toàn bộ bộ lọc tìm kiếm và đưa về mặc định - start
  const handleClearSearch = () => {
    setSearchKeyword("");
    setActiveSearchQuery("");
    setSelectedDropdownUser(null);
    resetDropdownState();
  };
  // BKAV HaiHS : Xóa bỏ toàn bộ bộ lọc tìm kiếm và đưa về mặc định - end

  // BKAV HaiHS : Xử lý sự kiện thay đổi ô nhập liệu tìm kiếm - start
  const handleKeywordChange = (val) => {
    setSearchKeyword(val);
    if (!val.trim()) {
      setActiveSearchQuery("");
      setSelectedDropdownUser(null);
      resetDropdownState();
    }
  };
  // BKAV HaiHS : Xử lý sự kiện thay đổi ô nhập liệu tìm kiếm - end

  // BKAV HaiHS : Xử lý các phím tắt bàn phím Escape, Tab, Enter trên ô nhập tìm kiếm - start
  const handleInputKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsDropdownOpen(false);
      setFocusedIndex(-1);
      inputRef.current?.blur();
      return;
    }
    if (e.key === "Tab" && isDropdownOpen && dropdownResults.length > 0) {
      e.preventDefault();
      setFocusedIndex((prev) =>
        e.shiftKey
          ? prev <= 0
            ? dropdownResults.length - 1
            : prev - 1
          : prev >= dropdownResults.length - 1
            ? 0
            : prev + 1,
      );
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < dropdownResults.length) {
        handleSelectDropdownUser(dropdownResults[focusedIndex]);
      } else {
        handleCommitSearch();
      }
    }
  };
  // BKAV HaiHS : Xử lý các phím tắt bàn phím Escape, Tab, Enter trên ô nhập tìm kiếm - end

  return {
    // state
    searchKeyword,
    activeSearchQuery,
    selectedDropdownUser,
    isDropdownOpen,
    dropdownResults,
    dropdownHasMore,
    isDropdownLoading,
    focusedIndex,
    // refs
    dropdownRef,
    inputRef,
    dropdownListRef,
    itemRefs,
    // handlers
    handleDropdownScroll,
    handleSelectDropdownUser,
    handleCommitSearch,
    handleClearSearch,
    handleKeywordChange,
    handleInputKeyDown,
    setIsDropdownOpen,
  };
};
// BKAV HaiHS : Custom Hook quản lý toàn bộ state và logic tìm kiếm người dùng dạng dropdown Autocomplete - end
