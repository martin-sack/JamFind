import { NextResponse } from "next/server";
import { fetchPlaylistReal } from "lib/importers";

export async function POST(req: Request) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "No URL" }, { status: 400 });
  try {
    const data = await fetchPlaylistReal(url);
    // cap to 10 tracks in API to reduce payload size (UI enforces cap too)
    return NextResponse.json({ provider: data.provider, items: (data.items ?? []).slice(0, 10) });
  } catch (e:any) {
    return NextResponse.json({ provider: null, items: [], error: e?.message || "Import failed" }, { status: 500 });
  }
}
