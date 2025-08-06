'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface UserExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    name: string;
  };
  onSendRequest: (message: string) => void;
}

const UserExchangeModal = ({ isOpen, onClose, targetUser, onSendRequest }: UserExchangeModalProps) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      await onSendRequest(message);
      setMessage('');
      onClose();
    } catch (error) {
      console.error('发送交换申请失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">申请交换钓点</DialogTitle>
          <DialogDescription className="text-gray-600">
            向 {targetUser.name} 发送交换钓点申请
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            placeholder="请输入您想交换的钓点信息..." 
            disabled={isLoading} 
            rows={4}
          />
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading || !message.trim()}>
              {isLoading ? '发送中...' : '发送申请'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserExchangeModal; 