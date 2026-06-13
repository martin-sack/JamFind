import { S3Client } from "@aws-sdk/client-s3";

// Only create S3 client if AWS is configured — prevents crash on startup
export const s3 = process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID
  ? new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null;
