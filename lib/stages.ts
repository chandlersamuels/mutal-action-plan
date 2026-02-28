export interface StageConfig {
  key: string;
  label: string;
  color: string;       // key into COLOR_CLASSES / COLOR_DOTS
  isTerminal: boolean; // e.g. Closed Won / Closed Lost
  displayOrder: number;
}

export const DEFAULT_STAGES: StageConfig[] = [
  { key: "DISCOVERY",   label: "Discovery",   color: "slate",   isTerminal: false, displayOrder: 0 },
  { key: "PROPOSAL",    label: "Proposal",    color: "sky",     isTerminal: false, displayOrder: 1 },
  { key: "EVALUATION",  label: "Evaluation",  color: "amber",   isTerminal: false, displayOrder: 2 },
  { key: "SOW_REVIEW",  label: "SOW Review",  color: "orange",  isTerminal: false, displayOrder: 3 },
  { key: "NEGOTIATION", label: "Negotiation", color: "violet",  isTerminal: false, displayOrder: 4 },
  { key: "CLOSED_WON",  label: "Closed Won",  color: "emerald", isTerminal: true,  displayOrder: 5 },
  { key: "CLOSED_LOST", label: "Closed Lost", color: "red",     isTerminal: true,  displayOrder: 6 },
];

// Full Tailwind class strings — must be literal so Tailwind includes them in the bundle
export const COLOR_CLASSES: Record<string, string> = {
  slate:   "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300",
  sky:     "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
  amber:   "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  orange:  "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  violet:  "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  red:     "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300",
  blue:    "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  teal:    "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
  pink:    "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300",
  indigo:  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
  rose:    "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
};

// Solid dot colors for the color picker UI
export const COLOR_DOTS: Record<string, string> = {
  slate:   "bg-slate-400",
  sky:     "bg-sky-400",
  amber:   "bg-amber-400",
  orange:  "bg-orange-400",
  violet:  "bg-violet-500",
  emerald: "bg-emerald-500",
  red:     "bg-red-400",
  blue:    "bg-blue-400",
  teal:    "bg-teal-400",
  pink:    "bg-pink-400",
  indigo:  "bg-indigo-400",
  rose:    "bg-rose-400",
};

export const COLOR_OPTIONS = Object.keys(COLOR_CLASSES);

export function resolveStages(stageLabels: unknown): StageConfig[] {
  if (!stageLabels) return [...DEFAULT_STAGES];

  // New format: StageConfig[]
  if (Array.isArray(stageLabels) && stageLabels.length > 0) {
    return stageLabels as StageConfig[];
  }

  // Old format: Record<string, string> label map — migrate transparently
  if (typeof stageLabels === "object" && !Array.isArray(stageLabels)) {
    const map = stageLabels as Record<string, string>;
    return DEFAULT_STAGES.map((s) => ({ ...s, label: map[s.key] ?? s.label }));
  }

  return [...DEFAULT_STAGES];
}

export function stageColorClass(stages: StageConfig[], key: string): string {
  const stage = stages.find((s) => s.key === key);
  return COLOR_CLASSES[stage?.color ?? "slate"] ?? COLOR_CLASSES.slate;
}

export function stageLabel(stages: StageConfig[], key: string): string {
  return stages.find((s) => s.key === key)?.label ?? key;
}
