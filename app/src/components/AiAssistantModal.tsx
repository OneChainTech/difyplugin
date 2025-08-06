'use client';

import { useState, useEffect } from 'react';
import { SpotData } from '@/app/page';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea"; // Using Textarea for more space

import eviltransform from 'eviltransform';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSpot: (spot: SpotData) => void;
  userId?: string;
}

const AiAssistantModal = ({ isOpen, onClose, onAddSpot, userId }: AiAssistantModalProps) => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUserInput('');
      setIsLoading(false);
      setStatusMessage(null);
    }
  }, [isOpen]);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    setIsLoading(true);
    setStatusMessage('正在获取您的位置并请求AI解析...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Correct the coordinates from WGS-84 to GCJ-02
        let correctedLat, correctedLng;
        
        try {
          const correctedCoords = eviltransform.wgs2gcj(latitude, longitude);
          console.log('Original coordinates:', { latitude, longitude });
          console.log('Corrected coordinates:', correctedCoords);
          
          // 检查返回值的类型
          if (Array.isArray(correctedCoords)) {
            correctedLat = Number(correctedCoords[0]);
            correctedLng = Number(correctedCoords[1]);
          } else if (correctedCoords && typeof correctedCoords === 'object') {
            // 如果是对象格式
            correctedLat = Number(correctedCoords.lat || correctedCoords.latitude);
            correctedLng = Number(correctedCoords.lng || correctedCoords.longitude);
          } else {
            // 如果转换失败，使用原始坐标
            console.log('坐标转换失败，使用原始坐标');
            correctedLat = latitude;
            correctedLng = longitude;
          }
          
          if (isNaN(correctedLat) || isNaN(correctedLng)) {
            throw new Error('坐标转换失败');
          }
        } catch (error) {
          console.log('坐标转换出错，使用原始坐标:', error);
          correctedLat = latitude;
          correctedLng = longitude;
        }

        try {
          const requestBody = { message: userInput, latitude: correctedLat, longitude: correctedLng, userId };
          console.log('Sending request:', requestBody);
          
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'AI 服务或数据库出错');
          }

          const newSpot: SpotData = await res.json();
          onAddSpot(newSpot);
          
          setStatusMessage('标记已成功创建！');
          setTimeout(() => {
            onClose();
          }, 1500);

        } catch (err: any) {
          setStatusMessage(`错误: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      },
      (geoError) => {
        setStatusMessage('错误: 无法获取您的位置，请授权后再试。');
        setIsLoading(false);
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI 钓点助手</DialogTitle>
          <DialogDescription>
            请在下方输入您的钓鱼记录，例如："下午在桥下用5米手竿和蚯蚓钓到一条大鲫鱼，钓点属于城市河流。"
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleUserSubmit} className="space-y-4">
          <Textarea 
            value={userInput} 
            onChange={(e) => setUserInput(e.target.value)} 
            placeholder="输入您的钓鱼记录..." 
            disabled={isLoading} 
            rows={4}
          />
          
          {statusMessage && (
            <div className={`text-sm p-3 rounded-md ${statusMessage.startsWith('错误') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
              {statusMessage}
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '正在创建...' : '创建钓点'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AiAssistantModal;