import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { DEFAULT_STAGES, resolveStages } from "@/lib/stages";

const stageConfigSchema = z.object({
  key: z.string().min(1).max(64),
  label: z.string().min(1).max(64),
  color: z.string().min(1).max(32),
  isTerminal: z.boolean(),
  displayOrder: z.number().int().min(0),
});

const updateStagesSchema = z.object({
  stages: z.array(stageConfigSchema).min(1),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: { stageLabels: true },
  });

  const stages = resolveStages(org?.stageLabels);
  return NextResponse.json({ stages });
}

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = updateStagesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const org = await prisma.organization.update({
    where: { id: session.organizationId },
    data: { stageLabels: parsed.data.stages },
    select: { stageLabels: true },
  });

  return NextResponse.json({ stages: resolveStages(org.stageLabels) });
}

export { DEFAULT_STAGES };
