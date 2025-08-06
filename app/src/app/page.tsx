'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AiAssistantModal from '@/components/AiAssistantModal';
import SpotList from '@/components/SpotList';
import { getOrCreateUser, updateUserLocation } from '@/lib/user';
import { Switch } from '@/components/ui/switch';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
});

// This type now represents the data structure from our database
export interface SpotData {
  id: number;
  latitude: number;
  longitude: number;
  fish_type: string | null;
  bait: string | null;
  environment: string | null;
  created_at: string;
}

// This type is for what the Map component actually needs to render
export type MarkerData = {
  position: [number, number];
  popupContent: string;
};

export default function Home() {
  const [spots, setSpots] = useState<SpotData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([31.2304, 121.4737]); // Default to Shanghai

  // Forcefully manage map z-index when modal opens/closes
  useEffect(() => {
    const leafletContainer = document.querySelector('.leaflet-container') as HTMLElement;
    if (leafletContainer) {
      if (isModalOpen) {
        leafletContainer.style.zIndex = '0';
      } else {
        // Reset z-index when modal is closed
        leafletContainer.style.zIndex = 'auto';
      }
    }
  }, [isModalOpen]);

  // Initialize user and fetch spots
  useEffect(() => {
    const initializeUser = async () => {
      const user = getOrCreateUser();
      setCurrentUser(user);
      
      // Get user location and update
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setMapCenter([latitude, longitude]); // Set map center to user's location
            const updatedUser = updateUserLocation(latitude, longitude);
            setCurrentUser(updatedUser);
            
            // Update user location on server
            try {
              await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: updatedUser.id,
                  name: updatedUser.name,
                  latitude,
                  longitude
                })
              });
            } catch (error) {
              console.error('Failed to update user location:', error);
            }
            
            // Fetch nearby users
            try {
              const nearbyRes = await fetch(`/api/users?userId=${updatedUser.id}&latitude=${latitude}&longitude=${longitude}`);
              if (nearbyRes.ok) {
                const nearbyData = await nearbyRes.json();
                setNearbyUsers(nearbyData);
              }
            } catch (error) {
              console.error('Failed to fetch nearby users:', error);
            }
          },
          (error) => {
            console.error('Failed to get user location:', error);
          }
        );
      }
    };
    
    initializeUser();
  }, []);

  // Fetch user's spots
  useEffect(() => {
    const fetchSpots = async () => {
      if (!currentUser) return;
      
      try {
        const res = await fetch(`/api/spots?userId=${currentUser.id}`);
        if (!res.ok) throw new Error('Failed to fetch spots');
        const data: SpotData[] = await res.json();
        setSpots(data);
      } catch (error) {
        console.error(error);
      }
    };
    
    fetchSpots();
  }, [currentUser]);

  // 监听拉取共享钓点后的刷新事件
  useEffect(() => {
    const handler = () => {
      // 直接用localStorage获取userId，避免currentUser依赖导致不刷新
      const userId = localStorage.getItem('userId') || currentUser?.id;
      if (userId) {
        fetch(`/api/spots?userId=${userId}`)
          .then(res => res.json())
          .then(data => setSpots(data));
      }
    };
    window.addEventListener('refreshSpots', handler);
    return () => window.removeEventListener('refreshSpots', handler);
  }, []);

  const handleAddSpot = (newSpot: SpotData) => {
    setSpots((prevSpots) => [newSpot, ...prevSpots]);
  };

  const handleSpotSelect = (position: [number, number]) => {
    setSelectedPosition(position);
  };

  const handleDeleteSpot = async (id: number) => {
    if (!currentUser) return;
    const res = await fetch(`/api/spots?id=${id}&userId=${currentUser.id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setSpots(spots => spots.filter(s => s.id !== id));
    } else {
      alert('删除失败');
    }
  };

  // 新增：切换共享钓点状态
  const handleToggleSharing = async () => {
    if (!currentUser) return;
    const newSharing = !currentUser.is_sharing;
    setCurrentUser({ ...currentUser, is_sharing: newSharing });
    try {
      await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, isSharing: newSharing })
      });
    } catch (e) {
      // 回滚
      setCurrentUser({ ...currentUser, is_sharing: !newSharing });
      alert('切换共享状态失败');
    }
  };

  // Transform SpotData from DB to MarkerData for the map
  const markers: MarkerData[] = spots.map(spot => ({
    position: [spot.latitude, spot.longitude],
    popupContent: `鱼类: ${spot.fish_type || '未知'} | 鱼饵: ${spot.bait || '未知'} | 环境: ${spot.environment || '未知'}`,
  }));

  // 刷新钓点列表函数
  const refreshSpots = async () => {
    const userId = currentUser?.id || localStorage.getItem('userId');
    if (userId) {
      const res = await fetch(`/api/spots?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSpots(data);
      }
    }
  };

  return (
    <main style={{ position: 'relative', height: '100vh' }}>
      {/* SpotList上方的共享钓点切换 */}
      <div className="absolute top-20 right-4 z-[1000] flex items-center space-x-2 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-gray-200/50">
        <span className="text-sm font-medium text-gray-700">共享我的钓点</span>
        <Switch checked={!!currentUser?.is_sharing} onCheckedChange={handleToggleSharing} />
        <span className={`text-xs font-semibold ${currentUser?.is_sharing ? 'text-green-600' : 'text-gray-500'}`}>{currentUser?.is_sharing ? 'ON' : 'OFF'}</span>
      </div>
      <Map 
        key={spots.length} 
        center={mapCenter}
        markers={markers} 
        selectedPosition={selectedPosition} 
        onAiButtonClick={() => setIsModalOpen(true)}
        nearbyUsers={nearbyUsers}
        currentUserId={currentUser?.id}
        refreshSpots={refreshSpots}
      />
      <SpotList spots={spots} onSpotSelect={handleSpotSelect} onDeleteSpot={handleDeleteSpot} />
      <AiAssistantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddSpot={handleAddSpot}
        userId={currentUser?.id}
      />
    </main>
  );
}