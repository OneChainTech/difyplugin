'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import SearchBox from './SearchBox';
import AiButtonControl from './AiButtonControl';
import FishIcon from './FishIcon';
import UserLocationIcon from './UserLocationIcon';
import { useEffect, useState } from 'react';
import UserExchangeModal from './UserExchangeModal';
import { Plus, Minus, Navigation } from 'lucide-react';

// Define the props type
interface MapProps {
  center: [number, number];
  markers: {
    position: [number, number];
    popupContent: string;
  }[];
  selectedPosition: [number, number] | null;
  onAiButtonClick: () => void;
  nearbyUsers: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    is_sharing?: boolean;
  }>;
  currentUserId?: string;
  refreshSpots: () => void;
}

// Create custom icons
const fishIcon = L.divIcon({
  html: ReactDOMServer.renderToString(<FishIcon />),
  className: 'bg-transparent',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const userLocationIcon = L.divIcon({
  html: ReactDOMServer.renderToString(<UserLocationIcon />),
  className: 'bg-transparent',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Component to fly to the selected position
const MapUpdater = ({ position }: { position: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15);
    }
  }, [position, map]);
  return null;
};

// 自定义缩放控件
const CustomZoomControl = () => {
  const map = useMap();

  const zoomIn = () => {
    map.zoomIn();
  };

  const zoomOut = () => {
    map.zoomOut();
  };

  const goToUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.flyTo([latitude, longitude], 15);
        },
        (error) => {
          console.error('Failed to get user location:', error);
        }
      );
    }
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
      {/* 缩放控件 */}
      <div className="mobile-card p-2">
        <div className="flex flex-col space-y-1">
          <button
            onClick={zoomIn}
            className="w-10 h-10 bg-black/80 text-white hover:bg-black rounded-xl shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 border border-white/10"
            title="放大"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={zoomOut}
            className="w-10 h-10 bg-black/80 text-white hover:bg-black rounded-xl shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 border border-white/10"
            title="缩小"
          >
            <Minus size={20} />
          </button>
        </div>
      </div>
      
      {/* 定位按钮 */}
      <div className="mobile-card p-2">
        <button
          onClick={goToUserLocation}
          className="w-10 h-10 bg-black/80 text-white hover:bg-black rounded-xl shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 border border-white/10"
          title="定位到我的位置"
        >
          <Navigation size={20} />
        </button>
      </div>
    </div>
  );
};

const Map = ({ center, markers, selectedPosition, onAiButtonClick, nearbyUsers, currentUserId, refreshSpots }: MapProps) => {
  // 弹窗状态
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [exchangeTargetUser, setExchangeTargetUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 申请交换钓点
  const handleExchangeRequest = async (targetUserId: string, message: string) => {
    if (!currentUserId) {
      alert('请先登录');
      return;
    }
    const res = await fetch('/api/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromUserId: currentUserId,
        toUserId: targetUserId,
        message
      }),
    });
    if (!res.ok) {
      alert('申请失败');
    }
  };

  return (
    <>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false} // Disable the default zoom control
        style={{ height: '100vh', width: '100%' }}
        className="mobile-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://amap.com/">高德地图</a> contributors'
          url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
          subdomains={['1', '2', '3', '4']}
        />
        
        {/* 搜索框置于更低z-index，避免与左上角列表重叠 */}
        <SearchBox />
        {/* AI 按钮右下角，放在浮层最上层，避免遮挡 */}
        <AiButtonControl onClick={onAiButtonClick} />
        {/* 自定义缩放/定位控件靠右上，玻璃风样式在CSS中 */}
        <CustomZoomControl />
        <MapUpdater position={selectedPosition} />

        {/* Show user's current location */}
        {center && (
          <Marker position={center} icon={userLocationIcon}>
            <Popup>
              <div className="p-2 text-center">
                <p className="font-semibold text-gray-800">您的位置</p>
                <p className="text-xs text-gray-500 mt-1">当前位置</p>
              </div>
            </Popup>
          </Marker>
        )}

        {markers.map((marker, idx) => (
          <Marker key={idx} position={marker.position} icon={fishIcon}>
            <Popup>
              <div className="p-3 max-w-xs">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">🐟</span>
                  </div>
                  <h3 className="font-semibold text-gray-800">钓点信息</h3>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  {marker.popupContent.split(' | ').map((info, index) => (
                    <p key={index} className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span>{info}</span>
                    </p>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* 显示附近用户 */}
        {nearbyUsers && nearbyUsers.map((user) => (
          <Marker
            key={`user-${user.id}`}
            position={[user.latitude, user.longitude]}
            icon={L.divIcon({
              html: ReactDOMServer.renderToString(<UserLocationIcon isNearby={true} isSharing={!!user.is_sharing} />),
              className: 'bg-transparent',
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            })}
            eventHandlers={{
              click: async () => {
                if (!user.is_sharing) return;
                if (!currentUserId) {
                  alert('请先登录');
                  return;
                }
                if (user.id === currentUserId) {
                  alert('不能拉取自己的钓点');
                  return;
                }
                // 拉取对方钓点
                const res = await fetch(`/api/spots?userId=${user.id}`);
                if (!res.ok) {
                  alert('拉取钓点失败');
                  return;
                }
                const spots = await res.json();
                // 获取自己已有钓点
                const myRes = await fetch(`/api/spots?userId=${currentUserId}`);
                const mySpots = myRes.ok ? await myRes.json() : [];
                // 以lat+lng+fish_type+bait+rod+env为唯一性
                const mySet = new Set(mySpots.map((s: any) => `${s.latitude}_${s.longitude}_${s.fish_type}_${s.bait}_${s.rod}_${s.environment}`));
                let newCount = 0;
                for (const spot of spots) {
                  const key = `${spot.latitude}_${spot.longitude}_${spot.fish_type}_${spot.bait}_${spot.rod}_${spot.environment}`;
                  if (!mySet.has(key)) {
                    await fetch('/api/spots', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId: currentUserId,
                        latitude: spot.latitude,
                        longitude: spot.longitude,
                        fish_type: spot.fish_type,
                        bait: spot.bait,
                        environment: spot.environment,
                        rod: spot.rod
                      })
                    });
                    newCount++;
                  }
                }
                if (newCount > 0) {
                  refreshSpots();
                }
              }
            }}
          >
            <Popup>
              <div className="p-3 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">👤</span>
                  </div>
                  <h3 className="font-semibold text-gray-800">{user.name}</h3>
                </div>
                <p className="text-xs text-gray-500">
                  {user.is_sharing ? '点击获取钓点' : '未开启共享'}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {/* 交换钓点弹窗 */}
      {exchangeTargetUser && (
        <UserExchangeModal
          isOpen={exchangeModalOpen}
          onClose={() => setExchangeModalOpen(false)}
          targetUser={exchangeTargetUser}
          onSendRequest={async (message: string) => {
            await handleExchangeRequest(exchangeTargetUser.id, message);
          }}
        />
      )}
    </>
  );
};

export default Map;