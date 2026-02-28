import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMapSchema, updateMapSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dealId } = await params;

  const deal = await prisma.deal.findFirst({
    where: { id: dealId, organizationId: session.organizationId },
  });
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const map = await prisma.map.findUnique({
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

  if (!map) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(map);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dealId } = await params;

  const deal = await prisma.deal.findFirst({
    where: { id: dealId, organizationId: session.organizationId },
  });
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = createMapSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { templateId } = parsed.data;

  if (!templateId) {
    const map = await prisma.map.create({
      data: { dealId, title: parsed.data.title, createdById: session.userId },
    });
    return NextResponse.json(map, { status: 201 });
  }

  // Fetch template scoped to org or default
  const template = await prisma.mapTemplate.findFirst({
    where: {
      id: templateId,
      OR: [
        { organizationId: session.organizationId },
        { isDefault: true },
      ],
    },
    include: {
      phases: {
        orderBy: { displayOrder: "asc" },
        include: { tasks: { orderBy: { displayOrder: "asc" } } },
      },
    },
  });
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const map = await prisma.$transaction(async (tx) => {
    const newMap = await tx.map.create({
      data: { dealId, title: parsed.data.title, createdById: session.userId },
    });

    for (const templatePhase of template.phases) {
      const phase = await tx.mapPhase.create({
        data: {
          mapId: newMap.id,
          name: templatePhase.name,
          displayOrder: templatePhase.displayOrder,
        },
      });

      if (templatePhase.tasks.length > 0) {
        await tx.mapTask.createMany({
          data: templatePhase.tasks.map((t) => ({
            phaseId: phase.id,
            mapId: newMap.id,
            title: t.title,
            description: t.description,
            owner: t.owner,
            estimatedDays: t.estimatedDays,
            successCriteria: t.successCriteria,
            isClientVisible: t.isClientVisible,
            isTbdWithClient: t.isTbdWithClient,
            isForecastMilestone: t.isForecastMilestone,
            forecastProbability: t.forecastProbability,
            displayOrder: t.displayOrder,
            status: "NOT_STARTED" as const,
          })),
        });
      }
    }

    return newMap;
  });

  return NextResponse.json(map, { status: 201 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dealId } = await params;

  const deal = await prisma.deal.findFirst({
    where: { id: dealId, organizationId: session.organizationId },
  });
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = updateMapSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const map = await prisma.map.update({
    where: { dealId },
    data: parsed.data,
  });

  return NextResponse.json(map);
}
