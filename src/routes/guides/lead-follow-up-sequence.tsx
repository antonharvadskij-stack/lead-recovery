import { createFileRoute } from "@tanstack/react-router";
import { GuideLayout, GuideSection } from "@/components/guide-layout";

export const Route = createFileRoute("/guides/lead-follow-up-sequence")({
  head: () => ({
    meta: [
      { title: "A lead follow-up sequence that doesn't annoy people — Lead Recovery" },
      {
        name: "description",
        content:
          "A 3–5 touch follow-up plan over two weeks for service businesses: what to send, when, and when to stop.",
      },
      { property: "og:title", content: "A follow-up sequence that doesn't annoy people" },
      {
        property: "og:description",
        content: "Messages, timing and stop rules for following up quotes that haven't booked.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://leadrelay.lovable.app/guides/lead-follow-up-sequence" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://leadrelay.lovable.app/guides/lead-follow-up-sequence" },
      { rel: "alternate", hrefLang: "en", href: "https://leadrelay.lovable.app/guides/lead-follow-up-sequence" },
      { rel: "alternate", hrefLang: "x-default", href: "https://leadrelay.lovable.app/guides/lead-follow-up-sequence" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <GuideLayout
      eyebrow="Guide"
      title="A follow-up sequence that doesn't annoy people"
      intro="Someone asked for a quote and went quiet. Usually that means life got in the way, not that they chose a competitor. A short, useful sequence gives them an easy way back."
    >
      <GuideSection heading="The shape of it">
        <p>
          Three to five touches spread over roughly two weeks, mixing text and email. Each one adds
          something — an answer, a reminder, an option — rather than repeating "just checking in."
          Every message carries a clear next step and an easy way to stop.
        </p>
      </GuideSection>

      <GuideSection heading="A workable schedule">
        <p>
          <strong className="text-foreground">Day 0, within minutes:</strong> confirm the request
          and state what happens next. "Got your request for the water-heater quote — I'll have
          numbers to you by 5pm today."
        </p>
        <p>
          <strong className="text-foreground">Day 1:</strong> the quote itself, with a booking link
          and one line on what's included.
        </p>
        <p>
          <strong className="text-foreground">Day 3:</strong> answer the question people usually
          ask at this point — timing, warranty, whether the old unit is hauled away.
        </p>
        <p>
          <strong className="text-foreground">Day 7:</strong> offer availability. Two concrete
          slots beat "let me know when suits."
        </p>
        <p>
          <strong className="text-foreground">Day 14:</strong> close the loop. "I'll stop following
          up here — the quote stands for 30 days if you want it."
        </p>
      </GuideSection>

      <GuideSection heading="Stop rules">
        <p>
          Stop the sequence the moment someone replies, books, or opts out — nothing damages trust
          faster than an automated nudge arriving after a customer already said yes. Honour STOP
          and unsubscribe instantly, and keep the whole thing to business hours.
        </p>
      </GuideSection>

      <GuideSection heading="Check the leak before adding more leads">
        <p>
          A useful diagnostic is to trace one inquiry from first contact to booked job: when it
          arrived, when someone responded, when the quote was sent, and when the next follow-up
          happened. If any handoff depends on someone remembering to do it, that is a process gap
          worth fixing before buying more lead volume.
        </p>
      </GuideSection>

      <GuideSection heading="What to measure">
        <p>
          Count how many quotes enter the sequence, how many reply, and how many book. If replies
          concentrate on one message, that's the one worth copying. If opt-outs spike on another,
          cut it.
        </p>
      </GuideSection>
    </GuideLayout>
  );
}