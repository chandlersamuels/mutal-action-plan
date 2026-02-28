import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isTokenExpired } from "@/lib/share-token";
import { ClientMapView } from "@/components/client/client-map-view";
import { PinGate } from "@/components/client/pin-gate";

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

  // --- PIN gate ---
  if (tokenRecord.pinCodeHash) {
    const cookieStore = await cookies();
    const pinVerified = cookieStore.get(`map-pin-${tokenRecord.id}`)?.value === "verified";
    if (!pinVerified) {
      const mapForPin = await prisma.map.findUnique({
        where: { id: tokenRecord.mapId },
        include: {
          deal: { select: { organization: { select: { name: true } } } },
        },
      });
      const orgName = mapForPin?.deal.organization.name ?? "Your provider";
      return <PinGate shareToken={shareToken} orgName={orgName} />;
    }
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
          targetCloseDate: true,
          client: { select: { companyName: true, logoUrl: true } },
          organization: { select: { name: true, logoUrl: true } },
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
