import { useEffect } from "react";

// BKAV HaiHS : Custom hook lắng nghe sự kiện click ra ngoài một phần tử để đóng/thoát - start
export function useOutsideClick(ref, callback) {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}
// BKAV HaiHS : Custom hook lắng nghe sự kiện click ra ngoài một phần tử để đóng/thoát - end
