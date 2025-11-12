import { NextResponse } from "next/server";
import { getWeeklyTopPlaylists } from "lib/chartsPlaylists";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getWeeklyTopPlaylists(100);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Weekly playlist charts error:', error);
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}
