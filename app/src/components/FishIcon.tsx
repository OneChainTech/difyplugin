'use client';

const FishIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width="32" 
    height="32" 
    fill="#2563EB"
    stroke="#FFFFFF" 
    strokeWidth="1"
  >
    {/* 现代化的钓鱼图标 */}
    <circle cx="12" cy="12" r="10" fill="#2563EB" opacity="0.9"/>
    <circle cx="12" cy="12" r="6" fill="#FFFFFF"/>
    {/* 钓鱼竿 */}
    <path d="M12,4L12,8" stroke="#FFFFFF" strokeWidth="2" fill="none"/>
    <path d="M8,8L16,8" stroke="#FFFFFF" strokeWidth="2" fill="none"/>
    {/* 鱼钩 */}
    <path d="M12,8L12,16" stroke="#FFFFFF" strokeWidth="2" fill="none"/>
    <path d="M10,16L14,16" stroke="#FFFFFF" strokeWidth="2" fill="none"/>
    <path d="M12,16L12,18" stroke="#FFFFFF" strokeWidth="2" fill="none"/>
  </svg>
);

export default FishIcon;
