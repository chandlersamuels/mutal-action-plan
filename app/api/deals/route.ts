import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDealSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const stage = searchParams.get("stage");
  const ownerId = searchParams.get("ownerId");
  const isArchived = searchParams.get("isArchived") === "true";

  const deals = await prisma.deal.findMany({
    where: {
      organizationId: session.organizationId,
      ...(stage && { stage: stage as never }),
      ...(ownerId && { ownerId }),
      isArchived,
    },
    include: {
      client: true,
      owner: { select: { id: true, name: true, email: true } },
      map: { select: { id: true, status: true, updatedAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(deals);
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createDealSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const deal = await prisma.deal.create({
    data: {
      ...parsed.data,
      organizationId: session.organizationId,
      ownerId: session.userId,
      targetCloseDate: parsed.data.targetCloseDate ? new Date(parsed.data.targetCloseDate) : undefined,
    },
    include: { client: true, owner: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(deal, { status: 201 });
}
