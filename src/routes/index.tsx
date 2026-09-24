import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Audit } from "@/components/audit";
import { guides } from "@/lib/guides";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lead Recovery — Find the leads your local service business is losing" },
      {
        name: "description",
        content:
          "A free 8-question audit for HVAC, plumbing, roofing, electrical and cleaning businesses. Get a practical automation plan for missed calls, slow replies, follow-up and booking.",
      },
      {
        property: "og:title",
        content: "Lead Recovery — Find the leads your business is losing",
      },
      {
        property: "og:description",
        content:
          "Answer 8 questions. Get a practical automation plan for missed calls, slow replies, follow-up and booking.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://leadrelay.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://leadrelay.lovable.app/" },
      { rel: "alternate", hrefLang: "en", href: "https://leadrelay.lovable.app/" },
      { rel: "alternate", hrefLang: "x-default", href: "https://leadrelay.lovable.app/" },
    ],
  }),
  component: Index,
});

const proof = [
  { label: "Missed calls", note: "Find where unanswered inquiries can leak out" },
  { label: "Response speed", note: "See how quickly new inquiries get a response" },
  { label: "Follow-up & booking", note: "Check what happens after the first contact" },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            For local service businesses
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-6xl">
            Find the leads your business is losing.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Answer 8 questions. Get a practical automation plan for missed calls, slow replies,
            follow-up and booking.
          </p>
          <div className="mt-8">
            <a
              href="#audit"
              className="inline-flex rounded-xl bg-primary px-7 py-4 text-base font-medium text-primary-foreground shadow-soft transition-colors hover:bg-primary/90"
            >
              Run the free audit →
            </a>
            <p className="mt-3 text-sm text-muted-foreground">
              No credit card. Takes about 60 seconds.
            </p>
          </div>
        </div>
      </section>

      {/* What the audit checks */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-5xl gap-px bg-border sm:grid-cols-3">
          {proof.map((p) => (
            <div key={p.label} className="bg-background px-6 py-7 text-center">
              <p className="text-sm font-semibold text-foreground">{p.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{p.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Audit */}
      <section id="audit" className="scroll-mt-20 bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-5">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              The free lead-loss audit
            </h2>
            <p className="mt-3 text-muted-foreground">
              Eight questions about how inquiries reach you today. You'll get a plan, not a sales
              call.
            </p>
          </div>
          <Audit />
        </div>
      </section>

      {/* Guides */}
      <section className="border-t border-border py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Guides
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            How to set each of these up yourself, written for the trades.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((g) => (
              <Link
                key={g.to}
                to={g.to}
                className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <h3 className="text-base font-semibold text-foreground">{g.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {g.description}
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-primary">Read →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tools / recommendation */}
      <section className="border-t border-border bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Software we point people to
          </h2>
          <div className="mt-8 rounded-2xl border border-border bg-card p-7">
            <h3 className="text-lg font-semibold text-foreground">HighLevel</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              An all-in-one platform that can cover most of the plan above — missed-call text back,
              automated replies, follow-up sequences, a pipeline and booking — in one subscription.
              It's a reasonable starting point if you'd rather buy one tool than stitch several
              together. It is not the only option, and plenty of businesses get the same result
              with their existing CRM plus a texting tool.
            </p>
            <a
              href="https://www.gohighlevel.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex rounded-xl border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
            >
              Visit gohighlevel.com
            </a>
            {/* Plain public URL — no affiliate tracking parameters are used today. */}
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              This is a plain public link with no tracking or affiliate code, and we receive nothing
              if you sign up. If we ever replace it with an affiliate link, that relationship will
              be disclosed here and in the footer.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}