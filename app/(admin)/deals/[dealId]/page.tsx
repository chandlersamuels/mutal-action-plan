import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapIcon, User, DollarSign, Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DealStage } from "@prisma/client";
import { DealShareButton } from "@/components/admin/deal-share-button";
import { DeleteDealButton } from "@/components/admin/delete-deal-button";
import { ClientLogoSection } from "@/components/admin/client-logo-section";
import { CreatePlanButton } from "@/components/admin/create-plan-button";

const STAGE_LABELS: Record<DealStage, string> = {
  DISCOVERY: "Discovery",
  PROPOSAL: "Proposal",
  EVALUATION: "Evaluation",
  SOW_REVIEW: "SOW Review",
  NEGOTIATION: "Negotiation",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
};

const STAGE_COLORS: Record<DealStage, string> = {
  DISCOVERY: "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300",
  PROPOSAL: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
  EVALUATION: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  SOW_REVIEW: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  NEGOTIATION: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  CLOSED_WON: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  CLOSED_LOST: "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300",
};

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ dealId: string }>;
}) {
  const session = await getAdminSession();
  const { dealId } = await params;

  const deal = await prisma.deal.findFirst({
    where: { id: dealId, organizationId: session!.organizationId },
    include: {
      client: { include: { contacts: true } },
      owner: { select: { name: true, email: true } },
      map: {
        include: {
          shareTokens: { where: { isActive: true } },
          phases: {
            orderBy: { displayOrder: "asc" },
            include: { tasks: { orderBy: { displayOrder: "asc" } } },
          },
        },
      },
    },
  });

  if (!deal) notFound();

  return (
    <div className="px-4 py-6 sm:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-7">
        <Link
          href="/deals"
          className="inline-flex items-center gap-1.5 text-sm transition-colors text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to deals
        </Link>
        <DeleteDealButton dealId={deal.id} dealName={deal.name} />
      </div>

      {/* Deal header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {deal.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {deal.client.companyName}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
            STAGE_COLORS[deal.stage]
          )}
        >
          {STAGE_LABELS[deal.stage]}
        </span>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Owner",
            icon: User,
            primary: deal.owner.name,
            secondary: deal.owner.email,
            color: "oklch(0.60 0.18 255)",
            bg: "oklch(0.60 0.18 255 / 0.1)",
          },
          {
            label: "Deal Value",
            icon: DollarSign,
            primary: deal.dealValue ? `$${Number(deal.dealValue).toLocaleString()}` : "—",
            secondary: null,
            color: "oklch(0.7248 0.2145 145.7)",
            bg: "oklch(0.7248 0.2145 145.7 / 0.1)",
          },
          {
            label: "Target Close",
            icon: Calendar,
            primary: deal.targetCloseDate
              ? new Date(deal.targetCloseDate).toLocaleDateString()
              : "—",
            secondary: null,
            color: "oklch(0.65 0.2 30)",
            bg: "oklch(0.65 0.2 30 / 0.1)",
          },
        ].map(({ label, icon: Icon, primary, secondary, color, bg }) => (
          <div key={label} className="glass-card rounded-2xl px-5 py-4 flex items-start gap-3.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 mt-0.5"
              style={{ background: bg }}
            >
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium mb-1 text-muted-foreground">
                {label}
              </p>
              <p className="text-sm font-semibold text-foreground">
                {primary}
              </p>
              {secondary && (
                <p className="text-xs mt-0.5 text-muted-foreground truncate">
                  {secondary}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Client branding */}
      <div className="glass-card rounded-2xl px-6 py-5 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Client branding</h2>
        <ClientLogoSection
          dealId={deal.id}
          initialLogoUrl={deal.client.logoUrl ?? null}
          clientName={deal.client.companyName}
        />
      </div>

      {/* Action Plan Section */}
      {(() => {
        const hasMap = !!deal.map;
        const hasPhases = (deal.map?.phases.length ?? 0) > 0;

        const STATUS_DOT: Record<string, string> = {
          NOT_STARTED: "bg-muted-foreground/40",
          IN_PROGRESS:  "bg-primary",
          COMPLETE:     "bg-emerald-500",
          AT_RISK:      "bg-amber-500",
          BLOCKED:      "bg-red-500",
        };

        return (
          <div className="glass-card rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12">
                <MapIcon className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Action Plan</h2>
              {hasMap && (
                <div className="ml-auto flex items-center gap-2">
                  <Button asChild size="sm" variant="outline" className="shrink-0">
                    <Link href={`/deals/${deal.id}/map`}>Edit plan</Link>
                  </Button>
                  <DealShareButton
                    dealId={deal.id}
                    mapId={deal.map!.id}
                    hasPhases={hasPhases}
                    initialTokens={deal.map!.shareTokens}
                  />
                </div>
              )}
            </div>

            {/* Body */}
            {!hasMap ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No action plan yet. Create one to start collaborating with your client.
                </p>
                <CreatePlanButton dealId={deal.id} dealName={deal.name} />
              </div>
            ) : !hasPhases ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Your plan has no phases yet. Open the editor to build it out.
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/deals/${deal.id}/map`}>Open editor</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {deal.map!.phases.map((phase) => {
                  const total = phase.tasks.length;
                  const done  = phase.tasks.filter((t) => t.status === "COMPLETE").length;
                  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

                  return (
                    <div key={phase.id} className="px-6 py-4">
                      {/* Phase row */}
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <p className="text-sm font-medium text-foreground truncate">
                            {phase.name}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {done}/{total} complete
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="h-1 rounded-full bg-muted mb-3">
                        <div
                          className="h-1 rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      {/* Tasks */}
                      {phase.tasks.length > 0 && (
                        <div className="space-y-1.5 pl-5">
                          {phase.tasks.map((task) => (
                            <div key={task.id} className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full shrink-0",
                                  STATUS_DOT[task.status] ?? "bg-muted-foreground/40"
                                )}
                              />
                              <p className="text-xs text-muted-foreground truncate">
                                {task.title}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
