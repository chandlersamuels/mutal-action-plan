import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ACCEPTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dealId } = await params;

  const deal = await prisma.deal.findFirst({
    where: { id: dealId, organizationId: session.organizationId },
    select: { id: true },
  });
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  // Validate MIME type (allow image/* as prefix)
  const isImage = file.type.startsWith("image/");
  if (!isImage && !ACCEPTED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File exceeds 50 MB limit" }, { status: 400 });
  }

  const customName = (formData.get("name") as string | null)?.trim() || file.name;
  const safeName = sanitizeFilename(file.name);
  const blobPath = `documents/${session.organizationId}/${dealId}/${Date.now()}-${safeName}`;

  const blob = await put(blobPath, file, { access: "public" });

  const doc = await prisma.dealDocument.create({
    data: {
      dealId,
      uploadedById: session.userId,
      name: customName,
      blobUrl: blob.url,
      mimeType: file.type,
      fileSize: file.size,
    },
  });

  return NextResponse.json(doc, { status: 201 });
}
