import * as React from "react";
import { EmailLayout } from "./layout";

export function SignupApprovedEmail({ firstName, appUrl }: { firstName: string; appUrl: string }) {
  return (
    <EmailLayout
      title="You're in."
      greeting={`Welcome, ${firstName}.`}
      body={
        <>
          <p>Your Woodshed account is approved. The directory, mentorship board, and opportunities feed are now open to you.</p>
          <p>Next: walk through the short setup that builds your profile so the rest of the program can actually see you.</p>
        </>
      }
      cta={{ label: "Complete your profile", href: `${appUrl}/onboarding` }}
    />
  );
}
