import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createShareTokenSchema } from "@/lib/validations";
import { generateShareToken } from "@/lib/share-token";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dealId } = await params;

  const map = await prisma.map.findFirst({
    where: { dealId, deal: { organizationId: session.organizationId } },
  });
  if (!map) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const tokens = await prisma.mapShareToken.findMany({
    where: { mapId: map.id, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tokens);
}

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
  const parsed = createShareTokenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const token = await prisma.mapShareToken.create({
    data: {
      mapId: map.id,
      token: generateShareToken(),
      createdById: session.userId,
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
    },
  });

  return NextResponse.json(token, { status: 201 });
}
