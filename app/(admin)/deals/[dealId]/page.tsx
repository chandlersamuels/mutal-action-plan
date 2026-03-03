import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapIcon, User, DollarSign, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveStages, stageLabel, stageColorClass } from "@/lib/stages";
import { DeleteDealButton } from "@/components/admin/delete-deal-button";
import { ClientLogoSection } from "@/components/admin/client-logo-section";
import { CreatePlanButton } from "@/components/admin/create-plan-button";
import { DealMapPanel } from "@/components/admin/deal-map-panel";
import { DealDocumentsSection } from "@/components/admin/deal-documents-section";
import { DealAnalyticsPanel } from "@/components/admin/deal-analytics";

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ dealId: string }>;
}) {
  const session = await getAdminSession();
  const { dealId } = await params;

  const org = await prisma.organization.findUnique({
    where: { id: session!.organizationId },
    select: { stageLabels: true },
  });
  const stages = resolveStages(org?.stageLabels);

  const deal = await prisma.deal.findFirst({
    where: { id: dealId, organizationId: session!.organizationId },
    include: {
      client: { include: { contacts: true } },
      owner: { select: { name: true, email: true } },
      documents: { orderBy: { createdAt: "desc" } },
      map: {
        include: {
          shareTokens: { orderBy: { createdAt: "desc" } },
          phases: {
            orderBy: { displayOrder: "asc" },
            include: {
              tasks: {
                orderBy: { displayOrder: "asc" },
                include: { clientContact: true },
              },
            },
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
            stageColorClass(stages, deal.stage)
          )}
        >
          {stageLabel(stages, deal.stage)}
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

      {/* Analytics */}
      <DealAnalyticsPanel deal={deal} />

      {/* Client branding + Documents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="glass-card rounded-2xl px-6 py-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Client branding</h2>
          <ClientLogoSection
            dealId={deal.id}
            initialLogoUrl={deal.client.logoUrl ?? null}
            clientName={deal.client.companyName}
          />
        </div>
        <DealDocumentsSection
          dealId={deal.id}
          initialDocuments={deal.documents.map((d) => ({
            ...d,
            createdAt: d.createdAt.toISOString(),
          }))}
        />
      </div>

      {/* Action Plan Section */}
      {!deal.map ? (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12">
              <MapIcon className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Action Plan</h2>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No action plan yet. Create one to start collaborating with your client.
            </p>
            <CreatePlanButton dealId={deal.id} dealName={deal.name} />
          </div>
        </div>
      ) : (
        <DealMapPanel dealId={deal.id} map={deal.map} />
      )}

    </div>
  );
}
