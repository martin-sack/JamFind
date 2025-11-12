import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const dynamic = 'force-dynamic';

const s3 = new S3Client({ region: process.env.AWS_REGION });

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { trackId, filename, contentType } = await req.json();
  if (!trackId || !filename || !contentType) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }
  const Key = `uploads/${trackId}/${filename}`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 300 });
  return NextResponse.json({ url, key: Key });
}
