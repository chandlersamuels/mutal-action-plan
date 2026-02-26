import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

type ClerkUserPayload = {
  id: string;
  email_addresses: { id: string; email_address: string }[];
  primary_email_address_id: string;
  first_name: string | null;
  last_name: string | null;
};

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await request.text();

  let event: { type: string; data: ClerkUserPayload };
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: ClerkUserPayload };
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;

  if (type === "user.created") {
    // User row is created during onboarding, not here
    return NextResponse.json({ received: true });
  }

  if (type === "user.updated") {
    const email =
      data.email_addresses.find((e) => e.id === data.primary_email_address_id)
        ?.email_address ?? data.email_addresses[0]?.email_address;
    const name =
      [data.first_name, data.last_name].filter(Boolean).join(" ") || email?.split("@")[0] || "";

    await prisma.user.updateMany({
      where: { clerkId: data.id },
      data: { ...(email && { email }), ...(name && { name }) },
    });

    return NextResponse.json({ received: true });
  }

  if (type === "user.deleted") {
    await prisma.user.updateMany({
      where: { clerkId: data.id },
      data: {
        email: `deleted-${data.id}@deleted.invalid`,
        name: "Deleted User",
      },
    });

    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}
