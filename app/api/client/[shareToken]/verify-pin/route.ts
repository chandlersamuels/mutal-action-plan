import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { isTokenExpired } from "@/lib/share-token";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  const { shareToken } = await params;

  const tokenRecord = await prisma.mapShareToken.findUnique({
    where: { token: shareToken },
  });

  if (!tokenRecord || !tokenRecord.isActive || isTokenExpired(tokenRecord.expiresAt)) {
    return NextResponse.json({ error: "Invalid share link" }, { status: 403 });
  }

  if (!tokenRecord.pinCodeHash) {
    return NextResponse.json({ error: "No PIN required" }, { status: 400 });
  }

  const body = await request.json();
  const pin: string = body?.pin ?? "";

  const hash = createHash("sha256").update(pin.trim()).digest("hex");
  if (hash !== tokenRecord.pinCodeHash) {
    return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  // Cookie scoped to this specific token — httpOnly so JS can't read it.
  response.cookies.set(`map-pin-${tokenRecord.id}`, "verified", {
    httpOnly: true,
    sameSite: "lax",
    path: `/map/${shareToken}`,
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return response;
}
