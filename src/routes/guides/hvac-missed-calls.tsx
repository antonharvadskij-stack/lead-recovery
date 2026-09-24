import { createFileRoute } from "@tanstack/react-router";
import { GuideLayout, GuideSection } from "@/components/guide-layout";

export const Route = createFileRoute("/guides/hvac-missed-calls")({
  head: () => ({
    meta: [
      { title: "HVAC missed calls: find the leads that disappear while your team is busy — Lead Recovery" },
      { name: "description", content: "A practical HVAC missed-call checklist covering response speed, voicemail, text-back, ownership and booking." },
      { property: "og:title", content: "HVAC missed calls: find the leads that disappear while your team is busy" },
      { property: "og:description", content: "Measure what happens after an HVAC call goes unanswered and find the simplest recovery step." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://leadrelay.lovable.app/guides/hvac-missed-calls" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://leadrelay.lovable.app/guides/hvac-missed-calls" },
      { rel: "alternate", hrefLang: "en", href: "https://leadrelay.lovable.app/guides/hvac-missed-calls" },
      { rel: "alternate", hrefLang: "x-default", href: "https://leadrelay.lovable.app/guides/hvac-missed-calls" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <GuideLayout
      eyebrow="HVAC"
      title="HVAC missed calls: find the leads that disappear while your team is busy"
      intro="During a service rush, the issue is rarely that an HVAC company wants to ignore callers. The issue is that the next response depends on memory while the crew is already working."
    >
      <GuideSection heading="Start with the missed-call count">
        <p>Review one or two representative weeks and count inbound calls that were not answered live. Do not assume every missed call was a sales opportunity; classify them so you can separate customers, vendors, spam and existing-job calls.</p>
      </GuideSection>
      <GuideSection heading="Measure time to first real response">
        <p>Record the time of the missed call and the first actual response. A voicemail left hours later is different from a text or callback that reaches the customer promptly. Use your own data rather than a generic industry benchmark.</p>
      </GuideSection>
      <GuideSection heading="Define ownership">
        <p>Decide who owns the next action when a call is missed. If the answer is “whoever notices it,” the process is fragile. A shared inbox, dispatch queue, callback list or automation can make ownership visible without replacing your existing workflow.</p>
      </GuideSection>
      <GuideSection heading="Measure the outcome">
        <p>Track whether the caller was reached, whether an appointment was booked and whether the job was won. This keeps the team focused on recovered opportunities instead of vanity metrics such as the number of automated texts sent.</p>
      </GuideSection>
      <GuideSection heading="Run the free audit">
        <p>Use the Lead Recovery audit to check missed calls, response speed, follow-up and booking before deciding whether you need another software tool.</p>
      </GuideSection>
    </GuideLayout>
  );
}
