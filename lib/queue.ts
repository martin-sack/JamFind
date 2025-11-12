import { Queue } from "bullmq";
import { redis } from "./redis";
export const transcodeQueue = new Queue("transcode", { connection: redis });
