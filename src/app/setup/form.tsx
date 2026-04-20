"use client";

import { useActionState } from "react";
import { bootstrapDirector, type SetupState } from "@/app/actions/setup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

const initial: SetupState = {};

export function SetupForm() {
  const [state, action, pending] = useActionState(bootstrapDirector, initial);
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
        <Input id="email" name="email" type="email" required />
      </Field>
      <Field label="Password" htmlFor="password" hint="At least 12 characters" error={fe.password}>
        <Input id="password" name="password" type="password" required minLength={12} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Section" htmlFor="section" error={fe.section} hint="e.g. Band Staff">
          <Input id="section" name="section" defaultValue="Band Staff" required />
        </Field>
        <Field label="Primary instrument" htmlFor="primaryInstrument" error={fe.primaryInstrument}>
          <Input id="primaryInstrument" name="primaryInstrument" defaultValue="Other" required />
        </Field>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Setting up…" : "Create director account"}
      </Button>
    </form>
  );
}
