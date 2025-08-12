'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { createRoot } from 'react-dom/client';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface AiButtonControlProps {
  onClick: () => void;
}

const AiButtonControl = ({ onClick }: AiButtonControlProps) => {
  const map = useMap();

  useEffect(() => {
    const CustomControl = L.Control.extend({
      onAdd: function(map: L.Map) {
        const container = L.DomUtil.create('div', 'leaflet-control');
        container.style.zIndex = '40';

        // Prevent map interactions when clicking the button
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        const root = createRoot(container);

        root.render(
          <div className="relative">
            {/* 主按钮 */}
            <Button 
              onClick={onClick} 
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-2xl flex items-center justify-center text-lg font-bold bg-black/85 hover:bg-black border border-white/10 text-white transition-all duration-300 hover:scale-110 active:scale-95 group"
              aria-label="AI Assistant"
            >
              <Sparkles size={24} className="sm:w-6 sm:h-6 transition-transform group-hover:rotate-12" />
            </Button>
            
            {/* 浮动提示 */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black/80 backdrop-blur-md border border-white/10 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              AI 助手
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
            </div>
          </div>
        );

        return container;
      },

      onRemove: function(map: L.Map) {
        // Cleanup when the control is removed
      }
    });

    const control = new CustomControl({ position: 'bottomright' });
    map.addControl(control);

    return () => {
      map.removeControl(control);
    };
  }, [map, onClick]);

  return null;
};

export default AiButtonControl;