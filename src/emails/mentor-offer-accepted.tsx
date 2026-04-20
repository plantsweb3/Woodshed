import * as React from "react";
import { EmailLayout } from "./layout";

export function MentorOfferAcceptedEmail({
  requesterFirstName,
  mentorName,
  skill,
  appUrl,
}: {
  requesterFirstName: string;
  mentorName: string;
  skill: string;
  appUrl: string;
}) {
  return (
    <EmailLayout
      title="Someone picked up your request"
      greeting={`Hey ${requesterFirstName},`}
      body={
        <>
          <p>
            <strong>{mentorName}</strong> offered to help with <em>{skill}</em>. That&apos;s the start.
          </p>
          <p>Reach out in person — find them at rehearsal or in the band hall. Woodshed is about making it easier to see each other; the work itself still happens offline.</p>
        </>
      }
      cta={{ label: "See the request", href: `${appUrl}/mentorship` }}
    />
  );
}
