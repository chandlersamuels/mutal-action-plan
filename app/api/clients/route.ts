import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createClientSchema = z.object({
  companyName: z.string().min(1).max(255),
  website: z.string().url().optional(),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clients = await prisma.client.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { companyName: "asc" },
    include: { contacts: true },
  });

  return NextResponse.json(clients);
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: {
      organizationId: session.organizationId,
      ...parsed.data,
    },
  });

  return NextResponse.json(client, { status: 201 });
}
