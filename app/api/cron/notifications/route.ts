import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Called hourly by Vercel Cron: GET /api/cron/notifications
// Vercel Cron sets Authorization: Bearer <CRON_SECRET>
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Fetch all PENDING notifications that are due
  const pending = await prisma.notification.findMany({
    where: {
      status: "PENDING",
      scheduledFor: { lte: now },
    },
    include: {
      map: {
        include: {
          deal: {
            select: { name: true },
          },
        },
      },
      task: { select: { title: true, targetDate: true } },
    },
    take: 100,
  });

  let sent = 0;
  let failed = 0;

  for (const notification of pending) {
    try {
      // Send email if RESEND_API_KEY is configured
      const resendKey = process.env.RESEND_API_KEY;
      const recipientEmail = notification.recipientEmail;

      if (resendKey && recipientEmail) {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        const taskTitle = notification.task?.title ?? "Task";
        const dealName = notification.map.deal.name;
        const targetDate = notification.task?.targetDate
          ? new Date(notification.task.targetDate).toLocaleDateString()
          : "soon";

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? "noreply@example.com",
          to: recipientEmail,
          subject: `Reminder: "${taskTitle}" is due ${targetDate}`,
          html: `
            <p>Hi,</p>
            <p>This is a reminder that the task <strong>"${taskTitle}"</strong> for deal <strong>${dealName}</strong> is due on <strong>${targetDate}</strong>.</p>
            <p>Please take action to keep the deal on track.</p>
          `,
        });
      }

      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: "SENT", sentAt: new Date() },
      });
      sent++;
    } catch {
      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: "FAILED" },
      });
      failed++;
    }
  }

  return NextResponse.json({ processed: pending.length, sent, failed });
}
