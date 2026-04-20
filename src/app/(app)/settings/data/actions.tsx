"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { exportMyData, requestAccountDeletion } from "@/app/actions/account";
import { Download, Trash2 } from "lucide-react";

export function DataActions({ mode }: { mode: "export" | "delete" }) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const onExport = () => {
    startTransition(async () => {
      const json = await exportMyData();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `woodshed-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const onDelete = () => {
    startTransition(async () => {
      await requestAccountDeletion();
    });
  };

  if (mode === "export") {
    return (
      <Button onClick={onExport} disabled={pending} className="gap-2">
        <Download className="h-4 w-4" />
        {pending ? "Preparing…" : "Download my data"}
      </Button>
    );
  }

  return (
    <>
      <Button variant="outline" className="gap-2 text-destructive border-destructive/40 hover:bg-destructive/5" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" /> Delete my account
      </Button>
      <Dialog
        open={open}
        onOpenChange={(v) => !pending && setOpen(v)}
        title="Delete your account?"
        description="Your data is soft-deleted right now, and permanently removed in 7 days. If you sign back in during the grace period, you can cancel the deletion."
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm">This will:</p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>Immediately sign you out of every device.</li>
            <li>Remove your profile from the directory.</li>
            <li>Stop all notifications.</li>
            <li>Permanently delete everything in 7 days.</li>
          </ul>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button onClick={onDelete} disabled={pending} className="bg-destructive hover:bg-destructive/90">
              {pending ? "Deleting…" : "Yes, delete my account"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
