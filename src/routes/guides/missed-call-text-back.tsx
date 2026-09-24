import { createFileRoute } from "@tanstack/react-router";
import { GuideLayout, GuideSection } from "@/components/guide-layout";

export const Route = createFileRoute("/guides/missed-call-text-back")({
  head: () => ({
    meta: [
      { title: "Missed-call text back: how to set it up properly — Lead Recovery" },
      {
        name: "description",
        content:
          "What to send when a service call goes unanswered, how quickly, and the setup mistakes that make automatic texts feel robotic.",
      },
      { property: "og:title", content: "Missed-call text back, set up properly" },
      {
        property: "og:description",
        content: "The message, the timing and the mistakes to avoid when a call goes unanswered.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://leadrelay.lovable.app/guides/missed-call-text-back" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://leadrelay.lovable.app/guides/missed-call-text-back" },
      { rel: "alternate", hrefLang: "en", href: "https://leadrelay.lovable.app/guides/missed-call-text-back" },
      { rel: "alternate", hrefLang: "x-default", href: "https://leadrelay.lovable.app/guides/missed-call-text-back" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <GuideLayout
      eyebrow="Guide"
      title="Missed-call text back, set up properly"
      intro="An unanswered call from a new customer is a decision point: they either wait for you or dial the next company. A text sent within seconds turns that dead end into a conversation."
    >
      <GuideSection heading="What it actually is">
        <p>
          When a call to your business line rings out, goes to voicemail, or arrives outside hours,
          your system automatically sends the caller an SMS. That's it. No one has to notice the
          missed call or remember to act.
        </p>
      </GuideSection>

      <GuideSection heading="Timing">
        <p>
          Send it immediately — within a few seconds of the call ending. The value comes from
          reaching the caller while your business is still the one they were thinking about. A text
          that arrives twenty minutes later competes with whoever picked up in the meantime.
        </p>
      </GuideSection>

      <GuideSection heading="What to write">
        <p>
          Identify yourself, acknowledge the call, ask one question, and give a way forward.
          Something like:
        </p>
        <p className="rounded-xl border border-border bg-surface p-4 text-foreground">
          "Hi, this is Dana at Northside Plumbing — sorry we missed your call. What's going on and
          what's your address? I can get you a time today. Reply STOP to opt out."
        </p>
        <p>
          One question, not five. The goal is a reply, not a completed intake form. Keep it in
          plain language, and don't pretend a human typed it in real time if it can't hold a
          conversation.
        </p>
      </GuideSection>

      <GuideSection heading="Common mistakes">
        <p>
          Sending to landlines — check the number is mobile, or you'll pay for messages that never
          arrive. Sending from a number no one monitors, so replies vanish. Writing a paragraph of
          marketing instead of a question. Forgetting an opt-out, which is both rude and, in most
          places, a legal requirement for business texting.
        </p>
      </GuideSection>

      <GuideSection heading="How to check it's working">
        <p>
          Call your own line from a mobile and let it ring out. Time how long the text takes and
          reply to it — the reply should land where your team will see it. Then, monthly, count
          missed calls and how many turned into a conversation.
        </p>
      </GuideSection>
    </GuideLayout>
  );
}