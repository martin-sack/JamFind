import crypto from "crypto";

const ACR_HOST = process.env.ACR_HOST || "identify-eu-west-1.acrcloud.com";
const ACR_ACCESS_KEY = process.env.ACR_ACCESS_KEY || "";
const ACR_SECRET_KEY = process.env.ACR_SECRET_KEY || "";

export interface ACRResult {
  found: boolean;
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  error?: string;
}

export function generateSignature(
  accessKey: string,
  secretKey: string,
  timestamp: number
): string {
  const stringToSign = [
    "POST",
    "/v1/identify",
    accessKey,
    "audio",
    "1",
    timestamp.toString(),
  ].join("\n");

  const hmac = crypto.createHmac("sha1", secretKey);
  hmac.update(stringToSign);
  return hmac.digest("base64");
}

export async function identifyAudio(audioBase64: string): Promise<ACRResult> {
  if (!ACR_ACCESS_KEY || !ACR_SECRET_KEY) {
    return { found: false, error: "ACRCloud credentials not configured" };
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature(ACR_ACCESS_KEY, ACR_SECRET_KEY, timestamp);
    const audioBuffer = Buffer.from(audioBase64, "base64");

    const form = new FormData();
    form.append("access_key", ACR_ACCESS_KEY);
    form.append("sample", new Blob([audioBuffer]), "audio.mp3");
    form.append("sample_bytes", audioBuffer.length.toString());
    form.append("data_type", "audio");
    form.append("signature_version", "1");
    form.append("signature", signature);
    form.append("timestamp", timestamp.toString());

    const response = await fetch("https://" + ACR_HOST + "/v1/identify", {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      return { found: false, error: "ACRCloud HTTP " + response.status };
    }

    const data = await response.json();

    if (data?.status?.code === 0 && data?.metadata?.music?.length > 0) {
      const music = data.metadata.music[0];
      return {
        found: true,
        title: music.title,
        artist: music.artists?.[0]?.name ?? "Unknown Artist",
        album: music.album?.name,
        genre: music.genres?.[0]?.name,
      };
    }

    if (data?.status?.code === 1001) {
      return { found: false };
    }

    return { found: false, error: data?.status?.msg || "Unknown ACRCloud error" };
  } catch (err: any) {
    console.error("[ACRCloud] identify error:", err);
    return { found: false, error: err?.message || "Identification failed" };
  }
}
