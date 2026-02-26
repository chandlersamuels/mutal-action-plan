import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MapEditor } from "@/components/admin/map-editor";

export default async function MapEditorPage({
  params,
}: {
  params: Promise<{ dealId: string }>;
}) {
  const session = await getAdminSession();
  const { dealId } = await params;

  const deal = await prisma.deal.findFirst({
    where: { id: dealId, organizationId: session!.organizationId },
    select: { id: true, name: true },
  });
  if (!deal) notFound();

  let map = await prisma.map.findUnique({
    where: { dealId },
    include: {
      phases: {
        orderBy: { displayOrder: "asc" },
        include: {
          tasks: {
            orderBy: { displayOrder: "asc" },
            include: { clientContact: true },
          },
        },
      },
      shareTokens: { where: { isActive: true } },
    },
  });

  if (!map) {
    map = await prisma.map.create({
      data: {
        dealId,
        title: `${deal.name} — Action Plan`,
        createdById: session!.userId,
      },
      include: {
        phases: {
          orderBy: { displayOrder: "asc" },
          include: {
            tasks: {
              orderBy: { displayOrder: "asc" },
              include: { clientContact: true },
            },
          },
        },
        shareTokens: { where: { isActive: true } },
      },
    });
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Breadcrumb header */}
      <div className="flex items-center gap-3 px-6 py-3 bg-background/75 backdrop-blur-[12px] border-b border-border">
        <Link
          href={`/deals/${dealId}`}
          className="inline-flex items-center gap-1.5 text-sm transition-colors text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {deal.name}
        </Link>
        <span className="text-muted-foreground">·</span>
        <span className="text-sm font-medium text-foreground">
          MAP Editor
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        <MapEditor dealId={dealId} initialMap={map} />
      </div>
    </div>
  );
}
