import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const onboardingSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
});

export async function POST(request: NextRequest) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Prevent double-onboarding
  const existingUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  });
  if (existingUser) {
    return NextResponse.json({ error: "Already onboarded" }, { status: 409 });
  }

  const body = await request.json();
  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Check slug uniqueness
  const existingOrg = await prisma.organization.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existingOrg) {
    return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
  }

  // Fetch user info from Clerk
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkUserId);
  const email =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    email.split("@")[0];

  // Create org + user atomically
  const { org, user } = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
      },
    });

    const user = await tx.user.create({
      data: {
        clerkId: clerkUserId,
        email,
        name,
        role: "ADMIN",
        organizationId: org.id,
      },
    });

    return { org, user };
  });

  // Store org/user info in Clerk publicMetadata so middleware can read it without a DB hit
  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: {
      organizationId: org.id,
      role: "ADMIN",
      userId: user.id,
    },
  });

  return NextResponse.json({ organizationId: org.id }, { status: 201 });
}
