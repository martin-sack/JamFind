import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!process.env.AWS_REGION || !process.env.AWS_BUCKET_NAME) {
    return NextResponse.json({ error: "S3 not configured" }, { status: 503 });
  }

  const { trackId, filename, contentType } = await req.json();
  if (!trackId || !filename || !contentType) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

  const s3 = new S3Client({ region: process.env.AWS_REGION });
  const Key = `uploads/${trackId}/${filename}`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 300 });
  return NextResponse.json({ url, key: Key });
}
