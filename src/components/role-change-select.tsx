"use client";

import * as React from "react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { setUserRole } from "@/app/actions/admin";
import type { Role } from "@/lib/constants";

const ROLE_LABEL: Record<Role, string> = {
  student: "Student",
  section_leader: "Section Leader",
  drum_major: "Drum Major",
  director: "Director",
};

const POWER_NOTES: Partial<Record<Role, string>> = {
  drum_major: "Drum majors can approve new signups, moderate content, and feature members. They see every audit log and can force-sign-out students.",
  director: "Directors have everything the drum major does, plus: suspend or delete users, override moderation decisions, and assign drum majors.",
  section_leader: "Section leaders can post opportunities. Eventually they'll manage section rosters.",
};

interface Props {
  userId: string;
  userName: string;
  currentRole: Role;
  availableRoles: Role[];
  disabled?: boolean;
}

export function RoleChangeSelect({ userId, userName, currentRole, availableRoles, disabled }: Props) {
  const [value, setValue] = React.useState<Role>(currentRole);
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const changed = value !== currentRole;

  const onConfirm = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", userId);
      fd.set("role", value);
      await setUserRole(fd);
      setOpen(false);
    });
  };

  const elevating = value === "drum_major" || value === "director";
  const demoting = currentRole === "director" && value !== "director";
  const needsConfirm = elevating || demoting;

  return (
    <>
      <Select value={value} disabled={disabled} onChange={(e) => setValue(e.target.value as Role)} className="min-w-40">
        {availableRoles.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABEL[r]}
          </option>
        ))}
      </Select>
      <Button
        size="sm"
        variant="outline"
        disabled={!changed || disabled}
        onClick={() => {
          if (needsConfirm) setOpen(true);
          else onConfirm();
        }}
      >
        Save
      </Button>
      <Dialog
        open={open}
        onOpenChange={(v) => !pending && setOpen(v)}
        title={`Change ${userName} to ${ROLE_LABEL[value]}?`}
        description={
          POWER_NOTES[value] ?? "This promotion gives them new abilities. Make sure that's what you want."
        }
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={pending}>
            {pending ? "Saving…" : `Yes, make them ${ROLE_LABEL[value].toLowerCase()}`}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
