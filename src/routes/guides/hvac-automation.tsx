import { createFileRoute } from "@tanstack/react-router";
import { GuideLayout, GuideSection } from "@/components/guide-layout";

export const Route = createFileRoute("/guides/hvac-automation")({
  head: () => ({
    meta: [
      { title: "HVAC lead automation: peak season, triage and reminders — Lead Recovery" },
      {
        name: "description",
        content:
          "How HVAC companies can handle peak-season call volume, sort urgent jobs from quotes, and automate maintenance reminders.",
      },
      { property: "og:title", content: "Automation for HVAC companies" },
      {
        property: "og:description",
        content: "Peak-season intake, emergency triage and maintenance reminders for HVAC teams.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://leadrelay-ai.lovable.app/guides/hvac-automation" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://leadrelay-ai.lovable.app/guides/hvac-automation" },
      { rel: "alternate", hrefLang: "en", href: "https://leadrelay-ai.lovable.app/guides/hvac-automation" },
      { rel: "alternate", hrefLang: "x-default", href: "https://leadrelay-ai.lovable.app/guides/hvac-automation" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <GuideLayout
      eyebrow="Industry guide"
      title="Automation for HVAC companies"
      intro="HVAC demand is spiky. The first hot week and the first cold snap bring more calls than the office can answer, and that's exactly when a missed one costs the most."
    >
      <GuideSection heading="Survive the peak week">
        <p>
          Decide in advance what happens to an overflow call: automatic text back, an after-hours
          intake form, or a booking link for non-urgent quotes. When a heatwave hits, the system is
          already doing it rather than waiting for someone to set it up under pressure.
        </p>
      </GuideSection>

      <GuideSection heading="Sort urgency without diagnosing">
        <p>
          Your intake can collect facts — no cooling at all versus weak airflow, residential or
          commercial, property address, whether anyone vulnerable is in the home — and route the
          request to the right queue. It should never suggest a cause or a fix. Diagnosis belongs
          to your technician on site.
        </p>
      </GuideSection>

      <GuideSection heading="Quotes that go quiet">
        <p>
          System replacements involve a decision at home, often across a weekend. A short follow-up
          sequence with the quote, financing or scheduling options, and a final "quote stands for
          30 days" message keeps the job alive without pressure.
        </p>
      </GuideSection>

      <GuideSection heading="Maintenance reminders">
        <p>
          Seasonal tune-ups are the easiest recurring revenue you have and the easiest to forget.
          Schedule spring and autumn reminders per customer with a one-tap booking link, and mark
          plan holders so they get a different message from one-off customers.
        </p>
      </GuideSection>

      <GuideSection heading="Where to start">
        <p>
          Missed-call text back first, since peak-season overflow is where most inquiries are lost.
          Then one pipeline for calls, forms and messages. Reminders last.
        </p>
      </GuideSection>
    </GuideLayout>
  );
}