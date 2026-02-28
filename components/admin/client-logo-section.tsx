"use client";

import { LogoUpload } from "@/components/admin/logo-upload";

interface Props {
  dealId: string;
  initialLogoUrl: string | null;
  clientName: string;
}

export function ClientLogoSection({ dealId, initialLogoUrl, clientName }: Props) {
  async function handleSave(url: string | null) {
    await fetch(`/api/deals/${dealId}/client-logo`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoUrl: url }),
    });
  }

  return (
    <LogoUpload
      label={`${clientName} logo`}
      currentUrl={initialLogoUrl}
      onSave={handleSave}
      uploadType="client-logo"
    />
  );
}
