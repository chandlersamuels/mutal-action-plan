import { Eye, Link2, Calendar, Clock, CheckCircle2, AlertCircle, XCircle, Circle, AlarmClock, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskStatus, MapShareToken, DealDocument, MapTask, MapPhase } from "@prisma/client";

interface PhaseWithTasks extends MapPhase {
  tasks: MapTask[];
}

interface MapData {
  createdAt: Date;
  shareTokens: MapShareToken[];
  phases: PhaseWithTasks[];
}

interface DealData {
  createdAt: Date;
  map: MapData | null;
  documents: DealDocument[];
}

interface Props {
  deal: DealData;
}

export function DealAnalyticsPanel({ deal }: Props) {
  const now = new Date();

  // ── Client Engagement ──
  const tokens = deal.map?.shareTokens ?? [];
  const totalViews = tokens.reduce((s, t) => s + t.totalViews, 0);
  const lastAccessed = tokens
    .map((t) => t.lastAccessedAt)
    .filter((d): d is Date => d !== null)
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
  const daysSinceAccess = lastAccessed
    ? Math.floor((now.getTime() - lastAccessed.getTime()) / 86_400_000)
    : null;
  const activeLinks = tokens.filter((t) => t.isActive).length;
  const dealAgeDays = Math.floor((now.getTime() - deal.createdAt.getTime()) / 86_400_000);

  // ── Task Progress ──
  const allTasks = (deal.map?.phases ?? []).flatMap((p) => p.tasks);
  const total = allTasks.length;
  const byStatus = {
    complete: allTasks.filter((t) => t.status === "COMPLETE").length,
    inProgress: allTasks.filter((t) => t.status === "IN_PROGRESS").length,
    notStarted: allTasks.filter((t) => t.status === "NOT_STARTED").length,
    atRisk: allTasks.filter((t) => t.status === "AT_RISK").length,
    blocked: allTasks.filter((t) => t.status === "BLOCKED").length,
  };
  const completionPct = total > 0 ? Math.round((byStatus.complete / total) * 100) : 0;
  const overdueTasks = allTasks.filter(
    (t) => t.targetDate && t.targetDate < now && t.status !== "COMPLETE"
  ).length;
  const slippedTasks = allTasks.filter(
    (t) =>
      t.originalTargetDate &&
      t.targetDate &&
      t.targetDate.getTime() > t.originalTargetDate.getTime() + 7 * 86_400_000
  ).length;

  // ── Phase Breakdown ──
  const phases = (deal.map?.phases ?? []).map((phase) => {
    const phaseTasks = phase.tasks;
    const phaseComplete = phaseTasks.filter((t) => t.status === "COMPLETE").length;
    const pct = phaseTasks.length > 0 ? Math.round((phaseComplete / phaseTasks.length) * 100) : 0;
    return { id: phase.id, name: phase.name, total: phaseTasks.length, complete: phaseComplete, pct };
  });
  const activePhaseIdx = phases.findIndex((p) => p.pct < 100);

  // ── Documents ──
  const docs = deal.documents;
  const totalDocViews = docs.reduce((s, d) => s + d.views, 0);

  if (!deal.map) return null;

  return (
    <div className="glass-card rounded-2xl overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12">
          <Eye className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">Deal Analytics</h2>
      </div>

      <div className="px-6 py-5 space-y-6">

        {/* ── Stat Chips Row ── */}
        <div className="flex flex-wrap gap-2">
          <StatChip
            icon={<Eye className="h-3.5 w-3.5" />}
            value={`${totalViews} view${totalViews !== 1 ? "s" : ""}`}
            label="total"
          />
          <StatChip
            icon={<Clock className="h-3.5 w-3.5" />}
            value={
              daysSinceAccess === null
                ? "Never"
                : daysSinceAccess === 0
                ? "Today"
                : `${daysSinceAccess}d ago`
            }
            label="last seen"
            muted={daysSinceAccess === null}
          />
          <StatChip
            icon={<Link2 className="h-3.5 w-3.5" />}
            value={`${activeLinks} link${activeLinks !== 1 ? "s" : ""}`}
            label="active"
          />
          <StatChip
            icon={<Calendar className="h-3.5 w-3.5" />}
            value={`${dealAgeDays}d`}
            label="deal age"
          />
        </div>

        {/* ── Task Progress ── */}
        {total > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-foreground">Task Progress</p>
              <span className="text-xs font-bold text-primary">{completionPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-primary/10 mb-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              <StatusBadge icon={<CheckCircle2 className="h-3 w-3 text-primary" />} count={byStatus.complete} label="complete" />
              <StatusBadge icon={<Clock className="h-3 w-3 text-blue-500" />} count={byStatus.inProgress} label="in progress" />
              <StatusBadge icon={<AlertCircle className="h-3 w-3 text-amber-500" />} count={byStatus.atRisk} label="at risk" />
              <StatusBadge icon={<XCircle className="h-3 w-3 text-red-500" />} count={byStatus.blocked} label="blocked" />
              <StatusBadge icon={<Circle className="h-3 w-3 text-muted-foreground" />} count={byStatus.notStarted} label="not started" />
              {overdueTasks > 0 && (
                <StatusBadge icon={<AlarmClock className="h-3 w-3 text-red-500" />} count={overdueTasks} label="overdue" highlight="red" />
              )}
              {slippedTasks > 0 && (
                <StatusBadge icon={<ChevronsRight className="h-3 w-3 text-amber-500" />} count={slippedTasks} label="slipped" highlight="amber" />
              )}
            </div>
          </div>
        )}

        {/* ── Phase Breakdown ── */}
        {phases.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-foreground mb-3">Phases</p>
            <div className="space-y-2">
              {phases.map((phase, i) => (
                <div key={phase.id} className="flex items-center gap-3">
                  <p
                    className={cn(
                      "text-xs w-32 truncate shrink-0",
                      i === activePhaseIdx ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                  >
                    {phase.name}
                  </p>
                  <div className="flex-1 h-1.5 rounded-full bg-primary/10 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        phase.pct === 100 ? "bg-primary" : i === activePhaseIdx ? "bg-primary/70" : "bg-primary/30"
                      )}
                      style={{ width: `${phase.pct}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-medium text-muted-foreground w-8 text-right">
                      {phase.pct}%
                    </span>
                    {i === activePhaseIdx && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wide">
                        Now
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Document Opens ── */}
        {docs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-foreground">Document Opens</p>
              <span className="text-xs text-muted-foreground">{totalDocViews} total</span>
            </div>
            <div className="space-y-1.5">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 justify-between">
                  <p className="text-xs text-muted-foreground truncate flex-1">{doc.name}</p>
                  <div className="flex items-center gap-1 shrink-0 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    <span className={cn("font-medium", doc.views > 0 && "text-foreground")}>{doc.views}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function StatChip({
  icon,
  value,
  label,
  muted = false,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs",
        muted ? "border-border bg-muted/30 text-muted-foreground" : "border-border bg-muted/20 text-foreground"
      )}
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="font-semibold">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function StatusBadge({
  icon,
  count,
  label,
  highlight,
}: {
  icon: React.ReactNode;
  count: number;
  label: string;
  highlight?: "red" | "amber";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 text-xs",
        highlight === "red" && "text-red-600 dark:text-red-400",
        highlight === "amber" && "text-amber-600 dark:text-amber-400",
        !highlight && "text-muted-foreground"
      )}
    >
      {icon}
      <span className={cn("font-semibold", !highlight && "text-foreground")}>{count}</span>
      <span>{label}</span>
    </div>
  );
}
