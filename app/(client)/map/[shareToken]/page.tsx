import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isTokenExpired } from "@/lib/share-token";
import { ClientMapView } from "@/components/client/client-map-view";

export default async function ClientMapPage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;

  const tokenRecord = await prisma.mapShareToken.findUnique({
    where: { token: shareToken },
  });

  if (!tokenRecord || !tokenRecord.isActive || isTokenExpired(tokenRecord.expiresAt)) {
    notFound();
  }

  // Increment view count
  await prisma.mapShareToken.update({
    where: { id: tokenRecord.id },
    data: {
      totalViews: { increment: 1 },
      lastAccessedAt: new Date(),
    },
  });

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
            },
          },
        },
      },
    },
  });

  if (!map) notFound();

  return (
    <ClientMapView
      shareToken={shareToken}
      initialMap={map as Parameters<typeof ClientMapView>[0]["initialMap"]}
      permissions={{
        allowClientEdits: tokenRecord.allowClientEdits,
        allowClientNotes: tokenRecord.allowClientNotes,
      }}
    />
  );
}
