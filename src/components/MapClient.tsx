'use client';

import dynamic from 'next/dynamic';
import { Photo } from '@/photo';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function MapClient({ photos }: { photos: Photo[] }) {
    return <Map photos={photos} />;
}
