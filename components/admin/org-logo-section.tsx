"use client";

import { LogoUpload } from "@/components/admin/logo-upload";

interface Props {
  orgName: string;
  initialLogoUrl: string | null;
}

export function OrgLogoSection({ orgName, initialLogoUrl }: Props) {
  async function handleSave(url: string | null) {
    await fetch("/api/settings/org/logo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoUrl: url }),
    });
  }

  return (
    <LogoUpload
      label={`${orgName} logo`}
      currentUrl={initialLogoUrl}
      onSave={handleSave}
      uploadType="org-logo"
    />
  );
}
