import { createFileRoute } from "@tanstack/react-router";

const paths = [
  "/",
  "/starter-kit",
  "/tool-match",
  "/guides",
  "/guides/missed-call-text-back",
  "/guides/plumbers-missed-calls",
  "/guides/hvac-missed-calls",
  "/guides/lead-follow-up-sequence",
  "/guides/hvac-automation",
  "/guides/plumbing-automation",
  "/guides/roofing-automation",
  "/guides/quote-follow-up",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      // Origin is derived from the incoming request, so the sitemap is correct
      // on the lovable.app domain and on any custom domain added later.
      GET: ({ request }) => {
        const url = new URL(request.url);
        const host =
          url.hostname === "localhost" ? request.headers.get("x-forwarded-host") : null;
        const origin = host ? `https://${host}` : url.origin;

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${origin}${p}</loc></url>`).join("\n")}
</urlset>`;

        return new Response(xml, {
          headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});