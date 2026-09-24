import { createFileRoute } from "@tanstack/react-router";
import { GuideLayout, GuideSection } from "@/components/guide-layout";

export const Route = createFileRoute("/guides/roofing-automation")({
  head: () => ({
    meta: [
      { title: "Roofing lead automation: storm surges and long decisions — Lead Recovery" },
      {
        name: "description",
        content:
          "How roofing companies can handle storm-driven inquiry spikes, qualify leads early, and stay in touch through long decision cycles.",
      },
      { property: "og:title", content: "Automation for roofing companies" },
      {
        property: "og:description",
        content: "Storm surges, early qualification and long follow-up cycles for roofing teams.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://leadrelay.lovable.app/guides/roofing-automation" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://leadrelay.lovable.app/guides/roofing-automation" },
      { rel: "alternate", hrefLang: "en", href: "https://leadrelay.lovable.app/guides/roofing-automation" },
      { rel: "alternate", hrefLang: "x-default", href: "https://leadrelay.lovable.app/guides/roofing-automation" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <GuideLayout
      eyebrow="Industry guide"
      title="Automation for roofing companies"
      intro="Roofing runs on two clocks at once: a storm can produce a month of inquiries in a day, while a single re-roof decision can take weeks. Your intake has to handle both."
    >
      <GuideSection heading="Storm surges">
        <p>
          When the weather turns, inbound volume outruns the office. Automatic acknowledgement with
          a realistic timeframe — "we're booking inspections for next week, here's the link" — keeps
          people from chasing you, and keeps the list in one place instead of scattered voicemails.
        </p>
      </GuideSection>

      <GuideSection heading="Qualify early, without gatekeeping">
        <p>
          A few factual questions at intake save wasted drives: property address, roof type if
          known, whether it's a leak or a full replacement, and whether an insurance claim is
          involved. Keep it to four or five fields. Anything more and people abandon the form.
        </p>
      </GuideSection>

      <GuideSection heading="Long decision cycles">
        <p>
          Homeowners compare bids, wait on adjusters and talk to family. Plan for weeks, not days:
          send the quote, then space out touches that add something — materials and warranty in one,
          scheduling availability in another — and set a clear end point instead of drifting off.
        </p>
      </GuideSection>

      <GuideSection heading="Inspection logistics">
        <p>
          Confirmations and day-before reminders cut no-shows, which are expensive when a crew has
          already driven out. A reschedule link in the reminder is better than a cancelled slot.
        </p>
      </GuideSection>

      <GuideSection heading="Keep claims work honest">
        <p>
          Automation can collect claim numbers and adjuster contacts. It should not tell a
          homeowner what their policy covers or what damage they have — that's for your inspector
          and their insurer.
        </p>
      </GuideSection>
    </GuideLayout>
  );
}