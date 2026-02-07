'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Photo } from '@/photo';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import L from 'leaflet';
import Image from 'next/image';
import Link from 'next/link';
import { pathForPhoto } from '@/site/paths';

// Fix for default marker icons in Next.js
// See: https://github.com/PaulLeCam/react-leaflet/issues/453
const icon = L.icon({
  iconUrl: '/favicons/light.png', // Using the site favicon as a simple marker for now, or fallback to default if I can fix it
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Better fix for default icons:
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  photos: Photo[];
}

function MapController({ theme }: { theme: string | undefined }) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size to ensure map renders correctly if container resizes
    map.invalidateSize();
  }, [map]);

  return null;
}

export default function Map({ photos }: MapProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  // CartoDB Positron (Light) and Dark Matter (Dark)
  const tileLayerUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  // Filter photos with valid GPS
  const validPhotos = photos.filter(p => p.latitude !== undefined && p.longitude !== undefined);

  if (validPhotos.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh] border border-gray-200 dark:border-gray-800 rounded-lg">
        <p className="text-gray-500">No photos with location data found.</p>
      </div>
    );
  }

  // Calculate bounds
  const bounds = L.latLngBounds(validPhotos.map(p => [p.latitude!, p.longitude!]));

  return (
    <div className="h-[calc(100vh-12rem)] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 relative z-0">
      <MapContainer
        center={[0, 0]}
        zoom={2}
        scrollWheelZoom={true}
        className="h-full w-full"
        bounds={bounds}
        boundsOptions={{ padding: [50, 50] }}
      >
        <TileLayer
          attribution={attribution}
          url={tileLayerUrl}
        />
        <MapController theme={theme} />
        {validPhotos.map((photo) => (
          <Marker
            key={photo.id}
            position={[photo.latitude!, photo.longitude!]}
          >
            <Popup className="min-w-[200px]">
              <div className="flex flex-col gap-2">
                <Link href={pathForPhoto({ photo })} className="block w-[200px] aspect-[1.5] relative bg-gray-100 dark:bg-gray-800 rounded-sm overflow-hidden">
                  <Image
                    src={photo.url}
                    alt={photo.title || 'Photo'}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                </Link>
                <div className="flex flex-col">
                  <Link href={pathForPhoto({ photo })} className="font-medium hover:underline text-sm">
                    {photo.title || 'Untitled'}
                  </Link>
                  <span className="text-xs text-gray-500">
                    {photo.takenAtNaiveFormatted}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}