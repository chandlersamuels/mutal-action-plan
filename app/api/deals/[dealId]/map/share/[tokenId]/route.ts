import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateShareTokenSchema } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string; tokenId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dealId, tokenId } = await params;

  const shareToken = await prisma.mapShareToken.findFirst({
    where: { id: tokenId, map: { dealId, deal: { organizationId: session.organizationId } } },
  });
  if (!shareToken) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = updateShareTokenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.mapShareToken.update({
    where: { id: tokenId },
    data: {
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ dealId: string; tokenId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dealId, tokenId } = await params;

  const shareToken = await prisma.mapShareToken.findFirst({
    where: { id: tokenId, map: { dealId, deal: { organizationId: session.organizationId } } },
  });
  if (!shareToken) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.mapShareToken.update({ where: { id: tokenId }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
