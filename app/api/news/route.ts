import { NextResponse } from "next/server";
import { getNewsPage } from "lib/news";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "6");
  const data = await getNewsPage(page, limit);
  return NextResponse.json(data);
}
