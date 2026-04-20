"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signup, type AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { SECTIONS, GRADES, CONCERT_INSTRUMENTS, MARCHING_INSTRUMENTS } from "@/lib/constants";

const initial: AuthState = {};

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, initial);
  const [, setGrade] = useState("");
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" htmlFor="firstName" error={fe.firstName}>
          <Input id="firstName" name="firstName" required />
        </Field>
        <Field label="Last name" htmlFor="lastName" error={fe.lastName}>
          <Input id="lastName" name="lastName" required />
        </Field>
      </div>

      <Field label="Email" htmlFor="email" error={fe.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>

      <Field label="Password" htmlFor="password" hint="At least 8 characters" error={fe.password}>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Grade" htmlFor="grade" error={fe.grade}>
          <Select
            id="grade"
            name="grade"
            required
            defaultValue=""
            onChange={(e) => setGrade(e.target.value)}
          >
            <option value="" disabled>
              Select…
            </option>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Section" htmlFor="section" error={fe.section}>
          <Select id="section" name="section" required defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            {SECTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Primary instrument" htmlFor="primaryInstrument" error={fe.primaryInstrument}>
        <Select id="primaryInstrument" name="primaryInstrument" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {CONCERT_INSTRUMENTS.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Marching instrument" htmlFor="marchingInstrument" hint="Leave empty if concert-only">
        <Select id="marchingInstrument" name="marchingInstrument" defaultValue="">
          <option value="">—</option>
          {MARCHING_INSTRUMENTS.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Invite code" htmlFor="inviteCode" hint="Posted in the band hall" error={fe.inviteCode}>
        <Input id="inviteCode" name="inviteCode" required autoCapitalize="characters" />
      </Field>

      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="tosAccepted" required className="mt-1 accent-primary" />
        <span>
          I&apos;ve read the <Link href="/terms" target="_blank" className="text-primary hover:underline">terms</Link> and{" "}
          <Link href="/privacy" target="_blank" className="text-primary hover:underline">privacy policy</Link> and agree to them.
        </span>
      </label>
      {fe.tosAccepted && <p className="text-xs text-destructive">{fe.tosAccepted}</p>}

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Submitting…" : "Create account"}
      </Button>
      <p className="text-xs text-muted-foreground">
        You&apos;ll go straight into setup after creating your account.
      </p>
    </form>
  );
}
