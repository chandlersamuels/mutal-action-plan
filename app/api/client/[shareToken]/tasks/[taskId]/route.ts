import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isTokenExpired } from "@/lib/share-token";
import { clientUpdateTaskSchema } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string; taskId: string }> }
) {
  const { shareToken, taskId } = await params;

  const tokenRecord = await prisma.mapShareToken.findUnique({
    where: { token: shareToken },
  });

  if (!tokenRecord || !tokenRecord.isActive) {
    return NextResponse.json({ error: "Invalid or inactive share link." }, { status: 403 });
  }

  if (isTokenExpired(tokenRecord.expiresAt)) {
    return NextResponse.json({ error: "This share link has expired." }, { status: 403 });
  }

  if (!tokenRecord.allowClientEdits) {
    return NextResponse.json({ error: "This share link does not allow edits." }, { status: 403 });
  }

  // Find the task and verify it belongs to this MAP, is client-visible, and is CLIENT or JOINT owned
  const task = await prisma.mapTask.findFirst({
    where: {
      id: taskId,
      mapId: tokenRecord.mapId,
      isClientVisible: true,
      owner: { in: ["CLIENT", "JOINT"] },
    },
  });

  if (!task) {
    return NextResponse.json(
      { error: "Task not found or not editable by client." },
      { status: 404 }
    );
  }

  const body = await request.json();
  const parsed = clientUpdateTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { note, ...taskUpdates } = parsed.data;

  const data: Record<string, unknown> = { ...taskUpdates };
  if (taskUpdates.completedDate) {
    data.completedDate = new Date(taskUpdates.completedDate);
  }

  const updated = await prisma.mapTask.update({
    where: { id: taskId },
    data,
    select: {
      id: true,
      status: true,
      completedDate: true,
      updatedAt: true,
    },
  });

  // Log activity
  await prisma.mapActivity.create({
    data: {
      mapId: tokenRecord.mapId,
      taskId,
      actorShareToken: shareToken,
      actorLabel: "Client (via shared link)",
      action: taskUpdates.status ? "updated status" : "updated task",
      fieldChanged: taskUpdates.status ? "status" : undefined,
      oldValue: taskUpdates.status ? task.status : undefined,
      newValue: taskUpdates.status ?? undefined,
      note: note ?? undefined,
    },
  });

  return NextResponse.json(updated);
}
