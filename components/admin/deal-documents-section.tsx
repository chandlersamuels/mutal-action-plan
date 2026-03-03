"use client";

import { useRef, useState } from "react";
import {
  File,
  FileText,
  FileType,
  Image as ImageIcon,
  Presentation,
  Sheet,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Pencil,
  Check,
  X,
  Loader2,
} from "lucide-react";

interface DealDocument {
  id: string;
  name: string;
  blobUrl: string;
  mimeType: string;
  fileSize: number;
  isClientVisible: boolean;
  createdAt: string;
}

interface Props {
  dealId: string;
  initialDocuments: DealDocument[];
}

function fileIcon(mimeType: string) {
  if (mimeType === "application/pdf") return <FileText className="h-4 w-4 text-red-500" />;
  if (
    mimeType === "application/vnd.ms-powerpoint" ||
    mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  )
    return <Presentation className="h-4 w-4 text-orange-500" />;
  if (
    mimeType === "application/msword" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return <FileType className="h-4 w-4 text-blue-500" />;
  if (
    mimeType === "application/vnd.ms-excel" ||
    mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  )
    return <Sheet className="h-4 w-4 text-green-600" />;
  if (mimeType.startsWith("image/")) return <ImageIcon className="h-4 w-4 text-violet-500" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DealDocumentsSection({ dealId, initialDocuments }: Props) {
  const [documents, setDocuments] = useState<DealDocument[]>(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [uploadingName, setUploadingName] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadingName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/deals/${dealId}/documents`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const doc = await res.json();
      setDocuments((prev) => [doc, ...prev]);
    }

    setUploading(false);
    setUploadingName(null);
    // Reset input so same file can be re-uploaded
    if (inputRef.current) inputRef.current.value = "";
  }

  function startEdit(doc: DealDocument) {
    setEditingId(doc.id);
    setEditName(doc.name);
  }

  async function saveEdit(id: string) {
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    const res = await fetch(`/api/deals/${dealId}/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    if (res.ok) {
      setDocuments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, name: trimmed } : d))
      );
    }
    setEditingId(null);
  }

  async function toggleVisibility(doc: DealDocument) {
    setTogglingId(doc.id);
    const res = await fetch(`/api/deals/${dealId}/documents/${doc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isClientVisible: !doc.isClientVisible }),
    });
    if (res.ok) {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === doc.id ? { ...d, isClientVisible: !doc.isClientVisible } : d
        )
      );
    }
    setTogglingId(null);
  }

  async function deleteDoc(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/deals/${dealId}/documents/${id}`, {
      method: "DELETE",
    });
    if (res.ok || res.status === 204) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    }
    setDeletingId(null);
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Shared Documents</h2>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      <div className="px-6 py-4 space-y-2">
        {/* Uploading state */}
        {uploading && uploadingName && (
          <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground truncate">
              Uploading {uploadingName}…
            </span>
          </div>
        )}

        {/* Document list */}
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 px-4 py-3 group"
          >
            <div className="shrink-0">{fileIcon(doc.mimeType)}</div>

            {/* Name (editable inline) */}
            <div className="flex-1 min-w-0">
              {editingId === doc.id ? (
                <div className="flex items-center gap-1.5">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(doc.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 min-w-0 rounded-md border border-border bg-background px-2 py-0.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={() => saveEdit(doc.id)}
                    className="text-primary hover:text-primary/80"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(doc.fileSize)}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {editingId !== doc.id && (
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(doc)}
                  title="Rename"
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => toggleVisibility(doc)}
                  disabled={togglingId === doc.id}
                  title={doc.isClientVisible ? "Hide from client" : "Show to client"}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {togglingId === doc.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : doc.isClientVisible ? (
                    <Eye className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5" />
                  )}
                </button>

                <button
                  onClick={() => deleteDoc(doc.id)}
                  disabled={deletingId === doc.id}
                  title="Delete"
                  className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                >
                  {deletingId === doc.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            )}

            {/* Visibility badge */}
            {editingId !== doc.id && (
              <span
                className={`text-[10px] font-medium shrink-0 ${
                  doc.isClientVisible
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {doc.isClientVisible ? "Visible" : "Hidden"}
              </span>
            )}
          </div>
        ))}

        {/* Empty state */}
        {documents.length === 0 && !uploading && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No documents yet. Upload a proposal, SOW, or other file to share with your client.
          </p>
        )}
      </div>
    </div>
  );
}
