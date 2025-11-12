import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ message: 'Auth temporarily disabled for build' }, { status: 503 });
}

export async function POST() {
  return NextResponse.json({ message: 'Auth temporarily disabled for build' }, { status: 503 });
}
