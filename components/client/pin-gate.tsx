"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, AlertCircle } from "lucide-react";

interface Props {
  shareToken: string;
  orgName: string;
}

export function PinGate({ shareToken, orgName }: Props) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pin.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/client/${shareToken}/verify-pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: pin.trim() }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Incorrect PIN. Please try again.");
      setPin("");
      inputRef.current?.focus();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen app-bg flex items-center justify-center px-4">
      <div className="glass-card rounded-2xl p-8 w-full max-w-sm text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-foreground">Protected plan</h1>
          <p className="text-sm text-muted-foreground">
            {orgName} has protected this action plan with a PIN.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9a-zA-Z]*"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={16}
            autoFocus
            className="text-center tracking-widest text-lg h-12 rounded-xl"
          />

          {error && (
            <p className="flex items-center justify-center gap-1.5 text-sm text-destructive">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full btn-glow rounded-xl"
            disabled={loading || !pin.trim()}
          >
            {loading ? "Verifying…" : "Access plan"}
          </Button>
        </form>
      </div>
    </div>
  );
}
