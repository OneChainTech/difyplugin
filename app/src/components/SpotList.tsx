'use client';

import { useState } from 'react';
import { SpotData } from '@/app/page';
import { ChevronUp, ChevronDown, List, X, Share2, MapPin } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface SpotListProps {
  spots: SpotData[];
  onSpotSelect: (position: [number, number]) => void;
  onDeleteSpot?: (id: number) => void;
  currentUser?: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    lastSeen: Date;
    isOnline: boolean;
    is_sharing?: boolean;
  } | null;
  onToggleSharing?: (isSharing: boolean) => void;
}

const SpotList = ({ spots, onSpotSelect, onDeleteSpot, currentUser, onToggleSharing }: SpotListProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleToggleSharing = (checked: boolean) => {
    if (onToggleSharing) {
      onToggleSharing(checked);
    }
  };

  return (
    <div className="absolute top-4 left-4 z-[1100] sm:top-6 sm:left-6">
      {/* 主按钮 - 移动端优化 */}
      <div className="mobile-card p-3 min-w-[260px] sm:min-w-[320px]">
        <div className="flex items-center justify-between space-x-3">
          {/* 左侧：钓点列表按钮 */}
          <button
            onClick={toggleExpanded}
            className="flex items-center space-x-2 hover:bg-gray-50 active:bg-gray-100 p-2 rounded-xl transition-all duration-200 flex-1"
            title={isExpanded ? "收起列表" : "展开列表"}
          >
            <div className="w-8 h-8 bg-black/80 text-white rounded-lg flex items-center justify-center shadow-lg border border-white/10">
              <List size={16} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">钓点列表</span>
              <span className="text-xs text-gray-600 dark:text-gray-300">{spots.length}个钓点</span>
            </div>
            <div className="ml-auto">
              {isExpanded ? 
                <ChevronUp size={16} className="text-gray-700 dark:text-gray-300" /> : 
                <ChevronDown size={16} className="text-gray-700 dark:text-gray-300" />
              }
            </div>
          </button>
          
          {/* 右侧：共享开关 */}
          {currentUser && onToggleSharing && (
            <div className="flex items-center space-x-2 border-l border-white/20 pl-3">
              <div className="flex flex-col items-center space-y-1">
                <Share2 size={14} className="text-gray-800 dark:text-gray-200" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">共享</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <Switch 
                  checked={!!currentUser.is_sharing} 
                  onCheckedChange={handleToggleSharing}
                />
                <span className={`text-xs font-semibold ${currentUser.is_sharing ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                  {currentUser.is_sharing ? '开启' : '关闭'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 展开的列表 - 移动端优化 */}
      {isExpanded && (
        <div className="mt-2 mobile-list max-h-[60vh] w-full sm:w-80">
          {/* 共享状态信息区域 */}
          {currentUser && (
              <div className="p-3 border-b border-white/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <Share2 size={16} className="text-gray-800 dark:text-gray-200" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">共享状态</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={!!currentUser.is_sharing} 
                    onCheckedChange={handleToggleSharing}
                  />
                    <span className={`text-sm font-semibold ${currentUser.is_sharing ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {currentUser.is_sharing ? '已开启' : '已关闭'}
                  </span>
                </div>
              </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {currentUser.is_sharing 
                  ? '其他钓友可以看到您的钓点位置，便于交流分享' 
                  : '其他钓友无法看到您的钓点位置，保护隐私'
                }
              </p>
            </div>
          )}

          {/* 钓点列表内容 */}
          <div className="max-h-[40vh] overflow-y-auto">
            {spots.length === 0 ? (
              <div className="p-4 text-center">
                <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/20">
                  <MapPin size={20} className="text-gray-700 dark:text-gray-300" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">暂无钓点</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">点击地图添加您的第一个钓点</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {spots.map((spot) => (
                  <div
                    key={spot.id}
                    className="mobile-list-item relative group cursor-pointer"
                    onClick={() => onSpotSelect([spot.latitude, spot.longitude])}
                  >
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 bg-black/80 text-white rounded-lg flex items-center justify-center flex-shrink-0 border border-white/10">
                        <MapPin size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {spot.fish_type || '未知鱼类'}
                          </h4>
                          <span className="text-xs bg-black/10 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded-full border border-white/20">
                            钓点
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                            <span>鱼竿: {spot.rod || '未知'}</span>
                          </p>
                          <p className="text-xs text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                            <span>鱼饵: {spot.bait || '未知'}</span>
                          </p>
                          <p className="text-xs text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                            <span>环境: {spot.environment || '未知'}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* 删除按钮 */}
                    {onDeleteSpot && (
                      <button
                        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                        onClick={e => { e.stopPropagation(); onDeleteSpot(spot.id); }}
                        title="删除钓点"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotList;