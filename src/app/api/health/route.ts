import { NextResponse } from 'next/server';
import { isServerSupabaseConfigured } from '@/lib/supabase/server';

export async function GET() {
  const startTime = Date.now();

  return NextResponse.json({
    status: 'ok',
    service: 'Blue Bells Mobile Shop API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      provider: 'Supabase PostgreSQL',
      configured: isServerSupabaseConfigured,
      mode: isServerSupabaseConfigured ? 'cloud' : 'in-memory-fallback',
      latencyMs: Date.now() - startTime,
    },
  });
}
