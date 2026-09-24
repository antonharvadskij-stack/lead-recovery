import { createFileRoute } from "@tanstack/react-router";
import { GuideLayout, GuideSection } from "@/components/guide-layout";

export const Route = createFileRoute("/guides/plumbing-automation")({
  head: () => ({
    meta: [
      { title: "Plumbing lead automation: urgency, after-hours and intake — Lead Recovery" },
      {
        name: "description",
        content:
          "How plumbing companies can sort urgent from routine jobs, handle after-hours calls, and collect the address before calling back.",
      },
      { property: "og:title", content: "Automation for plumbing companies" },
      {
        property: "og:description",
        content: "Urgency sorting, after-hours intake and faster callbacks for plumbing teams.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://leadrelay.lovable.app/guides/plumbing-automation" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://leadrelay.lovable.app/guides/plumbing-automation" },
      { rel: "alternate", hrefLang: "en", href: "https://leadrelay.lovable.app/guides/plumbing-automation" },
      { rel: "alternate", hrefLang: "x-default", href: "https://leadrelay.lovable.app/guides/plumbing-automation" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <GuideLayout
      eyebrow="Industry guide"
      title="Automation for plumbing companies"
      intro="Plumbing inquiries rarely wait. Someone with water on the floor will call three companies in five minutes, and the one that answers or texts back first usually gets the job."
    >
      <GuideSection heading="Answer, or text within seconds">
        <p>
          If a call rings out, an immediate text keeps you in the running: who you are, that you
          saw the call, and one question. For emergency work this single automation matters more
          than anything else on your website.
        </p>
      </GuideSection>

      <GuideSection heading="Separate emergency from routine">
        <p>
          Ask two factual questions up front — is water currently escaping, and can it be shut off?
          That's enough to route the request. Don't have an automated system tell someone what's
          wrong with their pipes or how to fix it; collect facts and hand over to a licensed
          plumber.
        </p>
      </GuideSection>

      <GuideSection heading="Collect the address before the callback">
        <p>
          A callback that starts with "where are you?" wastes the first minute and sometimes rules
          the job out entirely. Capture the address and the access situation at intake so
          dispatch can check the service area and assign the nearest van.
        </p>
      </GuideSection>

      <GuideSection heading="After hours">
        <p>
          Be explicit rather than silent. An auto-reply that says when you're back, what counts as
          an emergency, and how to reach the on-call number sets expectations — and it stops people
          calling the next company just to find out whether you exist.
        </p>
      </GuideSection>

      <GuideSection heading="Routine work deserves follow-up too">
        <p>
          Bathroom refits, water heaters and repipes get quoted and considered. Those belong in a
          short follow-up sequence, separate from emergency traffic.
        </p>
      </GuideSection>
    </GuideLayout>
  );
}