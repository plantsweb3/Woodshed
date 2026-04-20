import { APP } from "@/lib/constants";

export const dynamic = "force-static";

export function GET() {
  const manifest = {
    name: APP.name,
    short_name: APP.shortName,
    description: `${APP.name} — ${APP.tagline}`,
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fffaf0",
    theme_color: "#4B2E83",
    categories: ["education", "music"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    status: 200,
    headers: { "content-type": "application/manifest+json; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
