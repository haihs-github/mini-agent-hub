import React, { useState, useRef } from "react";

// BKAV HaiHS : Component hiển thị văn bản tự động cắt ngắn và bật tooltip khi tràn chiều rộng - start
const TruncatedText = ({
  text,
  className,
  maxWClass = "",
  onClick,
  showUnderline = false,
}) => {
  const [showTitle, setShowTitle] = useState(false);
  const textRef = useRef(null);

  // BKAV HaiHS : Kiểm tra tràn chiều rộng khi di chuột vào để quyết định hiện tooltip - start
  const handleMouseEnter = () => {
    const el = textRef.current;
    if (el) {
      const isOverflowing = el.scrollWidth > el.clientWidth;
      setShowTitle(isOverflowing);
    }
  };
  // BKAV HaiHS : Kiểm tra tràn chiều rộng khi di chuột vào để quyết định hiện tooltip - end

  return (
    <span
      ref={textRef}
      onMouseEnter={handleMouseEnter}
      title={showTitle ? text : undefined}
      onClick={onClick}
      className={`truncate block ${showUnderline ? "hover:underline cursor-pointer" : ""} ${maxWClass} ${className || ""}`}
    >
      {text}
    </span>
  );
};
// BKAV HaiHS : Component hiển thị văn bản tự động cắt ngắn và bật tooltip khi tràn chiều rộng - end

export default TruncatedText;
