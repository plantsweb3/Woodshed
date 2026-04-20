"use client";

import { useTransition, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { setProfileVisibility } from "@/app/actions/account";

export function VisibilityToggle({ initialVisible }: { initialVisible: boolean }) {
  const [visible, setVisible] = useState(initialVisible);
  const [pending, startTransition] = useTransition();
  const onChange = (v: boolean) => {
    setVisible(v);
    startTransition(async () => {
      const fd = new FormData();
      if (v) fd.set("visible", "on");
      await setProfileVisibility(fd);
    });
  };
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-md border border-border">
      <div>
        <p className="font-medium">Show me in the directory</p>
        <p className="text-sm text-muted-foreground">{pending ? "Saving…" : "Visibility applies to the /directory list and direct profile lookups by members."}</p>
      </div>
      <Switch checked={visible} onCheckedChange={onChange} />
    </div>
  );
}
