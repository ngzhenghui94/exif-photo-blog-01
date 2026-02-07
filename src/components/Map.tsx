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
const icon = L.divIcon({
  className: 'map-marker',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-red-500 drop-shadow-md">
    <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
  </svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
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
  const validPhotos = photos.filter(p =>
    p.latitude !== undefined && p.latitude !== null &&
    p.longitude !== undefined && p.longitude !== null
  );

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
            icon={icon}
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