import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
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

  const { pinCode, ...rest } = parsed.data;
  const updated = await prisma.mapShareToken.update({
    where: { id: tokenId },
    data: {
      ...rest,
      expiresAt: rest.expiresAt ? new Date(rest.expiresAt) : undefined,
      // null clears the PIN; a string sets a new one; undefined leaves it unchanged
      ...(pinCode !== undefined
        ? { pinCodeHash: pinCode === null ? null : createHash("sha256").update(pinCode).digest("hex") }
        : {}),
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
