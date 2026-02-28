"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2, Plus, Copy, Check, Trash2, Lock, LockOpen } from "lucide-react";
import type { MapShareToken } from "@prisma/client";

interface Props {
  dealId: string;
  mapId: string | null;
  hasPhases: boolean;
  initialTokens: MapShareToken[];
}

export function DealShareButton({ dealId, mapId, hasPhases, initialTokens }: Props) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<MapShareToken | null>(initialTokens[0] ?? null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [pinSaving, setPinSaving] = useState(false);

  const canShare = !!mapId && hasPhases;
  const isPinProtected = !!token?.pinCodeHash;

  async function createShareLink() {
    if (!mapId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/deals/${dealId}/map/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowClientEdits: true, allowClientNotes: true }),
      });
      if (res.ok) {
        setToken(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }

  async function revokeLink() {
    if (!token) return;
    await fetch(`/api/deals/${dealId}/map/share/${token.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: false }),
    });
    setToken(null);
  }

  async function savePin() {
    if (!token) return;
    setPinSaving(true);
    const res = await fetch(`/api/deals/${dealId}/map/share/${token.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinCode: pinValue.trim() || null }),
    });
    if (res.ok) {
      setToken(await res.json());
      setShowPinInput(false);
      setPinValue("");
    }
    setPinSaving(false);
  }

  async function removePin() {
    if (!token) return;
    setPinSaving(true);
    const res = await fetch(`/api/deals/${dealId}/map/share/${token.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinCode: null }),
    });
    if (res.ok) {
      setToken(await res.json());
    }
    setPinSaving(false);
  }

  function copyShareUrl() {
    if (!token) return;
    navigator.clipboard.writeText(`${window.location.origin}/map/${token.token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 shrink-0"
        disabled={!canShare}
        onClick={() => setOpen(true)}
      >
        <Link2 className="h-3.5 w-3.5" />
        {token ? "Manage link" : "Share"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">Share this Action Plan</DialogTitle>
          </DialogHeader>

          <div className="mt-1">
            {token ? (
              <div className="space-y-4">
                {/* Link display */}
                <div className="rounded-xl bg-muted border border-border p-3.5 space-y-2.5">
                  <code className="block text-xs text-foreground break-all leading-relaxed">
                    {`${window.location.origin}/map/${token.token}`}
                  </code>
                  <div className="flex items-center gap-2 pt-1 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 h-7 px-2.5 text-xs"
                      onClick={copyShareUrl}
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied!" : "Copy link"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 h-7 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                      onClick={revokeLink}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Revoke
                    </Button>
                  </div>
                </div>

                {/* PIN protection */}
                <div className="rounded-xl border border-border p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isPinProtected
                        ? <Lock className="h-3.5 w-3.5 text-primary" />
                        : <LockOpen className="h-3.5 w-3.5 text-muted-foreground" />}
                      <span className="text-xs font-medium text-foreground">PIN protection</span>
                      {isPinProtected && (
                        <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                          On
                        </span>
                      )}
                    </div>
                    {isPinProtected ? (
                      <div className="flex gap-1.5">
                        <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs"
                          onClick={() => setShowPinInput(!showPinInput)}>
                          Change PIN
                        </Button>
                        <Button variant="ghost" size="sm"
                          className="h-7 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={removePin} disabled={pinSaving}>
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs"
                        onClick={() => setShowPinInput(!showPinInput)}>
                        Add PIN
                      </Button>
                    )}
                  </div>

                  {showPinInput && (
                    <div className="space-y-2 pt-1 border-t border-border">
                      <Label className="text-xs">
                        {isPinProtected ? "New PIN" : "Set a PIN (4–16 characters)"}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={pinValue}
                          onChange={(e) => setPinValue(e.target.value)}
                          placeholder="e.g. 1234"
                          maxLength={16}
                          className="h-8 text-sm rounded-lg flex-1"
                        />
                        <Button size="sm" className="h-8 px-3 text-xs rounded-lg"
                          onClick={savePin} disabled={pinSaving || pinValue.trim().length < 4}>
                          {pinSaving ? "Saving…" : "Save"}
                        </Button>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {isPinProtected
                      ? "Clients must enter this PIN before viewing the plan."
                      : "Optionally require a PIN before clients can view the plan."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Generate a secure link to share this action plan with your client.
                </p>
                <Button
                  onClick={createShareLink}
                  disabled={loading}
                  className="w-full btn-glow gap-2 rounded-xl"
                >
                  <Plus className="h-4 w-4" />
                  Generate share link
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
