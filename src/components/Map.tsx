'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Photo } from '@/photo';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTheme } from 'next-themes';
import L from 'leaflet';
import Image from 'next/image';
import Link from 'next/link';
import { pathForPhoto } from '@/site/paths';

// Standard marker icon
const icon = L.divIcon({
  className: 'map-marker',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-red-500 drop-shadow-md">
    <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
  </svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Cluster marker icon generator
const createClusterIcon = (count: number) => L.divIcon({
  className: 'map-marker-cluster',
  html: `<div class="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-full font-bold shadow-md border-2 border-white dark:border-gray-900 text-xs">
    ${count > 99 ? '99+' : count}
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface MapProps {
  photos: Photo[];
}

interface Cluster {
  id: string;
  latitude: number;
  longitude: number;
  photos: Photo[];
  isCluster: true;
}

type MapItem = Photo | Cluster;

function MapContent({ photos, theme }: { photos: Photo[], theme: string | undefined }) {
  const map = useMap();
  const [clusters, setClusters] = useState<MapItem[]>([]);
  const [bounds, setBounds] = useState(map.getBounds());
  const [zoom, setZoom] = useState(map.getZoom());

  // Update map style when theme changes
  useEffect(() => {
    map.invalidateSize();
  }, [map, theme]);

  // Clustering logic
  const updateClusters = useCallback(() => {
    const currentZoom = map.getZoom();
    const currentBounds = map.getBounds();

    // Only process visible photos
    const visiblePhotos = photos.filter(p =>
      p.latitude !== undefined && p.latitude !== null &&
      p.longitude !== undefined && p.longitude !== null &&
      currentBounds.contains([p.latitude!, p.longitude!])
    );

    // Naive clustering: group by distance in pixels
    const threshold = 60; // pixels
    const newClusters: MapItem[] = [];
    const processed = new Set<string>();

    for (const photo of visiblePhotos) {
      if (processed.has(photo.id)) continue;

      const point = map.project([photo.latitude!, photo.longitude!], currentZoom);
      const clusterPhotos: Photo[] = [photo];
      processed.add(photo.id);

      for (const other of visiblePhotos) {
        if (processed.has(other.id)) continue;

        const otherPoint = map.project([other.latitude!, other.longitude!], currentZoom);
        const dist = point.distanceTo(otherPoint);

        if (dist < threshold) {
          clusterPhotos.push(other);
          processed.add(other.id);
        }
      }

      if (clusterPhotos.length > 1) {
        newClusters.push({
          id: `cluster-${photo.id}`,
          latitude: photo.latitude!,
          longitude: photo.longitude!,
          photos: clusterPhotos,
          isCluster: true,
        });
      } else {
        newClusters.push(photo);
      }
    }

    setClusters(newClusters);
  }, [map, photos]);

  // Re-cluster on move/zoom
  useMapEvents({
    moveend: () => {
      setBounds(map.getBounds());
      setZoom(map.getZoom());
      updateClusters();
    },
    zoomend: () => {
      setBounds(map.getBounds());
      setZoom(map.getZoom());
      updateClusters();
    },
  });

  // Initial calculation
  useEffect(() => {
    updateClusters();
  }, [updateClusters]);

  return (
    <>
      {clusters.map((item) => {
        if ('isCluster' in item) {
          return (
            <Marker
              key={item.id}
              position={[item.latitude, item.longitude]}
              icon={createClusterIcon(item.photos.length)}
              eventHandlers={{
                click: () => {
                  map.setView([item.latitude, item.longitude], map.getZoom() + 2);
                }
              }}
            />
          );
        } else {
          const photo = item as Photo;
          return (
            <Marker
              key={photo.id}
              position={[photo.latitude!, photo.longitude!]}
              icon={icon}
            >
              <Popup className="min-w-[200px] photo-popup">
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
                  <div className="flex flex-col gap-1">
                    <Link href={pathForPhoto({ photo })} className="font-medium hover:underline text-sm truncate">
                      {photo.title || 'Untitled'}
                    </Link>
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="opacity-75">📅</span>
                        <span>{photo.takenAtNaiveFormatted}</span>
                      </div>
                      {(photo.focalLengthFormatted || photo.fNumberFormatted) && (
                        <div className="flex items-center gap-1">
                          <span className="opacity-75">📷</span>
                          <span>
                            {[
                              photo.make,
                              photo.model,
                              photo.focalLengthFormatted,
                              photo.fNumberFormatted,
                              photo.isoFormatted,
                            ].filter(Boolean).join(' ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        }
      })}
    </>
  );
}

export default function Map({ photos: initialPhotos }: MapProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Fetch more photos in background
    const fetchMore = async () => {
      setIsLoadingMore(true);
      let offset = initialPhotos.length;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        try {
          const response = await fetch(`/api/photos?limit=${limit}&offset=${offset}`);
          if (!response.ok) break;
          const data = await response.json();
          if (data.photos.length > 0) {
            setPhotos(prev => {
              // De-duplicate (just in case)
              const existingIds = new Set(prev.map(p => p.id));
              const newPhotos = data.photos.filter((p: Photo) => !existingIds.has(p.id));
              return [...prev, ...newPhotos];
            });
            offset += limit;
          } else {
            hasMore = false;
          }
          // Small delay to be nice to server
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (e) {
          console.error('Error fetching photos', e);
          hasMore = false;
        }
      }
      setIsLoadingMore(false);
    };

    if (initialPhotos.length > 0) {
      fetchMore();
    }
  }, [initialPhotos]);

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  const tileLayerUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  // Calculate bounds from all known photos to center map initially
  const validPhotos = photos.filter(p => p.latitude !== undefined && p.latitude !== null && p.longitude !== undefined && p.longitude !== null);

  if (validPhotos.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh] border border-gray-200 dark:border-gray-800 rounded-lg">
        <p className="text-gray-500">No photos with location data found.</p>
      </div>
    );
  }

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
        <MapContent photos={photos} theme={theme} />
      </MapContainer>
      {isLoadingMore && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-white dark:bg-black px-3 py-1 rounded-full text-xs shadow-md border border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Loading more photos...
        </div>
      )}
    </div>
  );
}