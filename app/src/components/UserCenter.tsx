'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Settings } from 'lucide-react';

interface UserCenterProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
  } | null;
  onUpdateName: (newName: string) => void;
}

const UserCenter = ({ isOpen, onClose, user, onUpdateName }: UserCenterProps) => {
  const [newName, setNewName] = useState(user?.name || '');
  const [isEditing, setIsEditing] = useState(false);

  console.log('UserCenter props:', { isOpen, user });

  const handleSaveName = () => {
    if (newName.trim()) {
      onUpdateName(newName.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setNewName(user?.name || '');
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <User size={20} />
            用户中心
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            管理您的个人信息和设置
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 用户ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">用户ID</label>
            <div className="p-3 bg-gray-50 rounded-md text-sm font-mono text-gray-600">
              {user?.id || '加载中...'}
            </div>
          </div>

          {/* 用户昵称 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">用户昵称</label>
            {isEditing ? (
              <div className="flex gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="输入新昵称"
                  className="flex-1"
                />
                <Button size="sm" onClick={handleSaveName}>
                  保存
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  取消
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm">{user?.name || '未设置'}</span>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  编辑
                </Button>
              </div>
            )}
          </div>

          {/* 其他信息 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">其他信息</label>
            <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-600">
              <p>• 您的钓点仅您可见</p>
              <p>• 50米内的其他用户可以看到您的位置</p>
              <p>• 可以申请与其他用户交换钓点</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserCenter; 