import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { pageLinks, SITE } from "@/lib/seo";
import { track } from "@/lib/track";

const title = "Free lead recovery Starter Kit — Lead Recovery";
const description =
  "A free checklist and copy-ready message templates for missed calls, first replies and follow-up. For HVAC, plumbing, roofing and other local service businesses.";

export const Route = createFileRoute("/starter-kit")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${SITE}/starter-kit` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: pageLinks("/starter-kit"),
  }),
  component: StarterKit,
});

const checklist = [
  "Every phone number, web form and message inbox is listed in one place.",
  "Unanswered calls get an automatic text within a minute.",
  "Web form inquiries get an automatic reply that says what happens next.",
  "Every new inquiry lands in one list or pipeline, not scattered inboxes.",
  "Leads who don't book get 3–5 follow-ups over about two weeks, then stop.",
  "Customers can pick a time slot themselves for routine visits.",
  "Anyone can stop messages by replying STOP, and that is respected.",
  "Once a month you check: inquiries in, replied to, booked.",
];

const templates = [
  {
    name: "Missed call text",
    body: "Hi, this is [Business]. Sorry we missed your call — we're probably on a job. What can we help with? Reply here and we'll get back to you shortly.",
  },
  {
    name: "Web form reply",
    body: "Thanks for reaching out to [Business]. We got your request and will contact you by [time]. If it's urgent, call us at [number].",
  },
  {
    name: "Day 2 follow-up",
    body: "Hi [Name], just checking in on your request with [Business]. Would you like to book a time? Reply STOP if you'd rather not hear from us.",
  },
];

function StarterKit() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Free</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          The lead recovery Starter Kit
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          A checklist and three messages you can copy today. No sign-up, no email required.
        </p>

        <section className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-foreground">Checklist</h2>
          <ul className="mt-4 space-y-3">
            {checklist.map((item) => (
              <li key={item} className="flex gap-3 text-[15px] text-muted-foreground">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Message templates</h2>
          {templates.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="text-sm font-semibold text-foreground">{t.name}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{t.body}</p>
            </div>
          ))}
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              track("starter_kit_click");
              window.print();
            }}
            className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-soft transition-colors hover:bg-primary/90"
          >
            Print or save as PDF
          </button>
          <Link
            to="/tool-match"
            className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
          >
            Find the right tool →
          </Link>
          <Link
            to="/"
            hash="audit"
            className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
          >
            Run the free audit →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}