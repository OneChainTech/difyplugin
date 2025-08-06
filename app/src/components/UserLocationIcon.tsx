'use client';

interface UserLocationIconProps {
  userName?: string;
  isNearby?: boolean;
  isSharing?: boolean;
}

const UserLocationIcon = ({ userName, isNearby = false, isSharing = false }: UserLocationIconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width="32" 
    height="32" 
    fill={isNearby ? "#F59E0B" : "#10B981"}
    stroke="#FFFFFF" 
    strokeWidth="1"
  >
    {/* 现代化的用户位置图标 */}
    <circle cx="12" cy="12" r="10" fill={isNearby ? "#F59E0B" : "#10B981"} opacity="0.9"/>
    <circle cx="12" cy="12" r="6" fill="#FFFFFF"/>
    {/* 定位点 */}
    <circle cx="12" cy="12" r="2" fill={isNearby ? "#F59E0B" : "#10B981"}/>
    {/* 定位指示器 */}
    <path d="M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z" 
          fill="none" stroke="#FFFFFF" strokeWidth="1.5"/>
    {/* 共享状态红点 */}
    {isSharing && (
      <circle cx="20" cy="4" r="3" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1"/>
    )}
  </svg>
);

export default UserLocationIcon; 