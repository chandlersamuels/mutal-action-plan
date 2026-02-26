import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPhaseSchema, reorderSchema } from "@/lib/validations";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dealId } = await params;

  const map = await prisma.map.findFirst({
    where: { dealId, deal: { organizationId: session.organizationId } },
  });
  if (!map) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();

  // Handle reorder
  if (body.reorder) {
    const parsed = reorderSchema.safeParse(body.items);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    await Promise.all(
      parsed.data.map((item) =>
        prisma.mapPhase.update({ where: { id: item.id }, data: { displayOrder: item.displayOrder } })
      )
    );
    return NextResponse.json({ success: true });
  }

  const parsed = createPhaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const phase = await prisma.mapPhase.create({
    data: { ...parsed.data, mapId: map.id },
  });

  return NextResponse.json(phase, { status: 201 });
}
