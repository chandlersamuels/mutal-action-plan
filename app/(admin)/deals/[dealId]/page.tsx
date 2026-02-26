import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapIcon, Plus, User, DollarSign, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DealStage } from "@prisma/client";

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
    <div className="p-8 max-w-5xl mx-auto">
      <Link
        href="/deals"
        className="inline-flex items-center gap-1.5 text-sm mb-7 transition-colors text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to deals
      </Link>

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
      <div className="grid grid-cols-3 gap-5 mb-8">
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
            <div>
              <p className="text-xs font-medium mb-1 text-muted-foreground">
                {label}
              </p>
              <p className="text-sm font-semibold text-foreground">
                {primary}
              </p>
              {secondary && (
                <p className="text-xs mt-0.5 text-muted-foreground">
                  {secondary}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MAP Section */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.12]">
              <MapIcon className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">
              Mutual Action Plan
            </h2>
          </div>
          {deal.map && (
            <Button asChild size="sm" className="btn-glow">
              <Link href={`/deals/${deal.id}/map`}>Open MAP Editor</Link>
            </Button>
          )}
        </div>

        <div className="px-6 py-5">
          {!deal.map ? (
            <div className="text-center py-8">
              <p className="text-sm mb-4 text-muted-foreground">
                No MAP created yet for this deal.
              </p>
              <Button asChild size="sm" className="btn-glow">
                <Link href={`/deals/${deal.id}/map`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create MAP
                </Link>
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <p className="text-sm font-medium text-foreground">
                  {deal.map.title}
                </p>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/[0.12] text-primary">
                  {deal.map.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {deal.map.phases.length} phases ·{" "}
                {deal.map.phases.reduce((s, p) => s + p.tasks.length, 0)} tasks ·{" "}
                {deal.map.shareTokens.length} active share link(s)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
