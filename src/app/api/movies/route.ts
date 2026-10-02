import { NextResponse } from 'next/server';
import { getDbMovies } from '@/lib/serverDb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:3001';
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();

  // 1. Try to fetch from NestJS Backend if available
  try {
    const res = await fetch(`${backendUrl}/api/movies${queryString ? `?${queryString}` : ''}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(1200), // Fast 1.2s timeout
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Backend process is not running or unreachable
  }

  // 2. Direct PostgreSQL fallback (100% real database data)
  try {
    const movies = await getDbMovies();
    return NextResponse.json({
      items: movies,
      total: movies.length,
      page: 1,
      limit: 100,
    });
  } catch (error) {
    console.error('Error fetching movies from database:', error);
    return NextResponse.json(
      { message: 'Database connection failed', error: String(error) },
      { status: 500 }
    );
  }
}
