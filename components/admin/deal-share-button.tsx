"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link2, Plus, Copy, Check, Trash2 } from "lucide-react";
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

  const canShare = !!mapId && hasPhases;

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
              <div className="space-y-3">
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
                <p className="text-xs text-muted-foreground">
                  Anyone with this link can view the action plan. Revoke it to disable access.
                </p>
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
