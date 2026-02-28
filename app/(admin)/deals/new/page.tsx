"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, AlertCircle } from "lucide-react";
import type { Client, DealStage } from "@prisma/client";

const STAGES: { value: DealStage; label: string }[] = [
  { value: "DISCOVERY", label: "Discovery" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "EVALUATION", label: "Evaluation" },
  { value: "SOW_REVIEW", label: "SOW Review" },
  { value: "NEGOTIATION", label: "Negotiation" },
];

export default function NewDealPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({
    name: "",
    clientId: "",
    stage: "DISCOVERY" as DealStage,
    dealValue: "",
    targetCloseDate: "",
  });
  const [newClientName, setNewClientName] = useState("");
  const [showNewClient, setShowNewClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then(setClients)
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let clientId = form.clientId;

    if (showNewClient && newClientName) {
      const clientRes = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: newClientName }),
      });
      if (!clientRes.ok) {
        setError("Failed to create client.");
        setLoading(false);
        return;
      }
      const client = await clientRes.json();
      clientId = client.id;
    }

    if (!clientId) {
      setError("Please select or create a client.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        clientId,
        stage: form.stage,
        dealValue: form.dealValue ? parseFloat(form.dealValue) : undefined,
        targetCloseDate: form.targetCloseDate ? new Date(form.targetCloseDate).toISOString() : undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to create deal.");
    } else {
      router.push(`/deals/${data.id}`);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link
        href="/deals"
        className="inline-flex items-center gap-1.5 text-sm mb-7 transition-colors text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to deals
      </Link>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h1 className="text-lg font-semibold text-foreground">
            New Deal
          </h1>
          <p className="text-sm mt-0.5 text-muted-foreground">
            Fill in the details to create a new deal.
          </p>
        </div>

        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm border bg-destructive/10 border-destructive/20 text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                Deal name *
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Acme Corp — Q1 Expansion"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                Client *
              </Label>
              {!showNewClient ? (
                <div className="flex gap-2">
                  <Select
                    value={form.clientId}
                    onValueChange={(v) => setForm({ ...form, clientId: v })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select client…" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewClient(true)}
                  >
                    New client
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Client company name"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowNewClient(false); setNewClientName(""); }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                Stage
              </Label>
              <Select
                value={form.stage}
                onValueChange={(v) => setForm({ ...form, stage: v as DealStage })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">
                  Deal value ($)
                </Label>
                <Input
                  id="dealValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.dealValue}
                  onChange={(e) => setForm({ ...form, dealValue: e.target.value })}
                  placeholder="50000"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">
                  Target close date
                </Label>
                <Input
                  id="targetCloseDate"
                  type="date"
                  value={form.targetCloseDate}
                  onChange={(e) => setForm({ ...form, targetCloseDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="btn-glow">
                {loading ? "Creating…" : "Create deal"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/deals">Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
