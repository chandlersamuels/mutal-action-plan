import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export type AdminSession = {
  clerkUserId: string;
  userId: string;
  organizationId: string;
  role: string;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const { userId: clerkUserId, sessionClaims } = await auth();
  if (!clerkUserId) return null;

  const meta = sessionClaims?.publicMetadata as
    | { organizationId?: string; role?: string; userId?: string }
    | undefined;

  // Fast path: JWT already has everything we need (normal case after first login)
  if (meta?.organizationId && meta?.userId) {
    return {
      clerkUserId,
      userId: meta.userId,
      organizationId: meta.organizationId,
      role: meta.role ?? "MEMBER",
    };
  }

  // Slow path: JWT is stale (e.g. right after onboarding before the token
  // refreshes). Fall back to a DB lookup so the user isn't locked out.
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true, role: true, organizationId: true },
  });
  if (!user || !user.organizationId) return null;

  return { clerkUserId, userId: user.id, organizationId: user.organizationId, role: user.role };
}
