import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTaskSchema } from "@/lib/validations";
import { scheduleTaskReminders, cancelTaskReminders } from "@/lib/notifications";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string; taskId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dealId, taskId } = await params;

  const task = await prisma.mapTask.findFirst({
    where: { id: taskId, phase: { map: { dealId, deal: { organizationId: session.organizationId } } } },
  });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const data: Record<string, unknown> = { ...parsed.data };

  // Set originalTargetDate on first assignment
  if (parsed.data.targetDate && !task.originalTargetDate) {
    data.originalTargetDate = new Date(parsed.data.targetDate);
  }

  if (parsed.data.targetDate) {
    data.targetDate = new Date(parsed.data.targetDate);
  }

  if (parsed.data.completedDate) {
    data.completedDate = new Date(parsed.data.completedDate);
  }

  const updated = await prisma.mapTask.update({ where: { id: taskId }, data });

  // Reschedule reminders if targetDate changed
  if (parsed.data.targetDate) {
    await cancelTaskReminders(taskId);
    await scheduleTaskReminders(task.mapId, taskId, new Date(parsed.data.targetDate));
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ dealId: string; taskId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dealId, taskId } = await params;

  const task = await prisma.mapTask.findFirst({
    where: { id: taskId, phase: { map: { dealId, deal: { organizationId: session.organizationId } } } },
  });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.mapTask.delete({ where: { id: taskId } });
  return NextResponse.json({ success: true });
}
