import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updatePhaseSchema } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string; phaseId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dealId, phaseId } = await params;

  const phase = await prisma.mapPhase.findFirst({
    where: { id: phaseId, map: { dealId, deal: { organizationId: session.organizationId } } },
  });
  if (!phase) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = updatePhaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.mapPhase.update({ where: { id: phaseId }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ dealId: string; phaseId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dealId, phaseId } = await params;

  const phase = await prisma.mapPhase.findFirst({
    where: { id: phaseId, map: { dealId, deal: { organizationId: session.organizationId } } },
  });
  if (!phase) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.mapPhase.delete({ where: { id: phaseId } });
  return NextResponse.json({ success: true });
}
