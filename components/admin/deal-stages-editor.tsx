"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Loader2, Trash2, Plus, AlertTriangle, GripVertical } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  type StageConfig,
  COLOR_DOTS,
  COLOR_OPTIONS,
} from "@/lib/stages";

interface Props {
  initialStages: StageConfig[];
}

let nextKey = Date.now();
function genKey() { return `CUSTOM_${nextKey++}`; }

export function DealStagesEditor({ initialStages }: Props) {
  const [stages, setStages] = useState<StageConfig[]>(initialStages);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("blue");
  const [newTerminal, setNewTerminal] = useState(false);
  const [addingNew, setAddingNew] = useState(false);

  const isDirty = JSON.stringify(stages) !== JSON.stringify(initialStages);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setStages((prev) => {
      const oldIndex = prev.findIndex((s) => s.key === active.id);
      const newIndex = prev.findIndex((s) => s.key === over.id);
      return arrayMove(prev, oldIndex, newIndex).map((s, i) => ({ ...s, displayOrder: i }));
    });
  }

  function updateStage(index: number, patch: Partial<StageConfig>) {
    setStages((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function deleteStage(index: number) {
    setStages((prev) => prev.filter((_, i) => i !== index));
  }

  function addStage() {
    if (!newLabel.trim()) return;
    setStages((prev) => [
      ...prev,
      {
        key: genKey(),
        label: newLabel.trim(),
        color: newColor,
        isTerminal: newTerminal,
        displayOrder: prev.length,
      },
    ]);
    setNewLabel("");
    setNewColor("blue");
    setNewTerminal(false);
    setAddingNew(false);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/settings/stages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stages }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="space-y-2">
      {/* Column headers */}
      <div className="grid grid-cols-[16px_auto_1fr_72px_auto] gap-2 items-center px-1 pb-1">
        <span />
        <span />
        <span className="text-xs font-medium text-muted-foreground">Stage name</span>
        <span className="text-xs font-medium text-muted-foreground w-[72px] text-center">Active</span>
        <span className="w-7" />
      </div>

      {/* Sortable list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stages.map((s) => s.key)} strategy={verticalListSortingStrategy}>
          {stages.map((stage, index) => (
            <SortableStageRow
              key={stage.key}
              stage={stage}
              onUpdate={(patch) => updateStage(index, patch)}
              onDelete={() => deleteStage(index)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Add new stage row */}
      {addingNew ? (
        <div className="grid grid-cols-[16px_auto_1fr_72px_auto] gap-2 items-center pt-1">
          <span />
          <ColorPicker value={newColor} onChange={setNewColor} />
          <Input
            autoFocus
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addStage(); if (e.key === "Escape") setAddingNew(false); }}
            placeholder="Stage name"
            className="h-8 rounded-lg text-sm"
          />
          <div className="flex justify-center w-[72px]">
            <Switch
              checked={!newTerminal}
              onCheckedChange={(v) => setNewTerminal(!v)}
              title="Toggle stage visibility"
            />
          </div>
          <button
            onClick={addStage}
            disabled={!newLabel.trim()}
            className="flex items-center justify-center h-7 w-7 rounded-md text-primary hover:bg-primary/10 transition-colors disabled:opacity-30"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAddingNew(true)}
          className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-1 px-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Add stage
        </button>
      )}

      {stages.length > 0 && stages.every((s) => s.isTerminal) && (
        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 px-1">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          At least one stage should be active.
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button
          size="sm"
          className="btn-glow rounded-xl"
          disabled={!isDirty || saving}
          onClick={handleSave}
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
          {saved && <Check className="h-3.5 w-3.5 mr-1.5" />}
          {saved ? "Saved" : "Save changes"}
        </Button>
        {isDirty && !saving && (
          <span className="text-xs text-muted-foreground">Unsaved changes</span>
        )}
      </div>
    </div>
  );
}

// ── Sortable row ──────────────────────────────────────────────────────

interface RowProps {
  stage: StageConfig;
  onUpdate: (patch: Partial<StageConfig>) => void;
  onDelete: () => void;
}

function SortableStageRow({ stage, onUpdate, onDelete }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stage.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "grid grid-cols-[16px_auto_1fr_72px_auto] gap-2 items-center",
        isDragging && "opacity-50 z-50"
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex items-center justify-center text-muted-foreground/30 hover:text-muted-foreground transition-colors cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Color picker */}
      <ColorPicker value={stage.color} onChange={(c) => onUpdate({ color: c })} />

      {/* Label */}
      <Input
        value={stage.label}
        onChange={(e) => onUpdate({ label: e.target.value })}
        className="h-8 rounded-lg text-sm"
      />

      {/* Active toggle */}
      <div className="flex justify-center w-[72px]">
        <Switch
          checked={!stage.isTerminal}
          onCheckedChange={(v) => onUpdate({ isTerminal: !v })}
          title="Toggle stage visibility"
        />
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Color picker ──────────────────────────────────────────────────────

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "h-8 w-8 rounded-lg border border-border/60 transition-opacity hover:opacity-80 flex-shrink-0",
          COLOR_DOTS[value] ?? "bg-slate-400"
        )}
        title="Change color"
      />
      {open && (
        <div className="absolute left-0 top-9 z-20 bg-popover border border-border rounded-xl p-2 shadow-lg grid grid-cols-4 gap-1.5 w-[106px]">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => { onChange(c); setOpen(false); }}
              className={cn(
                "h-6 w-6 rounded-md transition-all hover:scale-110",
                COLOR_DOTS[c],
                value === c && "ring-2 ring-offset-1 ring-foreground"
              )}
              title={c}
            />
          ))}
        </div>
      )}
    </div>
  );
}
