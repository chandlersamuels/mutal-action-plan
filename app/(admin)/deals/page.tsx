import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, ArrowRight } from "lucide-react";
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

const MAP_STATUS_CLASSES: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  DRAFT: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  ARCHIVED: "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300",
};

export default async function DealsPage() {
  const session = await getAdminSession();
  const orgId = session!.organizationId;

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
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Deals
        </h1>
        <Button asChild className="btn-glow gap-2">
          <Link href="/deals/new">
            <Plus className="h-4 w-4" />
            New Deal
          </Link>
        </Button>
      </div>

      {deals.length === 0 ? (
        <div className="glass-card rounded-2xl text-center py-20">
          <p className="text-base mb-4 text-muted-foreground">
            No deals yet.
          </p>
          <Button asChild className="btn-glow">
            <Link href="/deals/new">Create your first deal</Link>
          </Button>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                {["Deal", "Client", "Owner", "Stage", "Value", "MAP", ""].map((h) => (
                  <TableHead
                    key={h}
                    className="text-xs font-semibold uppercase tracking-wider py-3 text-muted-foreground"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => {
                const mapStatusClass = deal.map
                  ? (MAP_STATUS_CLASSES[deal.map.status] ?? MAP_STATUS_CLASSES.DRAFT)
                  : null;
                return (
                  <TableRow
                    key={deal.id}
                    className="transition-colors border-b border-border hover:bg-primary/[0.04]"
                  >
                    <TableCell>
                      <Link
                        href={`/deals/${deal.id}`}
                        className="text-sm font-medium transition-colors text-foreground hover:text-primary"
                      >
                        {deal.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {deal.client.companyName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {deal.owner.name}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          STAGE_COLORS[deal.stage]
                        )}
                      >
                        {STAGE_LABELS[deal.stage]}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-foreground">
                      {deal.dealValue ? `$${Number(deal.dealValue).toLocaleString()}` : "—"}
                    </TableCell>
                    <TableCell>
                      {deal.map && mapStatusClass ? (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            mapStatusClass
                          )}
                        >
                          {deal.map.status}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/deals/${deal.id}`}
                        className="flex items-center justify-center h-7 w-7 rounded-lg transition-colors text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
