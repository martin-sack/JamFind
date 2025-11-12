import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";
import { prisma } from "lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, isPublic = true } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ 
        error: "Playlist name is required" 
      }, { status: 400 });
    }

    // Check if user already has a playlist with this name
    const existingPlaylist = await prisma.userPlaylist.findFirst({
      where: {
        userId: session.user.id,
        title: name.trim(),
      },
    });

    if (existingPlaylist) {
      return NextResponse.json({ 
        error: "You already have a playlist with this name" 
      }, { status: 400 });
    }

    // Create the playlist
    const playlist = await prisma.userPlaylist.create({
      data: {
        userId: session.user.id,
        title: name.trim(),
        description: description?.trim() || null,
        isPublic: Boolean(isPublic),
      },
    });

    return NextResponse.json({ 
      success: true,
      playlist: {
        id: playlist.id,
        name: playlist.title,
        trackCount: 0,
        isPublic: playlist.isPublic,
        createdAt: playlist.createdAt.toISOString(),
        description: playlist.description,
      }
    });

  } catch (error) {
    console.error("Error creating playlist:", error);
    return NextResponse.json({
      error: "Internal server error"
    }, { status: 500 });
  }
}