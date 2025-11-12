import OpenAI from "openai";
import { parseFile } from "music-metadata";
import fs from "fs";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "lib/db";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function autoTagTrack(trackId: string, s3Key: string) {
  try {
    // For development/testing without actual S3 files, return mock tags
    if (!process.env.OPENAI_API_KEY || !process.env.AWS_BUCKET_NAME) {
      console.log(`[AI Tagger] Mock tagging for track ${trackId}`);
      
      // Generate mock genre and mood based on track ID for demo purposes
      const mockGenres = ["Afrobeat", "Amapiano", "Hip-Hop", "R&B", "Pop", "Dancehall"];
      const mockMoods = ["Energetic", "Chill", "Romantic", "Party", "Melancholic", "Uplifting"];
      
      const mockGenre = mockGenres[Math.floor(Math.random() * mockGenres.length)];
      const mockMood = mockMoods[Math.floor(Math.random() * mockMoods.length)];
      
      await prisma.track.update({
        where: { id: trackId },
        data: { genres: mockGenre, moods: mockMood }
      });

      return { genre: mockGenre, mood: mockMood };
    }

    // Download preview or sample from S3
    const tmp = `/tmp/${trackId}.mp3`;
    const obj = await s3.send(new GetObjectCommand({ 
      Bucket: process.env.AWS_BUCKET_NAME!, 
      Key: s3Key 
    }));
    const stream = obj.Body as NodeJS.ReadableStream;
    const file = fs.createWriteStream(tmp);
    stream.pipe(file);
    await new Promise<void>(resolve => file.on("finish", resolve));

    const meta = await parseFile(tmp);
    const duration = meta.format.duration;

    // Summarize metadata to prompt
    const description = `duration ${duration}s, format ${meta.format.codec}, bitrate ${meta.format.bitrate}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a music tagging assistant. Analyze audio metadata and predict the most likely genre and mood. Return only valid JSON with 'genre' and 'mood' fields." 
        },
        { 
          role: "user", 
          content: `Analyze this track info: ${description}. Predict likely genre and mood in JSON format: {genre, mood}.` 
        }
      ]
    });
    
    const tags = JSON.parse(completion.choices[0].message.content || "{}");

    await prisma.track.update({
      where: { id: trackId },
      data: { genres: tags.genre || "Unknown", moods: tags.mood || "Unknown" }
    });

    // Clean up temp file
    fs.unlinkSync(tmp);

    return tags;
  } catch (error) {
    console.error(`[AI Tagger] Error tagging track ${trackId}:`, error);
    
    // Fallback to default tags
    await prisma.track.update({
      where: { id: trackId },
      data: { genres: "Unknown", moods: "Unknown" }
    });
    
    return { genre: "Unknown", mood: "Unknown" };
  }
}
