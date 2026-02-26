import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isTokenExpired } from "@/lib/share-token";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  const { shareToken } = await params;

  const tokenRecord = await prisma.mapShareToken.findUnique({
    where: { token: shareToken },
    include: { map: true },
  });

  if (!tokenRecord || !tokenRecord.isActive) {
    return NextResponse.json({ error: "Invalid or inactive share link." }, { status: 403 });
  }

  if (isTokenExpired(tokenRecord.expiresAt)) {
    return NextResponse.json({ error: "This share link has expired." }, { status: 403 });
  }

  // Increment view count
  await prisma.mapShareToken.update({
    where: { id: tokenRecord.id },
    data: {
      totalViews: { increment: 1 },
      lastAccessedAt: new Date(),
    },
  });

  // Fetch MAP — only client-visible tasks, no internalNotes or forecast fields
  const map = await prisma.map.findUnique({
    where: { id: tokenRecord.mapId },
    include: {
      deal: {
        select: {
          name: true,
          client: { select: { companyName: true } },
        },
      },
      phases: {
        orderBy: { displayOrder: "asc" },
        include: {
          tasks: {
            where: { isClientVisible: true },
            orderBy: { displayOrder: "asc" },
            select: {
              id: true,
              phaseId: true,
              mapId: true,
              title: true,
              description: true,
              owner: true,
              providerContact: true,
              estimatedDays: true,
              targetDate: true,
              completedDate: true,
              originalTargetDate: true,
              status: true,
              dependsOn: true,
              successCriteria: true,
              isClientVisible: true,
              isTbdWithClient: true,
              displayOrder: true,
              createdAt: true,
              updatedAt: true,
              // Deliberately excluded: internalNotes, isForecastMilestone, forecastProbability
            },
          },
        },
      },
    },
  });

  if (!map) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({
    map,
    permissions: {
      allowClientEdits: tokenRecord.allowClientEdits,
      allowClientNotes: tokenRecord.allowClientNotes,
    },
  });
}
