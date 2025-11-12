import { Worker } from "bullmq";
import { redis } from "../lib/redis";
import { s3 } from "../lib/s3";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import os from "os";
import { autoTagTrack } from "../lib/aiTagger";

function streamToFile(stream: NodeJS.ReadableStream, filePath: string) {
  return new Promise<void>((resolve, reject) => {
    const out = fs.createWriteStream(filePath);
    stream.pipe(out);
    out.on("finish", () => resolve());
    out.on("error", reject);
  });
}

export const worker = new Worker("transcode", async job => {
  const { trackId, sourceKey } = job.data as { trackId: string; sourceKey: string };
  const bucket = process.env.AWS_BUCKET_NAME!;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `jamfind-${trackId}-`));
  const inputFile = path.join(tmpDir, "input");
  const master = path.join(tmpDir, "index.m3u8");
  const segmentPattern = path.join(tmpDir, "seg_%03d.ts");

  try {
    // download source to tmp
    const obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: sourceKey }));
    await streamToFile(obj.Body as any, inputFile);

    // ffmpeg → HLS
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputFile)
        .outputOptions([
          "-acodec aac",
          "-b:a 128k",
          "-hls_time 6",
          "-hls_playlist_type vod",
          `-hls_segment_filename ${segmentPattern}`,
        ])
        .output(master)
        .on("end", () => resolve())
        .on("error", reject)
        .run();
    });

    // upload HLS files
    const files = fs.readdirSync(tmpDir);
    for (const f of files) {
      const body = fs.readFileSync(path.join(tmpDir, f));
      const key = `tracks/${trackId}/${f}`;
      await s3.send(new PutObjectCommand({ 
        Bucket: bucket, 
        Key: key, 
        Body: body, 
        ContentType: f.endsWith(".m3u8") ? "application/vnd.apple.mpegurl" : "video/MP2T" 
      }));
    }

    // TODO: mark Track.status = "READY" via Prisma if desired
    console.log(`Transcoding completed for track ${trackId}`);
    
    // Auto-tag track with AI
    console.log(`Starting AI auto-tagging for track ${trackId}`);
    const tags = await autoTagTrack(trackId, sourceKey);
    console.log(`AI tagging completed for track ${trackId}:`, tags);
  } catch (error) {
    console.error(`Transcoding failed for track ${trackId}:`, error);
    throw error;
  } finally {
    // Clean up temp directory
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}, { connection: redis });
