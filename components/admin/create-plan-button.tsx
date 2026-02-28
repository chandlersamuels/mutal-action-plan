"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TemplatePickerDialog } from "@/components/admin/template-picker-dialog";

interface Props {
  dealId: string;
  dealName: string;
}

export function CreatePlanButton({ dealId, dealName }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      <Button size="sm" className="btn-glow" onClick={() => setPickerOpen(true)}>
        Create plan
      </Button>
      <TemplatePickerDialog
        dealId={dealId}
        dealName={dealName}
        open={pickerOpen}
        onOpenChange={setPickerOpen}
      />
    </>
  );
}
