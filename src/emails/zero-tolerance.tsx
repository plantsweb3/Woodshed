import * as React from "react";
import { EmailLayout } from "./layout";

export function ZeroToleranceEmail({
  reason,
  targetUserName,
  reporterName,
  excerpt,
  appUrl,
}: {
  reason: string;
  targetUserName: string;
  reporterName: string | null;
  excerpt: string;
  appUrl: string;
}) {
  return (
    <EmailLayout
      title="Immediate review required"
      body={
        <>
          <p>
            A report was flagged for <strong>{reason.replace("_", " ")}</strong> on content posted by <strong>{targetUserName}</strong>.
          </p>
          <p>Reported by: {reporterName ?? "anonymous student"}.</p>
          <p style={{ marginTop: 12 }}>Excerpt:</p>
          <blockquote
            style={{
              borderLeft: "3px solid #A0342D",
              paddingLeft: 12,
              margin: "12px 0",
              color: "#433d34",
            }}
          >
            {excerpt}
          </blockquote>
          <p>This one bypassed the standard queue. Please review immediately.</p>
        </>
      }
      cta={{ label: "Open moderation queue", href: `${appUrl}/admin/moderation` }}
    />
  );
}
