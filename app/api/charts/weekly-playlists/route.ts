import { NextResponse } from "next/server";
import { getWeeklyTopPlaylists } from "lib/chartsPlaylists";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getWeeklyTopPlaylists(100);
  return NextResponse.json({ data });
}
