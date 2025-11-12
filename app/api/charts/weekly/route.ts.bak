import { NextResponse } from "next/server";
import { getWeeklyTop } from "lib/charts";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getWeeklyTop(100);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Weekly charts error:', error);
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}
