import * as React from "react";
import { EmailLayout } from "./layout";

export function MentorRequestDirectEmail({
  mentorFirstName,
  requesterName,
  skill,
  urgency,
  description,
  appUrl,
}: {
  mentorFirstName: string;
  requesterName: string;
  skill: string;
  urgency: string;
  description: string;
  appUrl: string;
}) {
  return (
    <EmailLayout
      title="You got a mentor request"
      greeting={`Hey ${mentorFirstName},`}
      body={
        <>
          <p>
            <strong>{requesterName}</strong> asked for your help on <em>{skill}</em>. Urgency: {urgency.replace("_", " ")}.
          </p>
          <blockquote
            style={{
              borderLeft: "3px solid #4B2E83",
              paddingLeft: 12,
              margin: "16px 0",
              color: "#433d34",
            }}
          >
            {description}
          </blockquote>
          <p>Open the mentorship board to offer to help or pass.</p>
        </>
      }
      cta={{ label: "Open mentorship board", href: `${appUrl}/mentorship` }}
    />
  );
}
