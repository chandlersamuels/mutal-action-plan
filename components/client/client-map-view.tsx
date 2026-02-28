"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { TaskStatus, TaskOwner } from "@prisma/client";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  XCircle,
  ChevronDown,
  Zap,
  Calendar,
  User,
  Users,
  Building2,
  Check,
  Sparkles,
  Timer,
} from "lucide-react";

interface ClientTask {
  id: string;
  phaseId: string;
  title: string;
  description: string | null;
  owner: TaskOwner;
  providerContact: string | null;
  estimatedDays: number | null;
  targetDate: string | null;
  completedDate: string | null;
  status: TaskStatus;
  successCriteria: string | null;
  isTbdWithClient: boolean;
  displayOrder: number;
}

interface ClientPhase {
  id: string;
  name: string;
  displayOrder: number;
  tasks: ClientTask[];
}

interface ClientMap {
  id: string;
  title: string;
  status: string;
  deal: {
    name: string;
    targetCloseDate: string | null;
    client: { companyName: string; logoUrl: string | null };
    organization: { name: string; logoUrl: string | null };
  };
  phases: ClientPhase[];
}

interface Props {
  shareToken: string;
  initialMap: ClientMap;
  permissions: { allowClientEdits: boolean; allowClientNotes: boolean };
}

type PhaseState = "complete" | "active" | "upcoming";

const STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  NOT_STARTED: <Circle className="h-3.5 w-3.5 text-muted-foreground" />,
  IN_PROGRESS: <Clock className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />,
  COMPLETE: <CheckCircle2 className="h-3.5 w-3.5 text-primary" />,
  AT_RISK: <AlertCircle className="h-3.5 w-3.5 text-amber-500" />,
  BLOCKED: <XCircle className="h-3.5 w-3.5 text-red-500" />,
};

