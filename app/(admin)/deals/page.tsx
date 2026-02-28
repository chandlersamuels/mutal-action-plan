import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, MapIcon, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveStages, stageLabel, stageColorClass } from "@/lib/stages";

const MAP_STATUS_CLASSES: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  DRAFT: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  ARCHIVED: "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300",
};

function daysUntilGoLive(targetCloseDate: Date | null): { days: number; label: string; color: string } | null {
  if (!targetCloseDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetCloseDate);
  target.setHours(0, 0, 0, 0);
  const days = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { days, label: `${Math.abs(days)}d overdue`, color: "text-red-500" };
  if (days === 0) return { days, label: "Go live today", color: "text-amber-500" };
  if (days <= 7) return { days, label: `${days}d to go live`, color: "text-amber-500" };
  return { days, label: `${days}d to go live`, color: "text-muted-foreground" };
}

export default async function DealsPage() {
  const session = await getAdminSession();
  const orgId = session!.organizationId;

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { stageLabels: true },
  });
  const stages = resolveStages(org?.stageLabels);

  const deals = await prisma.deal.findMany({
    where: { organizationId: orgId, isArchived: false },
    orderBy: { updatedAt: "desc" },
    include: {
      client: true,
      owner: { select: { name: true } },
      map: { select: { id: true, status: true } },
    },
  });

  return (
    <div className="px-4 py-6 sm:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Deals</h1>
        <Button asChild className="btn-glow gap-2">
          <Link href="/deals/new">
            <Plus className="h-4 w-4" />
            New Deal
          </Link>
        </Button>
      </div>

      {deals.length === 0 ? (
        <div className="glass-card rounded-2xl text-center py-20">
          <p className="text-base mb-4 text-muted-foreground">No deals yet.</p>
          <Button asChild className="btn-glow">
            <Link href="/deals/new">Create your first deal</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deals.map((deal) => {
            const mapStatusClass = deal.map
              ? (MAP_STATUS_CLASSES[deal.map.status] ?? MAP_STATUS_CLASSES.DRAFT)
              : null;
            const goLive = daysUntilGoLive(deal.targetCloseDate);

            return (
              <Link
                key={deal.id}
                href={`/deals/${deal.id}`}
                className="glass-card rounded-2xl p-5 flex flex-col gap-4 transition-shadow hover:shadow-md group"
              >
                {/* Top: name + stage */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {deal.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {deal.client.companyName}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0",
                      stageColorClass(stages, deal.stage)
                    )}
                  >
                    {stageLabel(stages, deal.stage)}
                  </span>
                </div>

                {/* Middle: value + owner */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {deal.dealValue ? `$${Number(deal.dealValue).toLocaleString()}` : "—"}
                  </span>
                  <span>·</span>
                  <span className="truncate">{deal.owner.name}</span>
                </div>

                {/* Bottom: MAP status + go-live countdown + arrow */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <MapIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    {deal.map && mapStatusClass ? (
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          mapStatusClass
                        )}
                      >
                        {deal.map.status}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">No plan</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {goLive && (
                      <span className={cn("flex items-center gap-1 text-xs font-medium", goLive.color)}>
                        <CalendarClock className="h-3.5 w-3.5" />
                        {goLive.label}
                      </span>
                    )}
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
