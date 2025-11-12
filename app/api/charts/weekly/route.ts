import { NextResponse } from "next/server";
import { getWeeklyTop } from "lib/charts";

export const runtime = "nodejs";

export async function GET() {
  const data = await getWeeklyTop(100);
  return NextResponse.json({ data });
}
