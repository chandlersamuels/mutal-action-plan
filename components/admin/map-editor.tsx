"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ChevronDown, ChevronRight, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MapWithPhases, MapTaskWithRelations } from "@/types";
import type { MapTask, MapShareToken, TaskOwner, TaskStatus } from "@prisma/client";

const STATUS_CLASSES: Record<TaskStatus, { className: string; label: string }> = {
  NOT_STARTED: { className: "bg-muted text-muted-foreground", label: "Not Started" },
  IN_PROGRESS: { className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", label: "In Progress" },
  COMPLETE: { className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", label: "Complete" },
  AT_RISK: { className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", label: "At Risk" },
  BLOCKED: { className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", label: "Blocked" },
};

const OWNER_LABELS: Record<TaskOwner, string> = {
  PROVIDER: "Provider",
  CLIENT: "Client",
  JOINT: "Joint",
};

interface Props {
  dealId: string;
  initialMap: MapWithPhases & { shareTokens: MapShareToken[] };
}

export function MapEditor({ dealId, initialMap }: Props) {
  const [map, setMap] = useState(initialMap);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    new Set(initialMap.phases.map((p) => p.id))
  );
  const [taskModal, setTaskModal] = useState<{
    mode: "create" | "edit";
    phaseId: string;
    task?: MapTask;
  } | null>(null);
  const [newPhaseName, setNewPhaseName] = useState("");
  const [addingPhase, setAddingPhase] = useState(false);

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

  async function addPhase() {
    if (!newPhaseName.trim()) return;
    const maxOrder = map.phases.reduce((m, p) => Math.max(m, p.displayOrder), -1);
    const res = await fetch(`/api/deals/${dealId}/map/phases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newPhaseName.trim(), displayOrder: maxOrder + 1 }),
    });
    if (res.ok) {
      setNewPhaseName("");
      setAddingPhase(false);
      await refreshMap();
    }
  }

  async function deletePhase(phaseId: string) {
    if (!confirm("Delete this phase and all its tasks?")) return;
    await fetch(`/api/deals/${dealId}/map/phases/${phaseId}`, { method: "DELETE" });
    await refreshMap();
  }

  async function deleteTask(taskId: string) {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/deals/${dealId}/map/tasks/${taskId}`, { method: "DELETE" });
    await refreshMap();
  }


  return (
    <div className="flex flex-col h-full bg-background">
      {/* Editor header */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-card/80 backdrop-blur-[12px] border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">
          {map.title}
        </h2>
      </div>

      {/* Phases */}
      <div className="flex-1 overflow-auto p-6 space-y-3">
        {map.phases.map((phase) => (
          <div
            key={phase.id}
            className="glass-card rounded-2xl overflow-hidden"
          >
            {/* Phase header */}
            <div
              className={cn(
                "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors group hover:bg-primary/5",
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
              <span className="text-xs mr-2 text-muted-foreground">
                {phase.tasks.length} tasks
              </span>
              <button
                className="flex items-center justify-center h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => { e.stopPropagation(); deletePhase(phase.id); }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Tasks */}
            {expandedPhases.has(phase.id) && (
              <div>
                {phase.tasks.length === 0 && (
                  <p className="px-5 py-4 text-sm text-muted-foreground">
                    No tasks yet.
                  </p>
                )}
                {phase.tasks.map((task) => {
                  const st = STATUS_CLASSES[task.status];
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 px-5 py-3 transition-colors group border-t border-border hover:bg-primary/5"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-sm font-medium cursor-pointer transition-colors text-foreground hover:text-primary"
                            onClick={() => setTaskModal({ mode: "edit", phaseId: phase.id, task })}
                          >
                            {task.title}
                          </span>
                          {!task.isClientVisible && (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
                              Internal
                            </span>
                          )}
                          {task.isForecastMilestone && (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                              {task.forecastProbability}%
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                          <span>{OWNER_LABELS[task.owner]}</span>
                          {task.targetDate && (
                            <>
                              <span>·</span>
                              <span>{new Date(task.targetDate).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium flex-shrink-0",
                          st.className
                        )}
                      >
                        {st.label}
                      </span>
                      <button
                        className="flex items-center justify-center h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}

                {/* Add task row */}
                <div className="px-5 py-2.5 border-t border-border">
                  <button
                    className="flex items-center gap-1.5 text-xs font-medium rounded-md px-2.5 py-1.5 transition-colors text-primary hover:bg-primary/10"
                    onClick={() => setTaskModal({ mode: "create", phaseId: phase.id })}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add task
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add phase */}
        {addingPhase ? (
          <div className="flex gap-2">
            <Input
              autoFocus
              value={newPhaseName}
              onChange={(e) => setNewPhaseName(e.target.value)}
              placeholder="Phase name"
              onKeyDown={(e) => e.key === "Enter" && addPhase()}
              className="rounded-xl"
            />
            <Button onClick={addPhase} className="btn-glow rounded-xl">Add</Button>
            <Button variant="outline" className="rounded-xl" onClick={() => { setAddingPhase(false); setNewPhaseName(""); }}>
              Cancel
            </Button>
          </div>
        ) : (
          <button
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium border-2 border-dashed transition-colors w-full border-primary/30 text-primary hover:bg-primary/[0.05] hover:border-primary/50"
            onClick={() => setAddingPhase(true)}
          >
            <Plus className="h-4 w-4" />
            Add phase
          </button>
        )}
      </div>

      {/* Task Modal */}
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

// ── Task Form Modal ────────────────────────────────────────────────

interface TaskModalProps {
  dealId: string;
  phaseId: string;
  task?: MapTask;
  displayOrder: number;
  onClose: () => void;
  onSave: () => void;
}

function TaskModal({ dealId, phaseId, task, displayOrder, onClose, onSave }: TaskModalProps) {
  const [form, setForm] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    owner: (task?.owner ?? "PROVIDER") as TaskOwner,
    status: (task?.status ?? "NOT_STARTED") as TaskStatus,
    targetDate: task?.targetDate ? new Date(task.targetDate).toISOString().split("T")[0] : "",
    estimatedDays: task?.estimatedDays?.toString() ?? "",
    successCriteria: task?.successCriteria ?? "",
    internalNotes: task?.internalNotes ?? "",
    isClientVisible: task?.isClientVisible ?? true,
    isForecastMilestone: task?.isForecastMilestone ?? false,
    forecastProbability: task?.forecastProbability?.toString() ?? "",
    isTbdWithClient: task?.isTbdWithClient ?? false,
  });
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload: Record<string, unknown> = {
      title: form.title,
      description: form.description || undefined,
      owner: form.owner,
      status: form.status,
      targetDate: form.targetDate ? new Date(form.targetDate).toISOString() : undefined,
      estimatedDays: form.estimatedDays ? parseInt(form.estimatedDays) : undefined,
      successCriteria: form.successCriteria || undefined,
      internalNotes: form.internalNotes || undefined,
      isClientVisible: form.isClientVisible,
      isForecastMilestone: form.isForecastMilestone,
      forecastProbability: form.isForecastMilestone && form.forecastProbability
        ? parseInt(form.forecastProbability)
        : undefined,
      isTbdWithClient: form.isTbdWithClient,
    };

    let res: Response;
    if (task) {
      res = await fetch(`/api/deals/${dealId}/map/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      payload.phaseId = phaseId;
      payload.displayOrder = displayOrder;
      res = await fetch(`/api/deals/${dealId}/map/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setLoading(false);
    if (res.ok) onSave();
  }

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">{task ? "Edit task" : "Add task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 mt-1">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Owner</Label>
              <Select value={form.owner} onValueChange={(v) => setForm({ ...form, owner: v as TaskOwner })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROVIDER">Provider</SelectItem>
                  <SelectItem value="CLIENT">Client</SelectItem>
                  <SelectItem value="JOINT">Joint</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TaskStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_CLASSES) as TaskStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_CLASSES[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Target date</Label>
              <Input
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Estimated days</Label>
              <Input
                type="number"
                min="1"
                value={form.estimatedDays}
                onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Success criteria</Label>
            <Textarea
              value={form.successCriteria}
              onChange={(e) => setForm({ ...form, successCriteria: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Internal notes (not visible to client)</Label>
            <Textarea
              value={form.internalNotes}
              onChange={(e) => setForm({ ...form, internalNotes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-3 pt-3 rounded-xl px-4 py-3 bg-muted border border-border">
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="isClientVisible"
                checked={form.isClientVisible}
                onCheckedChange={(c) => setForm({ ...form, isClientVisible: !!c })}
              />
              <Label htmlFor="isClientVisible" className="cursor-pointer text-sm">
                Visible to client
              </Label>
            </div>
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="isTbdWithClient"
                checked={form.isTbdWithClient}
                onCheckedChange={(c) => setForm({ ...form, isTbdWithClient: !!c })}
              />
              <Label htmlFor="isTbdWithClient" className="cursor-pointer text-sm">
                TBD with client (date not set)
              </Label>
            </div>
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="isForecastMilestone"
                checked={form.isForecastMilestone}
                onCheckedChange={(c) => setForm({ ...form, isForecastMilestone: !!c })}
              />
              <Label htmlFor="isForecastMilestone" className="cursor-pointer text-sm">
                Forecast milestone
              </Label>
            </div>
            {form.isForecastMilestone && (
              <div className="pl-6 space-y-1.5">
                <Label className="text-sm font-medium">Forecast probability (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.forecastProbability}
                  onChange={(e) => setForm({ ...form, forecastProbability: e.target.value })}
                  placeholder="e.g. 65"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={loading} className="btn-glow rounded-xl">
              {loading ? "Saving…" : "Save task"}
            </Button>
            <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
