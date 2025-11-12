import { NextRequest, NextResponse } from "next/server";
import { s3 } from "../../../../lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { rl } from "../../../../lib/ratelimit";

export const dynamic = 'force-dynamic';

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const headers = rl.checkNext(req, 10);
  if (headers.get("X-RateLimit-Remaining") === "0") {
    return NextResponse.json({ error: "Rate limit" }, { status: 429, headers });
  }
  
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: `tracks/${params.id}/index.m3u8`,
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 120 });
  return NextResponse.json({ streamUrl: url }, { headers });
}
