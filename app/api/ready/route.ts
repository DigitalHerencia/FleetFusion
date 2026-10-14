import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ready',
    checks: { database: 'pending', cache: 'pending', auth: 'pending' },
  });
}
