import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Issue, IssueCategory } from '../../types';

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  issues?: Issue[];
  selectedIssueId?: string;
  onSelectIssue?: (issue: Issue) => void;
  allowPinPlacement?: boolean;
  pinLocation?: { lat: number; lng: number };
  onPinPlaced?: (coords: { lat: number; lng: number }) => void;
  userLocation?: { lat: number; lng: number };
  showRadiusCircle?: { lat: number; lng: number; radiusMeters: number; color?: string };
  showHeatmapHotspots?: boolean;
  className?: string;
  height?: string;
}

// Category color mappings
const CATEGORY_COLORS: Record<IssueCategory, { bg: string; border: string }> = {
  'road damage': { bg: '#ef4444', border: '#b91c1c' },
  streetlight: { bg: '#eab308', border: '#a16207' },
  drainage: { bg: '#06b6d4', border: '#0e7490' },
  garbage: { bg: '#10b981', border: '#047857' },
  other: { bg: '#8b5cf6', border: '#6d28d9' },
};

function createCustomPin(category: IssueCategory, isHighPriority: boolean, isResolved: boolean): L.DivIcon {
  const color = isResolved ? { bg: '#10b981', border: '#059669' } : (CATEGORY_COLORS[category] || CATEGORY_COLORS.other);

  const pulseRing = isHighPriority && !isResolved
    ? `<span class="absolute -inset-2 rounded-full bg-rose-500/40 animate-ping"></span>`
    : '';

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-full hover:scale-110 transition-transform">
      ${pulseRing}
      <div style="background-color: ${color.bg}; border-color: ${color.border};" 
           class="relative z-10 w-9 h-9 rounded-full border-2 shadow-lg flex items-center justify-center text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          ${
            category === 'road damage'
              ? '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
              : category === 'streetlight'
              ? '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>'
              : category === 'drainage'
              ? '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>'
              : category === 'garbage'
              ? '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>'
              : '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'
          }
        </svg>
      </div>
      <div style="border-top-color: ${color.bg};" class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] -mt-0.5"></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html,
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -42],
  });
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center = [12.9716, 77.5946],
  zoom = 14,
  issues = [],
  selectedIssueId,
  onSelectIssue,
  allowPinPlacement = false,
  pinLocation,
  onPinPlaced,
  userLocation,
  showRadiusCircle,
  showHeatmapHotspots = false,
  className = '',
  height = '500px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pinMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const tileUrl =
      import.meta.env.VITE_MAP_TILE_URL ||
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Handle pin placement click if enabled
    if (allowPinPlacement) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onPinPlaced) {
          onPinPlaced({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      });
    }

    // Leaflet resize trigger
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map center when prop changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (center && center[0] && center[1]) {
      mapInstanceRef.current.panTo(center, { animate: true, duration: 0.8 });
    }
  }, [center[0], center[1]]);

  // Sync markers & layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // 1. Render User Current Location (Blue glowing circle)
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div class="relative flex items-center justify-center w-6 h-6">
            <span class="absolute inline-flex w-full h-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
            <span class="relative inline-flex w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-md"></span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .bindTooltip('Your Current GPS Position', { permanent: false, direction: 'top' })
        .addTo(layer);
    }

    // 2. Render Radius Circle (e.g. 100m duplicate radius or 50m resolution proof boundary)
    if (showRadiusCircle) {
      L.circle([showRadiusCircle.lat, showRadiusCircle.lng], {
        radius: showRadiusCircle.radiusMeters,
        color: showRadiusCircle.color || '#3b82f6',
        fillColor: showRadiusCircle.color || '#3b82f6',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '4, 6',
      })
        .bindTooltip(`${showRadiusCircle.radiusMeters}m Verification Radius`, { sticky: true })
        .addTo(layer);
    }

    // 3. Render Heatmap Hotspots for Authority View (Cluster circles)
    if (showHeatmapHotspots) {
      issues.forEach((issue) => {
        if (issue.status !== 'resolved') {
          const intensity = issue.priority_level === 'high' ? 0.35 : 0.2;
          const radius = issue.priority_level === 'high' ? 120 : 70;
          const color = issue.priority_level === 'high' ? '#e11d48' : '#f59e0b';

          L.circle([issue.latitude, issue.longitude], {
            radius,
            color: 'transparent',
            fillColor: color,
            fillOpacity: intensity,
          }).addTo(layer);
        }
      });
    }

    // 4. Render Issue Markers
    issues.forEach((issue) => {
      const isHighPriority = issue.priority_level === 'high';
      const isResolved = issue.status === 'resolved';
      const icon = createCustomPin(issue.category, isHighPriority, isResolved);

      const marker = L.marker([issue.latitude, issue.longitude], { icon });

      // Rich interactive Popup
      const popupHtml = `
        <div style="font-family: inherit; min-width: 200px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 2px;">
            ${issue.category} &bull; ${issue.status.replace('_', ' ')}
          </div>
          <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.3;">
            ${issue.title}
          </h4>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #475569; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${issue.description}
          </p>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 600; padding-top: 6px; border-top: 1px solid #e2e8f0;">
            <span style="color: ${issue.priority_level === 'high' ? '#e11d48' : '#f59e0b'};">
              ★ Score: ${issue.priority_score}
            </span>
            <span style="color: #64748b;">
              ${issue.duplicate_count > 1 ? `👥 ${issue.duplicate_count} Citizens` : `By ${issue.reporter_alias}`}
            </span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectIssue) {
          onSelectIssue(issue);
        }
      });

      marker.addTo(layer);

      if (issue.id === selectedIssueId) {
        marker.openPopup();
      }
    });
  }, [issues, userLocation, showRadiusCircle, showHeatmapHotspots, selectedIssueId]);

  // Handle draggable pin placement for Report form
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !allowPinPlacement || !pinLocation) return;

    if (!pinMarkerRef.current) {
      const pinIcon = L.divIcon({
        className: 'report-pin-marker',
        html: `
          <div class="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-full animate-bounce">
            <div class="w-10 h-10 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-blue-600 -mt-0.5"></div>
          </div>
        `,
        iconSize: [40, 48],
        iconAnchor: [20, 48],
      });

      pinMarkerRef.current = L.marker([pinLocation.lat, pinLocation.lng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      pinMarkerRef.current.on('dragend', (e: any) => {
        const marker = e.target;
        const position = marker.getLatLng();
        if (onPinPlaced) {
          onPinPlaced({ lat: position.lat, lng: position.lng });
        }
      });
    } else {
      pinMarkerRef.current.setLatLng([pinLocation.lat, pinLocation.lng]);
    }
  }, [pinLocation, allowPinPlacement]);

  return (
    <div
      ref={mapContainerRef}
      className={`w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 z-0 ${className}`}
      style={{ height }}
    />
  );
};
