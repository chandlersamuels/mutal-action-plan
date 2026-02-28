"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface Props {
  /** Current URL stored in the database (may be null) */
  currentUrl: string | null;
  /** Called with the new URL after a successful upload, or null when removed */
  onSave: (url: string | null) => Promise<void>;
  /** Shown above the upload button */
  label: string;
  /** Query param passed to /api/upload?type=... */
  uploadType: string;
}

export function LogoUpload({ currentUrl, onSave, label, uploadType }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`/api/upload?type=${uploadType}`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Upload failed");
        return;
      }

      const { url } = await res.json();
      setPreview(url);
      setSaving(true);
      await onSave(url);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setSaving(false);
      // reset input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setPreview(null);
    setSaving(true);
    try {
      await onSave(null);
    } finally {
      setSaving(false);
    }
  }

  const busy = uploading || saving;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">{label}</p>

      {preview ? (
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-border bg-muted flex-shrink-0">
            <Image src={preview} alt="Logo" fill className="object-contain p-1" unoptimized />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="gap-1.5"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Replace
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={busy}
              className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="gap-2"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          Upload logo
        </Button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground">PNG, JPG, WebP or SVG · max 2 MB</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
