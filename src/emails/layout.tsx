import * as React from "react";
import { Html, Body, Container, Section, Heading, Text, Button, Hr, Link } from "@react-email/components";

/*
 * Shared email layout — dark purple header, cream body, one clear CTA.
 * No tracking pixels. No marketing fluff. This is for a high school band.
 */

const COLORS = {
  primary: "#4B2E83",
  primaryFg: "#FFFAF0",
  accent: "#FFC72C",
  bg: "#FFFAF0",
  card: "#FFFFFF",
  border: "#E4DCC7",
  fg: "#18140E",
  muted: "#6A6357",
};

export interface EmailLayoutProps {
  preview?: string;
  title: string;
  greeting?: string;
  body: React.ReactNode;
  cta?: { label: string; href: string };
  footerNote?: string;
}

export function EmailLayout({ title, greeting, body, cta, footerNote }: EmailLayoutProps) {
  return (
    <Html>
      <Body style={{ backgroundColor: COLORS.bg, fontFamily: "Georgia, serif", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px" }}>
          <Section
            style={{
              backgroundColor: COLORS.primary,
              color: COLORS.primaryFg,
              padding: "20px 24px",
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", margin: 0, color: COLORS.accent }}>
              Woodshed
            </Text>
            <Heading as="h1" style={{ color: COLORS.primaryFg, fontSize: 24, fontWeight: 500, margin: "6px 0 0 0" }}>
              {title}
            </Heading>
          </Section>
          <Section
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              padding: "24px 24px 28px",
              marginTop: 8,
            }}
          >
            {greeting && (
              <Text style={{ color: COLORS.fg, fontSize: 16, margin: 0, marginBottom: 12 }}>{greeting}</Text>
            )}
            <div style={{ color: COLORS.fg, fontSize: 16, lineHeight: 1.55 }}>{body}</div>
            {cta && (
              <Button
                href={cta.href}
                style={{
                  display: "inline-block",
                  backgroundColor: COLORS.primary,
                  color: COLORS.primaryFg,
                  padding: "12px 20px",
                  borderRadius: 6,
                  fontFamily: "Helvetica, Arial, sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: "none",
                  marginTop: 20,
                }}
              >
                {cta.label}
              </Button>
            )}
          </Section>
          <Hr style={{ borderColor: COLORS.border, marginTop: 24, marginBottom: 12 }} />
          <Text style={{ color: COLORS.muted, fontSize: 12, fontFamily: "Helvetica, Arial, sans-serif" }}>
            {footerNote ?? `Built for the Pieper Band of Warriors. Where the work happens.`}
          </Text>
          <Text style={{ color: COLORS.muted, fontSize: 11, fontFamily: "Helvetica, Arial, sans-serif" }}>
            You can manage email preferences from <Link href={`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/settings/notifications`} style={{ color: COLORS.primary }}>your account settings</Link>.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
