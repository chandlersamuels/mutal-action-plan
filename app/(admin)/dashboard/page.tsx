import { getAdminSession } from "@/lib/auth";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, MapIcon, Plus, TrendingUp, ArrowRight } from "lucide-react";
import { MapStatus } from "@prisma/client";
import { resolveStages, stageLabel, stageColorClass } from "@/lib/stages";

export default async function DashboardPage() {
  const session = await getAdminSession();
  const orgId = session!.organizationId;
  const clerkUser = await currentUser();
  const userName =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
    clerkUser?.emailAddresses[0]?.emailAddress ||
    "there";

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { stageLabels: true },
  });
  const stages = resolveStages(org?.stageLabels);
  const terminalKeys = stages.filter((s) => s.isTerminal).map((s) => s.key);

  const [totalDeals, activeDeals, activeMaps, recentDeals] = await Promise.all([
    prisma.deal.count({ where: { organizationId: orgId, isArchived: false } }),
    prisma.deal.count({
      where: { organizationId: orgId, isArchived: false, stage: { notIn: terminalKeys } },
    }),
    prisma.map.count({
      where: { deal: { organizationId: orgId }, status: MapStatus.ACTIVE },
    }),
    prisma.deal.findMany({
      where: { organizationId: orgId, isArchived: false },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        client: true,
        owner: { select: { name: true } },
        map: { select: { id: true, status: true } },
      },
    }),
  ]);

  const stats = [
    {
      label: "Total Deals",
      value: totalDeals,
      icon: Briefcase,
      color: "oklch(0.7248 0.2145 145.7)",
      bg: "oklch(0.7248 0.2145 145.7 / 0.1)",
    },
    {
      label: "Active Deals",
      value: activeDeals,
      icon: TrendingUp,
      color: "oklch(0.60 0.18 255)",
      bg: "oklch(0.60 0.18 255 / 0.1)",
    },
    {
      label: "Active MAPs",
      value: activeMaps,
      icon: MapIcon,
      color: "oklch(0.65 0.2 30)",
      bg: "oklch(0.65 0.2 30 / 0.1)",
    },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-10 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {userName}
          </p>
        </div>
        <Button asChild className="btn-glow gap-2 shrink-0">
          <Link href="/deals/new">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Deal</span>
            <span className="sm:hidden">New</span>
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-10">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="glass-card rounded-2xl px-5 py-4 sm:px-6 sm:py-5 flex items-center gap-4"
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0"
              style={{ background: bg }}
            >
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {label}
              </p>
              <p className="text-3xl font-bold mt-0.5 leading-none text-foreground">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Deals */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-sm text-foreground">
            Recent Deals
          </h2>
          <Link
            href="/deals"
            className="flex items-center gap-1 text-xs font-medium transition-colors text-primary"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentDeals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm mb-4 text-muted-foreground">
              No deals yet.
            </p>
            <Button asChild size="sm" className="btn-glow">
              <Link href="/deals/new">Create your first deal</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentDeals.map((deal) => (
              <Link
                key={deal.id}
                href={`/deals/${deal.id}`}
                className="flex items-center justify-between px-4 sm:px-6 py-3.5 transition-colors group hover:bg-primary/[0.04] gap-3"
                style={{ color: "inherit" }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {deal.name}
                  </p>
                  <p className="text-xs mt-0.5 text-muted-foreground truncate">
                    {deal.client.companyName}
                    <span className="hidden sm:inline"> · {deal.owner.name}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {deal.map && (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-primary/[0.12] text-primary">
                      MAP
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${stageColorClass(stages, deal.stage)}`}
                  >
                    {stageLabel(stages, deal.stage)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
