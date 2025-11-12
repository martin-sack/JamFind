import { NextRequest, NextResponse } from "next/server";
import { getRecommendations } from "lib/recommend";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const recs = await getRecommendations(session.user.id);
    return NextResponse.json({ recs });
  } catch (error) {
    console.error("[Recommendation API] Error:", error);
    return NextResponse.json({ error: "Failed to get recommendations" }, { status: 500 });
  }
}
