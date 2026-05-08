/*
 * URL detection + embed type recognition for rich-text rendering of
 * shoutout bodies, profile bios, and mentor request descriptions.
 *
 * YouTube + Vimeo render as iframe embeds (no third-party JS needed).
 * Instagram, TikTok, Facebook render as link cards (their embed SDKs are
 * heavy and unreliable on guest wifi — the card route is safer for the
 * demo and degrades gracefully).
 */

export type EmbedKind = "youtube" | "vimeo" | "instagram" | "tiktok" | "facebook" | null;

export interface Embed {
  kind: Exclude<EmbedKind, null>;
  url: string;
  iframeSrc?: string;   // for inline iframe embeds (yt/vimeo)
  platform: string;     // human label
}

const TRAILING_PUNCT = /[).,;:!?]+$/;
export const URL_REGEX = /\bhttps?:\/\/[^\s<>"']+/g;

export function findUrls(text: string): string[] {
  if (!text) return [];
  const out: string[] = [];
  for (const match of text.matchAll(URL_REGEX)) {
    let url = match[0];
    // Strip trailing sentence punctuation
    while (TRAILING_PUNCT.test(url)) url = url.replace(TRAILING_PUNCT, "");
    if (url) out.push(url);
  }
  return out;
}

export function detectEmbed(rawUrl: string): Embed | null {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "").toLowerCase();
  const path = u.pathname;

  // YouTube
  if (host === "youtube.com" || host === "m.youtube.com") {
    const v = u.searchParams.get("v");
    if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) {
      return { kind: "youtube", url: rawUrl, iframeSrc: `https://www.youtube.com/embed/${v}`, platform: "YouTube" };
    }
    const shortMatch = path.match(/^\/shorts\/([A-Za-z0-9_-]{11})/);
    if (shortMatch) {
      return { kind: "youtube", url: rawUrl, iframeSrc: `https://www.youtube.com/embed/${shortMatch[1]}`, platform: "YouTube" };
    }
    const liveMatch = path.match(/^\/live\/([A-Za-z0-9_-]{11})/);
    if (liveMatch) {
      return { kind: "youtube", url: rawUrl, iframeSrc: `https://www.youtube.com/embed/${liveMatch[1]}`, platform: "YouTube" };
    }
  }
  if (host === "youtu.be") {
    const id = path.replace(/^\//, "");
    if (/^[A-Za-z0-9_-]{11}$/.test(id)) {
      return { kind: "youtube", url: rawUrl, iframeSrc: `https://www.youtube.com/embed/${id}`, platform: "YouTube" };
    }
  }

  // Vimeo
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const m = path.match(/(?:^|\/)(\d{6,})/);
    if (m) {
      return { kind: "vimeo", url: rawUrl, iframeSrc: `https://player.vimeo.com/video/${m[1]}`, platform: "Vimeo" };
    }
  }

  // Instagram (post, reel, tv, profile)
  if (host === "instagram.com" || host.endsWith(".instagram.com")) {
    return { kind: "instagram", url: rawUrl, platform: "Instagram" };
  }

  // TikTok
  if (host === "tiktok.com" || host.endsWith(".tiktok.com") || host === "vm.tiktok.com") {
    return { kind: "tiktok", url: rawUrl, platform: "TikTok" };
  }

  // Facebook
  if (host === "facebook.com" || host.endsWith(".facebook.com") || host === "fb.watch") {
    return { kind: "facebook", url: rawUrl, platform: "Facebook" };
  }

  return null;
}

export function uniqueEmbeds(text: string): Embed[] {
  const urls = findUrls(text);
  const seen = new Set<string>();
  const out: Embed[] = [];
  for (const u of urls) {
    const e = detectEmbed(u);
    if (!e) continue;
    const key = e.iframeSrc ?? e.url;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}