function daysFromNow(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function computePhaseStates(phases: ClientPhase[]): Record<string, PhaseState> {
  const states: Record<string, PhaseState> = {};
  let activeFound = false;
  for (const phase of phases) {
    if (activeFound) {
      states[phase.id] = "upcoming";
      continue;
    }
    const allComplete =
      phase.tasks.length === 0 || phase.tasks.every((t) => t.status === "COMPLETE");
    if (allComplete) {
      states[phase.id] = "complete";
    } else {
      states[phase.id] = "active";
      activeFound = true;
    }
  }
  return states;
}

function findNextClientTask(
  phases: ClientPhase[]
): { task: ClientTask; phase: ClientPhase } | null {
  for (const phase of phases) {
    for (const task of phase.tasks) {
      if (
        (task.owner === "CLIENT" || task.owner === "JOINT") &&
        task.status !== "COMPLETE"
      ) {
        return { task, phase };
      }
    }
  }
  return null;
}

function PhaseDot({ state }: { state: PhaseState }) {
  if (state === "complete") {
    return (
      <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm">
        <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />
      </div>
    );
  }
  if (state === "active") {
    return (
      <div className="relative h-7 w-7 shrink-0">
        <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
        <div className="relative h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-md">
          <div className="h-2 w-2 rounded-full bg-primary-foreground" />
        </div>
      </div>
    );
  }
  return (
    <div className="h-7 w-7 rounded-full border-2 border-border bg-background flex items-center justify-center shrink-0">
      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
    </div>
  );
}

export function ClientMapView({ shareToken, initialMap, permissions }: Props) {
  const [map, setMap] = useState(initialMap);
  const [updating, setUpdating] = useState<string | null>(null);

  const phaseStates = useMemo(() => computePhaseStates(map.phases), [map.phases]);
  const nextClientTask = useMemo(() => findNextClientTask(map.phases), [map.phases]);

  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(() => {
    const states = computePhaseStates(initialMap.phases);
    return new Set(
      Object.entries(states)
        .filter(([, s]) => s === "active")
        .map(([id]) => id)
    );
  });

  const totalTasks = map.phases.reduce((s, p) => s + p.tasks.length, 0);
  const completedTasks = map.phases.reduce(
    (s, p) => s + p.tasks.filter((t) => t.status === "COMPLETE").length,
    0
  );
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const allDone = completedTasks === totalTasks && totalTasks > 0;

  function togglePhase(id: string) {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function updateTaskStatus(taskId: string, status: TaskStatus) {
    setUpdating(taskId);
    const res = await fetch(`/api/client/${shareToken}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        ...(status === "COMPLETE" ? { completedDate: new Date().toISOString() } : {}),
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMap((prev) => ({
        ...prev,
        phases: prev.phases.map((phase) => ({
          ...phase,
          tasks: phase.tasks.map((task) =>
            task.id === taskId
              ? { ...task, status: updated.status, completedDate: updated.completedDate }
              : task
          ),
        })),
      }));
    }
    setUpdating(null);
  }

  const { organization, client } = map.deal;

  const daysLeft = map.deal.targetCloseDate ? daysFromNow(map.deal.targetCloseDate) : null;
  const urgency =
    daysLeft === null
      ? null
      : daysLeft < 0
      ? "overdue"
      : daysLeft <= 7
      ? "danger"
      : daysLeft <= 21
      ? "warn"
      : "safe";

  return (
    <div className="min-h-screen app-bg">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-20">

        {/* ── HEADER ── */}
        <header className="mb-6">
          <div className="flex items-center gap-2.5 mb-3">
            {organization.logoUrl && (
              <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-border bg-muted shrink-0">
                <Image
                  src={organization.logoUrl}
                  alt={organization.name}
                  fill
                  className="object-contain p-0.5"
                  unoptimized
                />
              </div>
            )}
            {organization.logoUrl && client.logoUrl && (
              <span className="text-xs text-muted-foreground/40">×</span>
            )}
            {client.logoUrl && (
              <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-border bg-muted shrink-0">
                <Image
                  src={client.logoUrl}
                  alt={client.companyName}
                  fill
                  className="object-contain p-0.5"
                  unoptimized
                />
              </div>
            )}
            <p className="text-xs font-medium text-muted-foreground">
              {client.companyName} × {organization.name}
            </p>
          </div>
          <h1 className="text-xl font-bold text-foreground">{map.title}</h1>
        </header>

        {/* ── CLOSE DATE COUNTDOWN ── */}
        {map.deal.targetCloseDate && (
          <div
            className={cn(
              "rounded-2xl border p-5 mb-6 backdrop-blur-sm shadow-sm",
              urgency === "overdue" &&
                "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900",
              urgency === "danger" &&
                "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900",
              urgency === "warn" &&
                "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/50",
              urgency === "safe" && "glass-card"
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                {/* Large day number */}
                <div className="shrink-0 text-center min-w-12">
                  <div
                    className={cn(
                      "text-4xl font-black tabular-nums leading-none",
                      urgency === "overdue" && "text-red-600 dark:text-red-400",
                      urgency === "danger" && "text-amber-600 dark:text-amber-400",
                      urgency === "warn" && "text-amber-500 dark:text-amber-400",
                      urgency === "safe" && "text-primary"
                    )}
                  >
                    {daysLeft !== null && daysLeft < 0 ? Math.abs(daysLeft) : daysLeft}
                  </div>
                  <div
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider mt-0.5",
                      urgency === "overdue" && "text-red-500 dark:text-red-400",
                      urgency === "danger" && "text-amber-500 dark:text-amber-400",
                      urgency === "warn" && "text-amber-400",
                      urgency === "safe" && "text-primary/60"
                    )}
                  >
                    {urgency === "overdue" ? "days over" : "days left"}
                  </div>
                </div>

                <div>
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      urgency === "overdue" && "text-red-700 dark:text-red-300",
                      urgency === "danger" && "text-amber-700 dark:text-amber-300",
                      (urgency === "warn" || urgency === "safe") && "text-foreground"
                    )}
                  >
                    {urgency === "overdue"
                      ? "Close date has passed"
                      : daysLeft === 0
                      ? "Closing today"
                      : "Target close date"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(map.deal.targetCloseDate)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {completedTasks} of {totalTasks} steps complete &middot; {progress}%
                  </p>
                </div>
              </div>

              <Timer
                className={cn(
                  "h-6 w-6 shrink-0 opacity-30",
                  urgency === "overdue" && "text-red-500",
                  urgency === "danger" && "text-amber-500",
                  urgency === "warn" && "text-amber-400",
                  urgency === "safe" && "text-primary"
                )}
              />
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div
                className={cn(
                  "h-1.5 rounded-full overflow-hidden",
                  urgency === "overdue" && "bg-red-100 dark:bg-red-950/50",
                  urgency === "danger" && "bg-amber-100 dark:bg-amber-950/50",
                  urgency === "warn" && "bg-amber-100/70 dark:bg-amber-950/30",
                  urgency === "safe" && "bg-primary/10"
                )}
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    urgency === "overdue" && "bg-red-500",
                    urgency === "danger" && "bg-amber-500",
                    urgency === "warn" && "bg-amber-400",
                    urgency === "safe" && "bg-primary"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Progress bar (no close date) */}
        {!map.deal.targetCloseDate && totalTasks > 0 && (
          <div className="glass-card rounded-2xl px-5 py-4 mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{completedTasks} of {totalTasks} steps complete</span>
              <span className="font-semibold text-primary">{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-primary/10">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* ── YOUR NEXT STEP ── */}
        {!allDone && nextClientTask && (
          <div className="mb-8 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/25 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-primary" fill="currentColor" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Your next step
              </span>
            </div>

            <h2 className="text-[15px] font-bold text-foreground mb-0.5 leading-snug">
              {nextClientTask.task.title}
            </h2>
            <p className="text-xs text-muted-foreground mb-3">
              {nextClientTask.phase.name}
            </p>

            {nextClientTask.task.description && (
              <p className="text-sm text-muted-foreground/90 mb-3 leading-relaxed">
                {nextClientTask.task.description}
              </p>
            )}

            {nextClientTask.task.successCriteria && (
              <div className="bg-background/70 rounded-xl px-3 py-2.5 mb-4 border border-border/50">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Done when
                </p>
                <p className="text-xs text-foreground leading-relaxed">
                  {nextClientTask.task.successCriteria}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 mb-4">
              {nextClientTask.task.targetDate && (
                <div className="flex items-center gap-1 text-xs font-medium text-foreground bg-background/60 border border-border/50 rounded-full px-2.5 py-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  Due {formatDate(nextClientTask.task.targetDate)}
                </div>
              )}
              {nextClientTask.task.isTbdWithClient && (
                <div className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-full px-2.5 py-1">
                  <Calendar className="h-3 w-3" />
                  Date TBD
                </div>
              )}
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
                  nextClientTask.task.owner === "CLIENT" &&
                    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
                  nextClientTask.task.owner === "JOINT" &&
                    "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400"
                )}
              >
                {nextClientTask.task.owner === "CLIENT" ? (
                  <>
                    <User className="h-2.5 w-2.5" /> You
                  </>
                ) : (
                  <>
                    <Users className="h-2.5 w-2.5" /> You + {organization.name}
                  </>
                )}
              </span>
            </div>

            {permissions.allowClientEdits && (
              <div className="flex flex-wrap gap-2">
                {nextClientTask.task.status === "NOT_STARTED" && (
                  <button
                    onClick={() => updateTaskStatus(nextClientTask.task.id, "IN_PROGRESS")}
                    disabled={updating === nextClientTask.task.id}
                    className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium bg-background border border-border text-foreground hover:bg-primary/5 transition-colors disabled:opacity-50"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Mark In Progress
                  </button>
                )}
                <button
                  onClick={() => updateTaskStatus(nextClientTask.task.id, "COMPLETE")}
                  disabled={updating === nextClientTask.task.id}
                  className="btn-glow inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark Complete
                </button>
              </div>
            )}
          </div>
        )}

        {/* All done celebration */}
        {allDone && (
          <div className="mb-8 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/25 p-6 text-center">
            <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
            <h2 className="text-base font-bold text-foreground mb-1">All steps complete!</h2>
            <p className="text-sm text-muted-foreground">
              You&apos;ve finished every action item in this plan.
            </p>
          </div>
        )}

        {/* ── TIMELINE ── */}
        {map.phases.length > 0 && (
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-5">
              Your roadmap
            </h3>

            <div>
              {map.phases.map((phase, index) => {
                const state = phaseStates[phase.id] ?? "upcoming";
                const isLast = index === map.phases.length - 1;
                const isExpanded = expandedPhases.has(phase.id);
                const phaseDone = phase.tasks.filter((t) => t.status === "COMPLETE").length;

                return (
                  <div key={phase.id} className="flex gap-3 sm:gap-4">

                    {/* Left column: dot + connecting line */}
                    <div className="flex flex-col items-center shrink-0 w-7">
                      <div className="pt-3.25">
                        <PhaseDot state={state} />
                      </div>
                      {!isLast && (
                        <div
                          className={cn(
                            "flex-1 w-0.5 my-1 min-h-6",
                            state === "complete" ? "bg-primary/40" : "bg-border/70"
                          )}
                        />
                      )}
                    </div>

                    {/* Right column: phase content */}
                    <div className="flex-1 pb-3 min-w-0">

                      {/* Phase toggle button */}
                      <button
                        type="button"
                        onClick={() => togglePhase(phase.id)}
                        className="w-full flex items-start gap-2 pt-3 pb-2 text-left group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={cn(
                                "text-sm font-semibold",
                                state === "complete" && "text-muted-foreground",
                                state === "active" && "text-foreground",
                                state === "upcoming" && "text-muted-foreground/60"
                              )}
                            >
                              {phase.name}
                            </span>
                            {state === "active" && (
                              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wide">
                                Now
                              </span>
                            )}
                            {state === "complete" && (
                              <span className="text-[11px] font-medium text-primary/70">
                                ✓ Done
                              </span>
                            )}
                          </div>
                          <p
                            className={cn(
                              "text-xs mt-0.5",
                              state === "complete" ? "text-primary/60" : "text-muted-foreground/70"
                            )}
                          >
                            {phaseDone}/{phase.tasks.length} complete
                          </p>
                        </div>

                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform shrink-0 mt-3.5",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </button>

                      {/* Upcoming phase task preview (collapsed) */}
                      {!isExpanded && state === "upcoming" && phase.tasks.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pb-3">
                          {phase.tasks.slice(0, 3).map((task) => (
                            <span
                              key={task.id}
                              className="text-[11px] text-muted-foreground/50 bg-muted/30 rounded-full px-2 py-0.5 max-w-37.5 truncate"
                            >
                              {task.title}
                            </span>
                          ))}
                          {phase.tasks.length > 3 && (
                            <span className="text-[11px] text-muted-foreground/40">
                              +{phase.tasks.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Expanded task list */}
                      {isExpanded && phase.tasks.length > 0 && (
                        <div className="space-y-2 pb-3">
                          {phase.tasks.map((task) => {
                            const canEdit =
                              permissions.allowClientEdits &&
                              (task.owner === "CLIENT" || task.owner === "JOINT");
                            const isNextTask = nextClientTask?.task.id === task.id;

                            return (
                              <div
                                key={task.id}
                                className={cn(
                                  "rounded-xl border p-3 transition-all",
                                  task.status === "COMPLETE" &&
                                    "opacity-50 bg-background/40 border-border/30",
                                  task.status !== "COMPLETE" &&
                                    isNextTask &&
                                    "border-primary/30 bg-primary/5",
                                  task.status !== "COMPLETE" &&
                                    !isNextTask &&
                                    task.owner === "PROVIDER" &&
                                    "bg-card/50 border-border/50",
                                  task.status !== "COMPLETE" &&
                                    !isNextTask &&
                                    task.owner !== "PROVIDER" &&
                                    "bg-card border-border",
                                  state === "upcoming" && "opacity-60"
                                )}
                              >
                                <div className="flex items-start gap-2.5">
                                  <div className="mt-0.5 shrink-0">
                                    {STATUS_ICONS[task.status]}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={cn(
                                        "text-sm font-medium leading-snug",
                                        task.status === "COMPLETE"
                                          ? "line-through text-muted-foreground"
                                          : "text-foreground"
                                      )}
                                    >
                                      {task.title}
                                      {isNextTask && (
                                        <span className="ml-1.5 inline-flex items-center rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                          up next
                                        </span>
                                      )}
                                    </p>

                                    {task.description && (
                                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                        {task.description}
                                      </p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                      {/* Owner badge */}
                                      <span
                                        className={cn(
                                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                                          task.owner === "PROVIDER" &&
                                            "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
                                          task.owner === "CLIENT" &&
                                            "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
                                          task.owner === "JOINT" &&
                                            "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400"
                                        )}
                                      >
                                        {task.owner === "PROVIDER" && (
                                          <Building2 className="h-2.5 w-2.5" />
                                        )}
                                        {task.owner === "CLIENT" && (
                                          <User className="h-2.5 w-2.5" />
                                        )}
                                        {task.owner === "JOINT" && (
                                          <Users className="h-2.5 w-2.5" />
                                        )}
                                        {task.owner === "PROVIDER"
                                          ? "Your vendor"
                                          : task.owner === "CLIENT"
                                          ? "You"
                                          : "Together"}
                                      </span>

                                      {task.targetDate && (
                                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                          <Calendar className="h-2.5 w-2.5" />
                                          {formatDate(task.targetDate)}
                                        </span>
                                      )}

                                      {task.isTbdWithClient && (
                                        <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                                          Date TBD
                                        </span>
                                      )}
                                    </div>

                                    {/* Action buttons for editable tasks */}
                                    {canEdit &&
                                      task.status !== "COMPLETE" &&
                                      state !== "upcoming" && (
                                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                                          {task.status === "NOT_STARTED" && (
                                            <button
                                              onClick={() =>
                                                updateTaskStatus(task.id, "IN_PROGRESS")
                                              }
                                              disabled={updating === task.id}
                                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium bg-background border border-border text-foreground hover:bg-primary/5 transition-colors disabled:opacity-50"
                                            >
                                              <Clock className="h-3 w-3" />
                                              Start
                                            </button>
                                          )}
                                          <button
                                            onClick={() =>
                                              updateTaskStatus(task.id, "COMPLETE")
                                            }
                                            disabled={updating === task.id}
                                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                                          >
                                            <CheckCircle2 className="h-3 w-3" />
                                            Complete
                                          </button>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {isExpanded && phase.tasks.length === 0 && (
                        <p className="text-xs text-muted-foreground pb-3">
                          No tasks in this phase.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {map.phases.length === 0 && (
          <div className="glass-card rounded-2xl text-center py-16">
            <p className="text-sm text-muted-foreground">No phases in this plan yet.</p>
          </div>
        )}

        <p className="text-center text-xs mt-12 text-muted-foreground">
          Powered by Antistall
        </p>
      </div>
    </div>
  );
}
