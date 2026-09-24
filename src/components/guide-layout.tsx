import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function GuideLayout({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
        <Link to="/guides" className="text-sm text-primary hover:underline">
          ← All guides
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{intro}</p>
        <div className="prose-guide mt-10 space-y-8">{children}</div>

        <div className="mt-14 rounded-2xl border border-border bg-surface p-8">
          <h2 className="text-xl font-semibold text-foreground">
            Not sure where your leads are leaking?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Answer 8 questions and get a plan for your own setup. No credit card, about 60 seconds.
          </p>
          <Link
            to="/"
            hash="audit"
            className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-soft transition-colors hover:bg-primary/90"
          >
            Run the free audit →
          </Link>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}

export function GuideSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{heading}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}