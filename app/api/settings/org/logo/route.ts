import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ logoUrl: z.string().url().nullable() });

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const org = await prisma.organization.update({
    where: { id: session.organizationId },
    data: { logoUrl: parsed.data.logoUrl },
    select: { id: true, logoUrl: true },
  });

  return NextResponse.json(org);
}
