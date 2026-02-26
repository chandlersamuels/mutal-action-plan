import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

const REMINDER_DAYS = [7, 2];

export async function scheduleTaskReminders(
  mapId: string,
  taskId: string,
  targetDate: Date,
  recipientEmail?: string
) {
  const now = new Date();

  for (const daysBefore of REMINDER_DAYS) {
    const scheduledFor = new Date(targetDate);
    scheduledFor.setDate(scheduledFor.getDate() - daysBefore);

    if (scheduledFor <= now) continue;

    await prisma.notification.create({
      data: {
        mapId,
        taskId,
        recipientEmail,
        type: NotificationType.DEADLINE_REMINDER,
        scheduledFor,
        payload: {
          daysBefore,
          targetDate: targetDate.toISOString(),
        },
      },
    });
  }
}

export async function cancelTaskReminders(taskId: string) {
  await prisma.notification.updateMany({
    where: {
      taskId,
      type: NotificationType.DEADLINE_REMINDER,
      status: "PENDING",
    },
    data: { status: "CANCELLED" },
  });
}
