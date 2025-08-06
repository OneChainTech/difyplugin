'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { GeoSearchControl } from 'leaflet-geosearch';
import type { GeoSearchControlOptions, SearchResult } from 'leaflet-geosearch';
import L from 'leaflet';
import 'leaflet-geosearch/dist/geosearch.css';

// IMPORTANT: Replace with your own Amap Web Service API Key
const AMAP_KEY = '19e61e314cde0a37fc808508593fb07f';

// Custom provider for Amap Geocoding
const amapProvider = {
  async search({ query }: { query: string }): Promise<SearchResult[]> {
    const url = `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(query)}&key=${AMAP_KEY}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Amap API request failed with status:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();

      if (data.status !== '1' || data.infocode !== '10000') {
        console.warn('Amap Geocoding API Error:', data);
        // 静默处理错误，不抛出异常，返回空数组
        return [];
      }

      return data.geocodes.map((item: any) => ({
        x: parseFloat(item.location.split(',')[0]), // Longitude
        y: parseFloat(item.location.split(',')[1]), // Latitude
        label: item.formatted_address,
        bounds: null, // Amap doesn't provide bounds in the same way
        raw: item,
      }));
    } catch (error) {
      console.error('Failed to fetch from Amap API', error);
      // Return an empty array or handle the error as needed
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
      showPopup: true,
      autoClose: false,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: '输入地址搜索...',
      marker: {
        icon: L.divIcon({
          html: '<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          className: 'custom-search-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      },
    } as GeoSearchControlOptions);

    map.addControl(searchControl);

    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
};

export default SearchBox;