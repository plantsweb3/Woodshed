import * as React from "react";
import { EmailLayout } from "./layout";

export function FeaturedNoticeEmail({ firstName, appUrl }: { firstName: string; appUrl: string }) {
  return (
    <EmailLayout
      title="You've been featured"
      greeting={`Hey ${firstName},`}
      body={
        <>
          <p>Your profile is featured at the top of the directory this week. Younger students are going to see your work first.</p>
          <p>Take a minute to make sure your profile is current — add anything you&apos;ve done lately that future Warriors should know is possible here.</p>
        </>
      }
      cta={{ label: "Review your profile", href: `${appUrl}/profile` }}
    />
  );
}
