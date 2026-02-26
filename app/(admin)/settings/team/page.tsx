import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@prisma/client";

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
};

export default async function TeamPage() {
  const session = await getAdminSession();
  const users = await prisma.user.findMany({
    where: { organizationId: session!.organizationId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Team</h1>
      <Card>
        <CardHeader>
          <CardTitle>Members ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <Badge
                  variant={user.role === "ADMIN" ? "default" : "outline"}
                  className="text-xs"
                >
                  {ROLE_LABELS[user.role]}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
