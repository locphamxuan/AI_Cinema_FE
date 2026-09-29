import { NextResponse } from 'next/server';
import { getDbGenres } from '@/lib/serverDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:3001';

  try {
    const res = await fetch(`${backendUrl}/api/genres`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(1200),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline
  }

  try {
    const genres = await getDbGenres();
    return NextResponse.json({ data: genres });
  } catch (error) {
    console.error('Error fetching genres from database:', error);
    return NextResponse.json({ data: [] });
  }
}
