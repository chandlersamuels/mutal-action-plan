"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Loader2, X, ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateSummary {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  phaseCount: number;
  taskCount: number;
}

interface Props {
  dealId: string;
  dealName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "pick" | "templates";

export function TemplatePickerDialog({ dealId, dealName, open, onOpenChange }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("pick");
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep("pick");
      setSelectedId(null);
    }
  }, [open]);

  function handleShowTemplates() {
    setStep("templates");
    if (templates.length > 0) return;
    setLoadingTemplates(true);
    fetch("/api/templates")
      .then((r) => r.json())
      .then((data: TemplateSummary[]) => {
        setTemplates(data);
        // Pre-select the default template
        const def = data.find((t) => t.isDefault);
        if (def) setSelectedId(def.id);
      })
      .finally(() => setLoadingTemplates(false));
  }

  async function handleCreate(templateId?: string) {
    setCreating(true);
    const res = await fetch(`/api/deals/${dealId}/map`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${dealName} — Action Plan`,
        ...(templateId ? { templateId } : {}),
      }),
    });
    setCreating(false);
    if (res.ok) {
      onOpenChange(false);
      router.push(`/deals/${dealId}/map`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-md rounded-2xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-2">
            {step === "templates" && (
              <button
                onClick={() => setStep("pick")}
                className="flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h2 className="text-base font-semibold text-foreground">
              {step === "pick" ? "Start your action plan" : "Choose a template"}
            </h2>
          </div>
          <DialogClose className="flex items-center justify-center h-6 w-6 rounded-md opacity-60 hover:opacity-100 hover:bg-muted transition-all">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          {step === "pick" ? (
            <div className="grid grid-cols-2 gap-3">
              {/* Start blank */}
              <button
                disabled={creating}
                onClick={() => handleCreate()}
                className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-5 text-center transition-colors hover:bg-muted/60 hover:border-border/80 disabled:cursor-default"
              >
                {creating ? (
                  <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">Start blank</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Build from scratch</p>
                </div>
              </button>

              {/* From template */}
              <button
                onClick={handleShowTemplates}
                className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-5 text-center transition-colors hover:bg-muted/60 hover:border-border/80"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">From template</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Start with a preset</p>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {loadingTemplates ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedId(template.id)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors border",
                        selectedId === template.id
                          ? "border-primary/50 bg-primary/5"
                          : "border-border bg-muted/30 hover:bg-muted/60"
                      )}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground truncate">{template.name}</span>
                          {template.isDefault && (
                            <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium bg-primary/10 text-primary flex-shrink-0">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {template.phaseCount} phases · {template.taskCount} tasks
                        </p>
                      </div>
                      {selectedId === template.id && (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </button>
                  ))}

                  <Button
                    className="w-full btn-glow rounded-xl mt-1"
                    disabled={!selectedId || creating}
                    onClick={() => selectedId && handleCreate(selectedId)}
                  >
                    {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Use this template
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
