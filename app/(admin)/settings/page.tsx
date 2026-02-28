import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Puzzle, Building2 } from "lucide-react";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrgLogoSection } from "@/components/admin/org-logo-section";

export default async function SettingsPage() {
  const session = await getAdminSession();
  const org = await prisma.organization.findUnique({
    where: { id: session!.organizationId },
    select: { id: true, name: true, logoUrl: true },
  });

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>

      {/* Branding */}
      <div className="glass-card rounded-2xl px-6 py-5 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Organization branding</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your logo appears on every client-facing action plan.
            </p>
          </div>
        </div>
        <OrgLogoSection
          orgName={org?.name ?? ""}
          initialLogoUrl={org?.logoUrl ?? null}
        />
      </div>

      {/* Other settings cards */}
      <div className="grid gap-4">
        <Link href="/settings/team">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Users className="h-4 w-4" />
                Team
              </CardTitle>
              <CardDescription>Manage team members and their roles.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Card className="opacity-60 cursor-not-allowed rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Puzzle className="h-4 w-4" />
              HubSpot Integration
            </CardTitle>
            <CardDescription>Bidirectional deal sync — coming in Phase 3.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
