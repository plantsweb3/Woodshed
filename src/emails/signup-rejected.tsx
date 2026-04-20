import * as React from "react";
import { EmailLayout } from "./layout";

export function SignupRejectedEmail({ firstName }: { firstName: string }) {
  return (
    <EmailLayout
      title="About your Woodshed signup"
      greeting={`Hey ${firstName},`}
      body={
        <>
          <p>Your signup wasn&apos;t approved. This isn&apos;t a judgment call — most of the time it means we couldn&apos;t verify you&apos;re a current Pieper band student from the info on file.</p>
          <p>If you believe this was a mistake, talk to your section leader or drum major and they can help you try again with a fresh invite code.</p>
        </>
      }
    />
  );
}
