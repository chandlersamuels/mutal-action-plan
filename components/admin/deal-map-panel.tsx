"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronRight, MapIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MapShareToken, TaskStatus } from "@prisma/client";
import type { MapWithPhases } from "@/types";
import Link from "next/link";
import { DealShareButton } from "@/components/admin/deal-share-button";
import { TaskModal } from "@/components/admin/map-editor";
import type { MapTask } from "@prisma/client";

const STATUS_CLASSES: Record<TaskStatus, { dot: string; badge: string; label: string }> = {
  NOT_STARTED: {
    dot: "bg-muted-foreground/40",
    badge: "bg-muted text-muted-foreground",
    label: "Not Started",
  },
  IN_PROGRESS: {
    dot: "bg-primary",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    label: "In Progress",
  },
  COMPLETE: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    label: "Complete",
  },
  AT_RISK: {
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    label: "At Risk",
  },
  BLOCKED: {
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    label: "Blocked",
  },
};

type DealMap = MapWithPhases & { shareTokens: MapShareToken[] };

interface Props {
  dealId: string;
  map: DealMap;
}

export function DealMapPanel({ dealId, map: initialMap }: Props) {
  const [map, setMap] = useState(initialMap);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    new Set(initialMap.phases.map((p) => p.id))
  );
  const [taskModal, setTaskModal] = useState<{
    phaseId: string;
    task: MapTask;
  } | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  async function refreshMap() {
    const res = await fetch(`/api/deals/${dealId}/map`);
    if (res.ok) setMap(await res.json());
  }

  function togglePhase(phaseId: string) {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  }

  async function updateTaskStatus(taskId: string, status: TaskStatus) {
    setSaving(taskId);
    // Optimistic update
    setMap((prev) => ({
      ...prev,
      phases: prev.phases.map((phase) => ({
        ...phase,
        tasks: phase.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
      })),
    }));
    await fetch(`/api/deals/${dealId}/map/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving(null);
  }

  const hasPhases = map.phases.length > 0;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12">
          <MapIcon className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">Action Plan</h2>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link href={`/deals/${dealId}/map`}>Edit plan</Link>
          </Button>
          <DealShareButton
            dealId={dealId}
            mapId={map.id}
            hasPhases={hasPhases}
            initialTokens={map.shareTokens}
          />
        </div>
      </div>

      {/* Body */}
      {!hasPhases ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Your plan has no phases yet. Open the editor to build it out.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href={`/deals/${dealId}/map`}>Open editor</Link>
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {map.phases.map((phase) => {
            const total = phase.tasks.length;
            const done = phase.tasks.filter((t) => t.status === "COMPLETE").length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const isExpanded = expandedPhases.has(phase.id);

            return (
              <div key={phase.id}>
                {/* Phase header */}
                <div
                  className="flex items-center gap-2.5 px-5 py-3 cursor-pointer select-none hover:bg-muted/40 transition-colors"
                  onClick={() => togglePhase(phase.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <p className="text-sm font-medium text-foreground flex-1 truncate">
                    {phase.name}
                  </p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {done}/{total} complete
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-0.5 bg-muted mx-5 mb-0">
                  <div
                    className="h-0.5 bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Tasks */}
                {isExpanded && phase.tasks.length > 0 && (
                  <div className="py-1">
                    {phase.tasks.map((task) => {
                      const st = STATUS_CLASSES[task.status];
                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 px-5 py-2 border-t border-border/40"
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full shrink-0",
                              st.dot
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <button
                              className="text-sm text-foreground hover:text-primary transition-colors text-left w-full truncate"
                              onClick={() =>
                                setTaskModal({ phaseId: phase.id, task })
                              }
                            >
                              {task.title}
                            </button>
                            {task.targetDate && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(task.targetDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <Select
                            value={task.status}
                            onValueChange={(v) =>
                              updateTaskStatus(task.id, v as TaskStatus)
                            }
                            disabled={saving === task.id}
                          >
                            <SelectTrigger
                              className={cn(
                                "h-7 w-[118px] rounded-full text-xs px-2.5 border-0 shrink-0 focus:ring-0",
                                st.badge
                              )}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(Object.keys(STATUS_CLASSES) as TaskStatus[]).map(
                                (s) => (
                                  <SelectItem key={s} value={s} className="text-xs">
                                    {STATUS_CLASSES[s].label}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Task edit modal */}
      {taskModal && (
        <TaskModal
          dealId={dealId}
          phaseId={taskModal.phaseId}
          task={taskModal.task}
          displayOrder={
            map.phases.find((p) => p.id === taskModal.phaseId)?.tasks.length ?? 0
          }
          onClose={() => setTaskModal(null)}
          onSave={async () => {
            setTaskModal(null);
            await refreshMap();
          }}
        />
      )}
    </div>
  );
}
