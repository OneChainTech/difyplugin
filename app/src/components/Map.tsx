'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import SearchBox from './SearchBox';
import AiButtonControl from './AiButtonControl';
import FishIcon from './FishIcon';
import UserLocationIcon from './UserLocationIcon';
import { useEffect, useState } from 'react';
import UserExchangeModal from './UserExchangeModal';

// Define the props type
interface MapProps {
  center: [number, number];
  markers: {
    position: [number, number];
    popupContent: string;
  }[];
  selectedPosition: [number, number] | null;
  onAiButtonClick: () => void;
  nearbyUsers: any[];
  currentUserId: string;
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

const Map = ({ center, markers, selectedPosition, onAiButtonClick, nearbyUsers, currentUserId, refreshSpots }: MapProps) => {
  // 弹窗状态
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [exchangeTargetUser, setExchangeTargetUser] = useState<any>(null);

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
      >
        <TileLayer
          attribution='&copy; <a href="https://amap.com/">高德地图</a> contributors'
          url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
          subdomains={['1', '2', '3', '4']}
        />
        
        <SearchBox />
        <AiButtonControl onClick={onAiButtonClick} />
        <MapUpdater position={selectedPosition} />

        {/* Show user's current location */}
        {center && (
          <Marker position={center} icon={userLocationIcon}>
            <Popup>您的位置</Popup>
          </Marker>
        )}

        {markers.map((marker, idx) => (
          <Marker key={idx} position={marker.position} icon={fishIcon}>
            <Popup>{marker.popupContent}</Popup>
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
                const mySet = new Set(mySpots.map(s => `${s.latitude}_${s.longitude}_${s.fish_type}_${s.bait}_${s.rod}_${s.environment}`));
                let newCount = 0;
                for (const spot of spots) {
                  const key = `${spot.latitude}_${spot.longitude}_${spot.fish_type}_${spot.bait}_${spot.rod}_${s.environment}`;
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
              <div className="flex flex-col items-center">
                <p className="font-semibold mb-1">{user.name}</p>
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