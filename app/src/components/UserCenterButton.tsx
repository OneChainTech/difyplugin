'use client';

import { User } from 'lucide-react';

interface UserCenterButtonProps {
  onClick: () => void;
}

const UserCenterButton = ({ onClick }: UserCenterButtonProps) => {
  const handleClick = () => {
    console.log('用户中心按钮被点击');
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className="absolute top-4 right-4 z-[9999] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 hover:bg-white transition-all duration-200 border border-gray-200/50"
      title="用户中心"
      style={{ zIndex: 9999 }}
    >
      <User size={20} className="text-blue-600" />
    </button>
  );
};

export default UserCenterButton; 