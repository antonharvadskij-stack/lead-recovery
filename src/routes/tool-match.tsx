import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { pageLinks, SITE } from "@/lib/seo";
import { track } from "@/lib/track";

const title = "Tool Match: which lead follow-up software fits you — Lead Recovery";
const description =
  "Pick your situation and see which kind of tool fits: an all-in-one platform, your current CRM plus texting, or a simple booking and auto-reply setup.";

export const Route = createFileRoute("/tool-match")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${SITE}/tool-match` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: pageLinks("/tool-match"),
  }),
  component: ToolMatch,
});

const options = [
  {
    situation: "I have no real system yet and want one tool for everything",
    match: "All-in-one platform",
    body: "One subscription that covers missed-call text back, auto-replies, follow-up, a pipeline and booking. HighLevel is one example.",
    link: { label: "Visit gohighlevel.com", href: "https://www.gohighlevel.com/" },
  },
  {
    situation: "I already use a CRM or field-service software I like",
    match: "Keep your CRM, add texting",
    body: "Check whether your current software has automated texting or follow-up built in. If not, add a texting tool that connects to it rather than switching everything.",
  },
  {
    situation: "I'm a small team and mainly need to stop missing calls",
    match: "Missed-call text back + online booking",
    body: "Many phone providers offer missed-call auto-texts. Pair that with a simple booking page and you've covered most of the gap.",
  },
];

function ToolMatch() {
  const [picked, setPicked] = useState<number | null>(null);
  const choice = picked === null ? null : options[picked]!;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Tool Match
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Which kind of tool fits your business?
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Pick the sentence closest to you. Nothing is saved or sent.
        </p>

        <div className="mt-8 space-y-2.5">
          {options.map((o, i) => (
            <button
              key={o.situation}
              type="button"
              aria-pressed={picked === i}
              onClick={() => setPicked(i)}
              className={`w-full rounded-xl border px-4 py-3.5 text-left text-[15px] transition-colors ${
                picked === i
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {o.situation}
            </button>
          ))}
        </div>

        {choice ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Your match
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">{choice.match}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{choice.body}</p>
            {choice.link ? (
              <>
                <a
                  href={choice.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("tool_match_click")}
                  className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-soft transition-colors hover:bg-primary/90"
                >
                  {choice.link.label}
                </a>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Plain public link with no affiliate or tracking code; we earn nothing if you
                  sign up. If that ever changes, it will be disclosed here.
                </p>
              </>
            ) : null}
          </div>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/starter-kit"
            onClick={() => track("starter_kit_click")}
            className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
          >
            Get the free Starter Kit →
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