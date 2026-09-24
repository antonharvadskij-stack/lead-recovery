import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { guides } from "@/lib/guides";

export const Route = createFileRoute("/guides/")({
  head: () => ({
    meta: [
      { title: "Lead automation guides for local service businesses — Lead Recovery" },
      {
        name: "description",
        content:
          "Practical guides on missed-call text back, follow-up sequences and automation for HVAC, plumbing and roofing companies.",
      },
      { property: "og:title", content: "Lead automation guides — Lead Recovery" },
      {
        property: "og:description",
        content: "Practical, vendor-neutral guides on responding to and following up local service leads.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://leadrelay.lovable.app/guides" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://leadrelay.lovable.app/guides" },
      { rel: "alternate", hrefLang: "en", href: "https://leadrelay.lovable.app/guides" },
      { rel: "alternate", hrefLang: "x-default", href: "https://leadrelay.lovable.app/guides" },
    ],
  }),
  component: GuidesIndex,
});

function GuidesIndex() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-14 sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Guides
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          Short, concrete write-ups on getting back to leads faster. No vendor pitch required —
          most of it you can set up with tools you already pay for.
        </p>
        <div className="mt-8 rounded-2xl border border-border bg-surface p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h2 className="text-base font-semibold text-foreground">Want to find your own leak?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Run the free 8-question audit before adding more lead volume.
            </p>
          </div>
          <Link
            to="/"
            hash="audit"
            className="mt-4 inline-flex shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground sm:mt-0"
          >
            Run the free audit →
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {guides.map((g) => (
            <Link
              key={g.to}
              to={g.to}
              className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <h2 className="text-base font-semibold text-foreground">{g.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{g.description}</p>
              <span className="mt-4 inline-block text-sm font-medium text-primary">Read →</span>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}