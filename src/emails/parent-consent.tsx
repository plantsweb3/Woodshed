import * as React from "react";
import { EmailLayout } from "./layout";

export function ParentConsentEmail({
  studentName,
  consentUrl,
  appUrl,
  expiresDays,
}: {
  studentName: string;
  consentUrl: string;
  appUrl: string;
  expiresDays: number;
}) {
  return (
    <EmailLayout
      title="Your student signed up for The Woodshed"
      body={
        <>
          <p>
            <strong>{studentName}</strong> signed up for The Woodshed — a private, school-adjacent app for the Pieper
            Band of Warriors. It exists so students can track their progress, find mentors, and see opportunities outside
            the official program.
          </p>
          <p>
            Since your student is under 16, we need your permission before their account becomes active. The Woodshed
            collects: name, grade, section, instruments, an optional bio, opt-in achievements, and practice activity.
            It does <em>not</em> collect grades, teacher evaluations, or anything that would fall under FERPA.
          </p>
          <p>
            The link below confirms consent and activates {studentName}&apos;s account. It&apos;s good for {expiresDays} days.
            If you do nothing, the account will be deleted automatically.
          </p>
        </>
      }
      cta={{ label: "Approve my student's account", href: consentUrl }}
      footerNote={`Questions? Reach out to the Pieper band director. Privacy policy at ${appUrl}/privacy.`}
    />
  );
}
