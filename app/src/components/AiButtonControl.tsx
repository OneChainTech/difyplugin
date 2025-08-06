'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { createRoot } from 'react-dom/client';
import { Button } from '@/components/ui/button';

interface AiButtonControlProps {
  onClick: () => void;
}

const AiButtonControl = ({ onClick }: AiButtonControlProps) => {
  const map = useMap();

  useEffect(() => {
    const CustomControl = L.Control.extend({
      onAdd: function(map: L.Map) {
        const container = L.DomUtil.create('div', 'leaflet-control');
        container.style.zIndex = '40'; // Ensure the button itself is on a high layer

        // Prevent map interactions when clicking the button
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        const root = createRoot(container);

        // The click is now handled by React's onClick, which is more reliable.
        // The button content is changed back to "AI".
        root.render(
            <Button 
              onClick={onClick} 
              className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 transition-all duration-200 hover:scale-105"
              aria-label="AI Assistant"
            >
              AI
            </Button>
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