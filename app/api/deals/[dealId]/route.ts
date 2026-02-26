import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateDealSchema } from "@/lib/validations";

async function getDealOrFail(dealId: string, organizationId: string) {
  const deal = await prisma.deal.findFirst({
    where: { id: dealId, organizationId },
  });
  return deal;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dealId } = await params;
  const deal = await prisma.deal.findFirst({
    where: { id: dealId, organizationId: session.organizationId },
    include: {
      client: { include: { contacts: true } },
      owner: { select: { id: true, name: true, email: true } },
      map: true,
    },
  });

  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(deal);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dealId } = await params;
  const deal = await getDealOrFail(dealId, session.organizationId);
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = updateDealSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.deal.update({
    where: { id: dealId },
    data: {
      ...parsed.data,
      targetCloseDate: parsed.data.targetCloseDate ? new Date(parsed.data.targetCloseDate) : undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dealId } = await params;
  const deal = await getDealOrFail(dealId, session.organizationId);
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.deal.update({ where: { id: dealId }, data: { isArchived: true } });
  return NextResponse.json({ success: true });
}
