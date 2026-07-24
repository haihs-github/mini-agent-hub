import { useState, useEffect, useRef } from "react";
import { searchGroupsApi } from "@/features/groups/groupApi";
import { useOutsideClick } from "@/hooks/useOutsideClick";

// BKAV HaiHS : Custom Hook quản lý toàn bộ state và logic tìm kiếm nhóm dạng dropdown - start
export const useGroupSearch = ({ onSearchChange }) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [selectedDropdownGroup, setSelectedDropdownGroup] = useState(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownResults, setDropdownResults] = useState([]);
  const [dropdownPage, setDropdownPage] = useState(1);
  const [dropdownHasMore, setDropdownHasMore] = useState(true);
  const [isDropdownLoading, setIsDropdownLoading] = useState(false);

  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // BKAV HaiHS : Tự động đóng dropdown khi click ra ngoài - start
  useOutsideClick(dropdownRef, () => setIsDropdownOpen(false));
  // BKAV HaiHS : Tự động đóng dropdown khi click ra ngoài - end

  // BKAV HaiHS : Bộ lọc chống rung cho Dropdown tìm kiếm nhóm - start
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!searchKeyword.trim()) {
      setDropdownResults([]);
      setIsDropdownOpen(false);
      return;
    }

    if (selectedDropdownGroup && searchKeyword === selectedDropdownGroup.name) {
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsDropdownLoading(true);
      try {
        const res = await searchGroupsApi(searchKeyword, 1, 10);
        const fetched = res?.data || [];
        const pagination = res?.pagination || {};
        setDropdownResults(fetched);
        setDropdownPage(1);
        setDropdownHasMore(1 < (pagination.totalPages || 1));
        setIsDropdownOpen(fetched.length > 0);
      } catch (err) {
        console.error("Autocomplete group search error:", err);
      } finally {
        setIsDropdownLoading(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchKeyword, selectedDropdownGroup]);
  // BKAV HaiHS : Bộ lọc chống rung cho Dropdown tìm kiếm nhóm - end

  // BKAV HaiHS : Cuộn vô hạn trong dropdown nhóm để tải thêm kết quả - start
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
        const res = await searchGroupsApi(searchKeyword, nextPage, 10);
        const fetched = res?.data || [];
        const pagination = res?.pagination || {};
        setDropdownResults((prev) => [...prev, ...fetched]);
        setDropdownPage(nextPage);
        setDropdownHasMore(nextPage < (pagination.totalPages || 1));
      } catch (err) {
        console.error("Dropdown load more group error:", err);
      } finally {
        setIsDropdownLoading(false);
      }
    }
  };
  // BKAV HaiHS : Cuộn vô hạn trong dropdown nhóm để tải thêm kết quả - end

  // BKAV HaiHS : Chọn nhóm từ dropdown để lọc bảng danh sách - start
  const handleSelectDropdownGroup = (group) => {
    setSelectedDropdownGroup(group);
    setSearchKeyword(group.name);
    setActiveSearchQuery("");
    setIsDropdownOpen(false);
    setDropdownResults([]);
    onSearchChange({ page: 1 });
  };
  // BKAV HaiHS : Chọn nhóm từ dropdown để lọc bảng danh sách - end

  // BKAV HaiHS : Thực thi tìm kiếm theo từ khóa khi bấm nút hoặc nhấn Enter - start
  const handleCommitSearch = () => {
    setActiveSearchQuery(searchKeyword);
    setSelectedDropdownGroup(null);
    setIsDropdownOpen(false);
    setDropdownResults([]);
    setSearchKeyword("");
    onSearchChange({ page: 1 });
  };
  // BKAV HaiHS : Thực thi tìm kiếm theo từ khóa khi bấm nút hoặc nhấn Enter - end

  // BKAV HaiHS : Xóa toàn bộ bộ lọc tìm kiếm và trả về trạng thái mặc định - start
  const handleClearSearch = () => {
    setSearchKeyword("");
    setActiveSearchQuery("");
    setSelectedDropdownGroup(null);
    setIsDropdownOpen(false);
    setDropdownResults([]);
    onSearchChange({ page: 1 });
  };
  // BKAV HaiHS : Xóa toàn bộ bộ lọc tìm kiếm và trả về trạng thái mặc định - end

  // BKAV HaiHS : Xử lý sự kiện thay đổi ô nhập từ khóa tìm kiếm - start
  const handleKeywordChange = (val) => {
    setSearchKeyword(val);
    if (!val.trim()) {
      setActiveSearchQuery("");
      setSelectedDropdownGroup(null);
      setIsDropdownOpen(false);
      setDropdownResults([]);
      onSearchChange({ page: 1 });
    }
  };
  // BKAV HaiHS : Xử lý sự kiện thay đổi ô nhập từ khóa tìm kiếm - end

  return {
    // state
    searchKeyword,
    activeSearchQuery,
    selectedDropdownGroup,
    isDropdownOpen,
    dropdownResults,
    isDropdownLoading,
    // refs
    dropdownRef,
    // handlers
    handleDropdownScroll,
    handleSelectDropdownGroup,
    handleCommitSearch,
    handleClearSearch,
    handleKeywordChange,
    setIsDropdownOpen,
  };
};
// BKAV HaiHS : Custom Hook quản lý toàn bộ state và logic tìm kiếm nhóm dạng dropdown - end
