import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateDocumentSchema } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string; documentId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dealId, documentId } = await params;

  const doc = await prisma.dealDocument.findFirst({
    where: {
      id: documentId,
      dealId,
      deal: { organizationId: session.organizationId },
    },
  });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = updateDocumentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const updated = await prisma.dealDocument.update({
    where: { id: documentId },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ dealId: string; documentId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dealId, documentId } = await params;

  const doc = await prisma.dealDocument.findFirst({
    where: {
      id: documentId,
      dealId,
      deal: { organizationId: session.organizationId },
    },
  });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await del(doc.blobUrl);
  await prisma.dealDocument.delete({ where: { id: documentId } });

  return new NextResponse(null, { status: 204 });
}
