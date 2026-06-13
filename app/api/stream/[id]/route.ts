import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const trackId = params.id;

  // Look up the track to find its streaming source
  try {
    const track = await prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    // If track has a direct stream URL, return it
    if (track.streamUrl) {
      return NextResponse.json({ streamUrl: track.streamUrl });
    }

    // If track has a Spotify preview URL (30s clip), use it
    if (track.previewUrl) {
      return NextResponse.json({ streamUrl: track.previewUrl });
    }

    // If track has an external ID on a platform, resolve via platform proxy
    if (track.externalId && track.platform) {
      if (track.platform === "audius") {
        const r = await fetch(`https://api.audius.co/v1/tracks/${track.externalId}/stream`, { redirect: "manual" });
        const location = r.headers.get("location");
        if (location) return NextResponse.json({ streamUrl: location });
      }

      if (track.platform === "jamendo" && process.env.JAMENDO_CLIENT_ID) {
        const r = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${process.env.JAMENDO_CLIENT_ID}&format=json&id=${track.externalId}`);
        if (r.ok) {
          const j = await r.json();
          const audio = j.results?.[0]?.audio;
          if (audio) return NextResponse.json({ streamUrl: audio });
        }
      }
    }

    // Try S3 if configured
    if (process.env.AWS_REGION && process.env.AWS_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID) {
      try {
        const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
        const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
        const s3 = new S3Client({ region: process.env.AWS_REGION });
        const command = new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `tracks/${trackId}/index.m3u8`,
        });
        const url = await getSignedUrl(s3, command, { expiresIn: 120 });
        return NextResponse.json({ streamUrl: url });
      } catch (e) {
        // S3 not available, fall through
      }
    }

    return NextResponse.json({ error: "No stream available for this track" }, { status: 404 });
  } catch (err: any) {
    console.error("[stream] error:", err);
    return NextResponse.json({ error: "Stream error" }, { status: 500 });
  }
}
