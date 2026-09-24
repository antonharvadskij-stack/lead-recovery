import { createFileRoute } from "@tanstack/react-router";
import { GuideLayout, GuideSection } from "@/components/guide-layout";

export const Route = createFileRoute("/guides/plumbers-missed-calls")({
  head: () => ({
    meta: [
      { title: "Plumbers: what to do about missed calls while you're on a job — Lead Recovery" },
      { name: "description", content: "A practical missed-call checklist for plumbers and small plumbing teams: response time, voicemail, text-back, ownership and booking." },
      { property: "og:title", content: "Plumbers: what to do about missed calls while you're on a job" },
      { property: "og:description", content: "A practical checklist for recovering plumbing inquiries when nobody can answer the phone." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://leadrelay.lovable.app/guides/plumbers-missed-calls" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://leadrelay.lovable.app/guides/plumbers-missed-calls" },
      { rel: "alternate", hrefLang: "en", href: "https://leadrelay.lovable.app/guides/plumbers-missed-calls" },
      { rel: "alternate", hrefLang: "x-default", href: "https://leadrelay.lovable.app/guides/plumbers-missed-calls" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <GuideLayout
      eyebrow="Plumbing"
      title="Plumbers: what to do about missed calls while you're on a job"
      intro="If the phone rings while you're under a sink or in a crawlspace, the real question is not whether you can answer every call. It is whether every new inquiry gets a clear next step."
    >
      <GuideSection heading="Measure the callback clock">
        <p>For a week, record when missed calls arrive and when the first outbound reply happens. Separate a real conversation from a voicemail: the useful metric is when the customer receives an actual response.</p>
      </GuideSection>
      <GuideSection heading="Make voicemail do one job">
        <p>Tell callers who you are, that you are currently on a job, and what happens next. Give one clear route for urgent situations and one clear route for non-urgent work. Avoid promises your team cannot keep.</p>
      </GuideSection>
      <GuideSection heading="Give missed callers an easy next step">
        <p>If appropriate for your business and local rules, a simple text-back can acknowledge the inquiry and ask what service is needed. The goal is not a long automated conversation; it is to keep the lead from disappearing before someone can respond.</p>
      </GuideSection>
      <GuideSection heading="Track booking, not just response">
        <p>A fast reply is only an intermediate metric. Track whether the missed caller reached a real conversation, booked an appointment, or was lost. That shows whether the recovery process is actually useful.</p>
      </GuideSection>
      <GuideSection heading="Run the free audit">
        <p>Use the Lead Recovery audit to check missed calls, response speed, follow-up and booking in one short pass.</p>
      </GuideSection>
    </GuideLayout>
  );
}
