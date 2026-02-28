import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const saveTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  fromMapId: z.string().cuid(),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await prisma.mapTemplate.findMany({
    where: {
      OR: [
        { organizationId: session.organizationId },
        { isDefault: true },
      ],
    },
    include: {
      phases: {
        include: { _count: { select: { tasks: true } } },
      },
    },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  const result = templates.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    isDefault: t.isDefault,
    phaseCount: t.phases.length,
    taskCount: t.phases.reduce((sum, p) => sum + p._count.tasks, 0),
  }));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = saveTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { name, description, fromMapId } = parsed.data;

  // Verify the map belongs to the org
  const map = await prisma.map.findFirst({
    where: { id: fromMapId, deal: { organizationId: session.organizationId } },
    include: {
      phases: {
        orderBy: { displayOrder: "asc" },
        include: { tasks: { orderBy: { displayOrder: "asc" } } },
      },
    },
  });
  if (!map) return NextResponse.json({ error: "Map not found" }, { status: 404 });

  const template = await prisma.mapTemplate.create({
    data: {
      organizationId: session.organizationId,
      name,
      description,
      createdById: session.userId,
      phases: {
        create: map.phases.map((phase) => ({
          name: phase.name,
          displayOrder: phase.displayOrder,
          tasks: {
            create: phase.tasks.map((task) => ({
              title: task.title,
              description: task.description,
              owner: task.owner,
              estimatedDays: task.estimatedDays,
              successCriteria: task.successCriteria,
              isClientVisible: task.isClientVisible,
              isTbdWithClient: task.isTbdWithClient,
              isForecastMilestone: task.isForecastMilestone,
              forecastProbability: task.forecastProbability,
              displayOrder: task.displayOrder,
            })),
          },
        })),
      },
    },
  });

  return NextResponse.json(template, { status: 201 });
}
