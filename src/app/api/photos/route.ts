import { getPhotosCached } from '@/photo/cache';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '100', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  // Fetch photos with location data (hidden='exclude' is default in getPhotosCached)
  const photos = await getPhotosCached({ limit, offset, hidden: 'exclude' });

  return NextResponse.json({ photos });
}