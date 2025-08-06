'use client';

import { useState } from 'react';
import { SpotData } from '@/app/page';
import { ChevronUp, ChevronDown, List, X } from 'lucide-react';

interface SpotListProps {
  spots: SpotData[];
  onSpotSelect: (position: [number, number]) => void;
  onDeleteSpot?: (id: number) => void;
}

const SpotList = ({ spots, onSpotSelect, onDeleteSpot }: SpotListProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // 始终显示的小按钮
  return (
    <div className="absolute top-20 left-4 z-[1000]">
      {/* 小按钮 */}
      <button
        onClick={toggleExpanded}
        className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 hover:bg-white transition-all duration-200 border border-gray-200/50"
        title={isExpanded ? "收起列表" : "展开列表"}
      >
        <div className="flex items-center space-x-2">
          <List size={18} className="text-blue-600" />
          <span className="text-sm font-medium text-gray-700">钓点 ({spots.length})</span>
          {isExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
        </div>
      </button>

      {/* 展开的列表 */}
      {isExpanded && (
        <div className="mt-2 w-44 max-h-[70vh] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg flex flex-col border border-gray-200/50">
          {spots.length === 0 ? (
            <div className="p-4">
              <h3 className="text-lg font-bold mb-2">钓点列表</h3>
              <p className="text-gray-500">还没有添加任何钓点。</p>
            </div>
          ) : (
            <ul className="overflow-y-auto">
              {spots.map((spot) => (
                <li
                  key={spot.id}
                  className="p-4 hover:bg-gray-100 cursor-pointer border-b relative"
                  onClick={() => onSpotSelect([spot.latitude, spot.longitude])}
                >
                  <div>
                    <p className="font-semibold">鱼类: {spot.fish_type || '未知'}</p>
                    <p className="text-sm text-gray-600">鱼竿: {spot.rod || '未知'}</p>
                    <p className="text-sm text-gray-600">鱼饵: {spot.bait || '未知'}</p>
                    <p className="text-sm text-gray-600">环境: {spot.environment || '未知'}</p>
                  </div>
                  {onDeleteSpot && (
                    <button
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      onClick={e => { e.stopPropagation(); onDeleteSpot(spot.id); }}
                      title="删除钓点"
                    >
                      <X size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SpotList;