import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ logoUrl: z.string().url().nullable() });

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dealId } = await params;

  const deal = await prisma.deal.findFirst({
    where: { id: dealId, organizationId: session.organizationId },
    select: { clientId: true },
  });
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const client = await prisma.client.update({
    where: { id: deal.clientId },
    data: { logoUrl: parsed.data.logoUrl },
    select: { id: true, logoUrl: true },
  });

  return NextResponse.json(client);
}
