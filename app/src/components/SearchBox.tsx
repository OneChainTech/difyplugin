'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { GeoSearchControl } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

// 高德地图API密钥
const AMAP_KEY = '19e61e314cde0a37fc808508593fb07f';

// 高德地图地理编码提供者
const amapProvider = {
  async search({ query }: { query: string }) {
    const url = `https://restapi.amap.com/v3/geocode/geo?key=${AMAP_KEY}&address=${encodeURIComponent(query)}&city=北京`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Amap API request failed with status:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      console.log('Amap API response:', data); // 添加调试日志

      if (data.status !== '1' || data.infocode !== '10000') {
        console.warn('Amap Geocoding API Error:', data);
        return [];
      }

      if (!data.geocodes || data.geocodes.length === 0) {
        console.log('No geocodes found for query:', query);
        return [];
      }

      // 去重逻辑：基于地址名称去重
      const uniqueResults = data.geocodes.reduce((acc: any[], item: any) => {
        const existing = acc.find(result => result.formatted_address === item.formatted_address);
        if (!existing) {
          acc.push(item);
        }
        return acc;
      }, []);

      const results = uniqueResults.map((item: any) => ({
        x: parseFloat(item.location.split(',')[0]), // Longitude
        y: parseFloat(item.location.split(',')[1]), // Latitude
        label: item.formatted_address,
        bounds: null,
        raw: item,
      }));

      console.log('Search results:', results); // 添加调试日志
      return results;
    } catch (error) {
      console.error('Failed to fetch from Amap API', error);
      return [];
    }
  },
};

const SearchBox = () => {
  const map = useMap();

  useEffect(() => {
    const searchControl = new (GeoSearchControl as any)({
      provider: amapProvider,
      style: 'bar',
      showMarker: true,
      showPopup: true, // 恢复弹窗显示
      autoClose: false, // 不自动关闭，让用户手动关闭
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true, // 保留搜索结果
      searchLabel: '搜索地址...', // 去掉放大镜图标
      notFoundMessage: '未找到相关地址',
      messageHideDelay: 3000,
      marker: {
        icon: L.divIcon({
          html: `
            <div style="
              background: linear-gradient(135deg, #3B82F6, #1D4ED8);
              width: 32px; 
              height: 32px; 
              border-radius: 50%; 
              border: 3px solid white; 
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 16px;
              font-weight: bold;
              animation: pulse 2s infinite;
            ">
              📍
            </div>
          `,
          className: 'custom-search-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        }),
      },
      popupFormat: ({ query, result }: any) => `
        <div style="
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          color: #374151;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.1);
          min-width: 250px;
          max-width: 350px;
          word-wrap: break-word;
          white-space: normal;
          line-height: 1.5;
        ">
          <div style="
            font-weight: 600; 
            margin-bottom: 12px; 
            color: #1F2937; 
            font-size: 16px; 
            line-height: 1.4;
            word-break: break-all;
            overflow-wrap: break-word;
          ">
            📍 ${result.label}
          </div>
          <div style="
            font-size: 12px; 
            color: #6B7280; 
            line-height: 1.3;
            border-top: 1px solid #E5E7EB;
            padding-top: 8px;
          ">
            点击关闭弹窗
          </div>
        </div>
      `,
      onSearch: (result: any) => {
        console.log('Search result selected:', result);
        // 确保地图飞转到搜索结果位置
        if (result && result.x && result.y) {
          map.flyTo([result.y, result.x], 15);
        }
      },
    } as any);

    map.addControl(searchControl);

    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
};

export default SearchBox;