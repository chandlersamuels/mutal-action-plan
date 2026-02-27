"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronRight, CheckCircle2, Circle, AlertCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskStatus, TaskOwner } from "@prisma/client";

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
    client: { companyName: string };
  };
  phases: ClientPhase[];
}

interface Props {
  shareToken: string;
  initialMap: ClientMap;
  permissions: { allowClientEdits: boolean; allowClientNotes: boolean };
}

const STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  NOT_STARTED: <Circle className="h-4 w-4 text-muted-foreground" />,
  IN_PROGRESS: <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />,
  COMPLETE: <CheckCircle2 className="h-4 w-4 text-primary" />,
  AT_RISK: <AlertCircle className="h-4 w-4 text-amber-500 dark:text-amber-400" />,
  BLOCKED: <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />,
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETE: "Complete",
  AT_RISK: "At Risk",
  BLOCKED: "Blocked",
};

const OWNER_CLASSES: Record<TaskOwner, { className: string; label: string }> = {
  PROVIDER: { className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", label: "Provider" },
  CLIENT: { className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", label: "Client" },
  JOINT: { className: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300", label: "Joint" },
};

const EDITABLE_STATUSES: TaskStatus[] = ["IN_PROGRESS", "COMPLETE", "AT_RISK", "BLOCKED"];

export function ClientMapView({ shareToken, initialMap, permissions }: Props) {
  const [map, setMap] = useState(initialMap);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    new Set(initialMap.phases.map((p) => p.id))
  );
  const [updating, setUpdating] = useState<string | null>(null);

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
            task.id === taskId ? { ...task, status: updated.status } : task
          ),
        })),
      }));
    }
    setUpdating(null);
  }

  const totalTasks = map.phases.reduce((s, p) => s + p.tasks.length, 0);
  const completedTasks = map.phases.reduce(
    (s, p) => s + p.tasks.filter((t) => t.status === "COMPLETE").length,
    0
  );
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen app-bg">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest mb-2 text-primary">
            {map.deal.client.companyName} × Provider
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {map.title}
          </h1>

          {/* Progress */}
          <div className="mt-5 glass-card rounded-2xl px-5 py-4">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-sm font-medium text-foreground">
                {completedTasks} of {totalTasks} tasks complete
              </span>
              <span className="text-sm font-bold tabular-nums text-primary">
                {progress}%
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden bg-border">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, oklch(0.72 0.21 149), oklch(0.65 0.22 158))",
                }}
              />
            </div>
          </div>
        </div>

        {/* Phases */}
        <div className="space-y-3">
          {map.phases.map((phase) => {
            const phaseDone = phase.tasks.filter((t) => t.status === "COMPLETE").length;
            const phaseTotal = phase.tasks.length;
            const phaseProgress = phaseTotal > 0 ? (phaseDone / phaseTotal) * 100 : 0;

            return (
              <div
                key={phase.id}
                className="glass-card rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  className={cn(
                    "w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-primary/5",
                    expandedPhases.has(phase.id) && "border-b border-border"
                  )}
                  onClick={() => togglePhase(phase.id)}
                >
                  {expandedPhases.has(phase.id) ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  )}
                  <span className="text-sm font-semibold flex-1 text-foreground">
                    {phase.name}
                  </span>
                  {/* Mini progress bar */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="h-1.5 w-16 rounded-full overflow-hidden bg-border">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${phaseProgress}%`,
                          background: "oklch(0.7248 0.2145 145.7)",
                        }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {phaseDone}/{phaseTotal}
                    </span>
                  </div>
                </button>

                {expandedPhases.has(phase.id) && (
                  <div className="divide-y divide-border">
                    {phase.tasks.length === 0 && (
                      <p className="px-5 py-4 text-sm text-muted-foreground">
                        No tasks in this phase.
                      </p>
                    )}
                    {phase.tasks.map((task) => {
                      const canEdit =
                        permissions.allowClientEdits &&
                        (task.owner === "CLIENT" || task.owner === "JOINT");
                      const ownerStyle = OWNER_CLASSES[task.owner];

                      return (
                        <div
                          key={task.id}
                          className="px-5 py-4 flex items-start gap-4"
                        >
                          <div className="mt-0.5 flex-shrink-0">{STATUS_ICONS[task.status]}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p
                                  className={cn(
                                    "text-sm font-medium",
                                    task.status === "COMPLETE"
                                      ? "line-through text-muted-foreground"
                                      : "text-foreground"
                                  )}
                                >
                                  {task.title}
                                </p>
                                {task.description && (
                                  <p className="text-xs mt-1 text-muted-foreground">
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                  <span
                                    className={cn(
                                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                                      ownerStyle.className
                                    )}
                                  >
                                    {ownerStyle.label}
                                  </span>
                                  {task.targetDate && (
                                    <span className="text-xs text-muted-foreground">
                                      Due {new Date(task.targetDate).toLocaleDateString()}
                                    </span>
                                  )}
                                  {task.isTbdWithClient && (
                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                      Date TBD
                                    </span>
                                  )}
                                </div>
                              </div>

                              {canEdit && (
                                <Select
                                  value={task.status}
                                  onValueChange={(v) => updateTaskStatus(task.id, v as TaskStatus)}
                                  disabled={updating === task.id}
                                >
                                  <SelectTrigger className="w-36 h-8 text-xs rounded-lg flex-shrink-0">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="NOT_STARTED" disabled>Not Started</SelectItem>
                                    {EDITABLE_STATUSES.map((s) => (
                                      <SelectItem key={s} value={s}>
                                        {STATUS_LABELS[s]}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {map.phases.length === 0 && (
          <div className="glass-card rounded-2xl text-center py-16">
            <p className="text-sm text-muted-foreground">
              No phases in this plan yet.
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs mt-10 text-muted-foreground">
          Powered by Antistall
        </p>
      </div>
    </div>
  );
}
