'use client';

import { useState, useEffect } from 'react';
import { SpotData } from '@/app/page';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

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
  const [statusType, setStatusType] = useState<'loading' | 'success' | 'error' | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUserInput('');
      setIsLoading(false);
      setStatusMessage(null);
      setStatusType(null);
    }
  }, [isOpen]);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    setIsLoading(true);
    setStatusMessage('正在获取您的位置并请求AI解析...');
    setStatusType('loading');

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
          
          setStatusMessage('钓点已成功创建！');
          setStatusType('success');
          setTimeout(() => {
            onClose();
          }, 1500);

        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : '未知错误';
          setStatusMessage(`错误: ${errorMessage}`);
          setStatusType('error');
        } finally {
          setIsLoading(false);
        }
      },
      (geoError) => {
        console.error('Failed to get user location:', geoError);
        setStatusMessage('无法获取您的位置，请检查位置权限设置');
        setStatusType('error');
        setIsLoading(false);
      }
    );
  };

  const getStatusIcon = () => {
    switch (statusType) {
      case 'loading':
        return <Loader2 size={20} className="animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mobile-modal max-w-md mx-4">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-800">AI 钓点助手</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-600 leading-relaxed">
            描述您想要添加的钓点信息，AI 将自动解析并创建标记
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUserSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="userInput" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <MapPin size={16} className="text-blue-500" />
              <span>钓点描述</span>
            </label>
            <Textarea
              id="userInput"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="例如：这里有很多鲤鱼，我用蚯蚓钓，环境很好，适合夜钓..."
              className="mobile-input min-h-[120px] resize-none"
              disabled={isLoading}
            />
          </div>

          {statusMessage && (
            <div className={`flex items-center space-x-2 p-3 rounded-xl ${
              statusType === 'success' ? 'bg-green-50 border border-green-200' :
              statusType === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              {getStatusIcon()}
              <span className={`text-sm font-medium ${
                statusType === 'success' ? 'text-green-700' :
                statusType === 'error' ? 'text-red-700' :
                'text-blue-700'
              }`}>
                {statusMessage}
              </span>
            </div>
          )}

          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto mobile-button"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="w-full sm:w-auto mobile-button bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span>处理中...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Sparkles size={16} />
                  <span>创建钓点</span>
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AiAssistantModal;