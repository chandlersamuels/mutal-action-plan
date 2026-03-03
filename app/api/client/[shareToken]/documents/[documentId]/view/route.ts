import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isTokenExpired } from "@/lib/share-token";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ shareToken: string; documentId: string }> }
) {
  const { shareToken, documentId } = await params;

  const tokenRecord = await prisma.mapShareToken.findUnique({
    where: { token: shareToken },
    include: { map: { select: { dealId: true } } },
  });

  if (!tokenRecord || !tokenRecord.isActive) {
    return NextResponse.json({ error: "Invalid or inactive share link." }, { status: 403 });
  }

  if (isTokenExpired(tokenRecord.expiresAt)) {
    return NextResponse.json({ error: "This share link has expired." }, { status: 403 });
  }

  const document = await prisma.dealDocument.findFirst({
    where: {
      id: documentId,
      dealId: tokenRecord.map.dealId,
      isClientVisible: true,
    },
    select: { id: true },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  await prisma.dealDocument.update({
    where: { id: documentId },
    data: { views: { increment: 1 } },
  });

  return NextResponse.json({ ok: true });
}
