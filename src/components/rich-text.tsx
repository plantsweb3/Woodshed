import * as React from "react";
import { ExternalLink } from "lucide-react";
import { URL_REGEX, uniqueEmbeds, type Embed } from "@/lib/embeds";

/*
 * Renders user-generated text with:
 *  - URLs autolinked
 *  - Inline iframe embeds for YouTube + Vimeo (under the text body)
 *  - Link cards for Instagram, TikTok, Facebook (no third-party JS, safe on
 *    guest wifi). All open in a new tab with rel=noopener noreferrer.
 *
 * Server component — pure render of a string, no interactivity needed.
 */

export function RichText({
  text,
  className,
  withEmbeds = true,
}: {
  text: string | null | undefined;
  className?: string;
  withEmbeds?: boolean;
}) {
  if (!text) return null;
  const embeds = withEmbeds ? uniqueEmbeds(text) : [];
  return (
    <>
      <div className={className}>
        {linkify(text)}
      </div>
      {embeds.length > 0 && (
        <div className="mt-3 flex flex-col gap-3">
          {embeds.map((e, i) => (
            <EmbedRender key={i} e={e} />
          ))}
        </div>
      )}
    </>
  );
}

function linkify(text: string) {
  const lines = text.split("\n");
  return lines.map((line, lineIdx) => {
    const parts: React.ReactNode[] = [];
    let last = 0;
    for (const match of line.matchAll(URL_REGEX)) {
      const url = match[0];
      const start = match.index ?? 0;
      // Strip trailing sentence punctuation, leave it as plain text after the link.
      const trail = url.match(/[).,;:!?]+$/)?.[0] ?? "";
      const cleanUrl = trail ? url.slice(0, -trail.length) : url;

      if (start > last) parts.push(line.slice(last, start));
      parts.push(
        <a
          key={`${lineIdx}-${start}`}
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary-ink break-words"
        >
          {cleanUrl}
        </a>
      );
      if (trail) parts.push(trail);
      last = start + url.length;
    }
    if (last < line.length) parts.push(line.slice(last));
    return (
      <React.Fragment key={lineIdx}>
        {parts.length ? parts : line}
        {lineIdx < lines.length - 1 ? <br /> : null}
      </React.Fragment>
    );
  });
}

function EmbedRender({ e }: { e: Embed }) {
  if (e.kind === "youtube" || e.kind === "vimeo") {
    return (
      <div className="border-2 border-ink shadow-[3px_3px_0_0_var(--color-rule)] bg-paper overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[color:var(--color-rule)]/40 bg-muted">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {e.platform}
          </span>
          <a
            href={e.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary inline-flex items-center gap-1 hover:underline"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="relative" style={{ aspectRatio: "16 / 9" }}>
          <iframe
            src={e.iframeSrc}
            title={`${e.platform} player`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
    );
  }
  return <LinkCard e={e} />;
}

function LinkCard({ e }: { e: Embed }) {
  const initial = e.platform.slice(0, 2).toUpperCase();
  return (
    <a
      href={e.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border border-[color:var(--color-rule)]/50 bg-paper px-4 py-3 shadow-[2px_2px_0_0_var(--color-rule)] hover:-translate-y-[1px] hover:shadow-[3px_3px_0_0_var(--color-rule)] transition-[transform,box-shadow]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="grid place-items-center h-8 w-8 border border-ink bg-card text-ink shrink-0 font-display text-xs leading-none"
            aria-hidden
          >
            {initial}
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {e.platform}
            </p>
            <p className="text-sm truncate font-medium text-foreground/90 group-hover:text-primary">
              {prettyUrl(e.url)}
            </p>
          </div>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary inline-flex items-center gap-1 shrink-0">
          Open <ExternalLink className="h-3 w-3" />
        </span>
      </div>
    </a>
  );
}

function prettyUrl(url: string) {
  try {
    const u = new URL(url);
    return (u.host + u.pathname).replace(/\/$/, "");
  } catch {
    return url;
  }
}
