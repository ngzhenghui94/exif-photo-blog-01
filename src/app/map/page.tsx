import { getPhotosCached } from '@/photo/cache';
import Map from '@/components/Map';
import SiteGrid from '@/components/SiteGrid';
import { Metadata } from 'next';
import { GEO_PRIVACY_ENABLED } from '@/site/config';

export const metadata: Metadata = {
  title: 'Map',
  description: 'Explore photos on a map',
};

export const dynamic = 'force-dynamic';

export default async function MapPage() {
  if (GEO_PRIVACY_ENABLED) {
    return (
      <SiteGrid
        contentMain={
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Map</h1>
            <p>Location data is currently disabled.</p>
          </div>
        }
      />
    );
  }

  // Fetch a large number of photos to populate the map
  const photos = await getPhotosCached({ limit: 1000, hidden: 'exclude' });

  return (
    <SiteGrid
      contentMain={
        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Photo Map</h1>
            <p className="max-w-xl text-gray-500 dark:text-gray-400">
              Explore the collection by location.
            </p>
          </div>
          <Map photos={photos} />
        </div>
      }
    />
  );
}