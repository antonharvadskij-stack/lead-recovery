// Audit questions, client-side scoring and recommendations.
// Everything here runs in the browser. No data is stored or transmitted.

export type Option = { label: string; points: number };
export type Question = { id: string; title: string; options: Option[] };

// points = "automation gap". Higher points = bigger opportunity.
export const questions: Question[] = [
  {
    id: "industry",
    title: "What type of business do you run?",
    options: [
      { label: "HVAC / heating & cooling", points: 0 },
      { label: "Plumbing", points: 0 },
      { label: "Roofing", points: 0 },
      { label: "Electrical", points: 0 },
      { label: "Cleaning / landscaping / other local service", points: 0 },
    ],
  },
  {
    id: "channels",
    title: "How do new customers usually contact you?",
    options: [
      { label: "Phone calls", points: 2 },
      { label: "Website forms", points: 1 },
      { label: "Google / social messages", points: 2 },
      { label: "Several of these", points: 3 },
      { label: "Mostly referrals / walk-ins", points: 1 },
    ],
  },
  {
    id: "missedCalls",
    title: "What happens when you miss a call?",
    options: [
      { label: "They get voicemail and we call back later", points: 3 },
      { label: "We send an automatic text", points: 0 },
      { label: "Someone else answers it", points: 1 },
      { label: "I'm not sure", points: 4 },
      { label: "We usually lose the lead", points: 5 },
    ],
  },
  {
    id: "speed",
    title: "How quickly do new web leads get a response?",
    options: [
      { label: "Under 1 minute", points: 0 },
      { label: "1–5 minutes", points: 1 },
      { label: "5–30 minutes", points: 3 },
      { label: "More than 30 minutes", points: 4 },
      { label: "It depends / nobody tracks it", points: 5 },
    ],
  },
  {
    id: "followUp",
    title: "Do you automatically follow up with people who don't book?",
    options: [
      { label: "Yes, by text and email", points: 0 },
      { label: "Yes, but manually", points: 3 },
      { label: "Only once", points: 3 },
      { label: "No", points: 5 },
      { label: "I don't know", points: 4 },
    ],
  },
  {
    id: "storage",
    title: "Where do you keep your leads?",
    options: [
      { label: "CRM", points: 0 },
      { label: "Spreadsheet", points: 2 },
      { label: "Email / inbox", points: 3 },
      { label: "Phone contacts / texts", points: 4 },
      { label: "Several places", points: 5 },
    ],
  },
  {
    id: "booking",
    title: "Can customers book an appointment without speaking to someone?",
    options: [
      { label: "Yes", points: 0 },
      { label: "Sometimes", points: 2 },
      { label: "No", points: 4 },
      { label: "Only for certain services", points: 2 },
    ],
  },
  {
    id: "volume",
    title: "How many new inquiries do you get in a typical month?",
    options: [
      { label: "0–10", points: 1 },
      { label: "11–30", points: 2 },
      { label: "31–75", points: 3 },
      { label: "76–150", points: 4 },
      { label: "150+", points: 4 },
    ],
  },
];

export const maxScore = questions.reduce(
  (sum, q) => sum + Math.max(...q.options.map((o) => o.points)),
  0,
);

export type Tier = {
  title: string;
  summary: string;
};

export function scoreAudit(answers: number[]): number {
  return answers.reduce(
    (sum, optionIndex, i) => sum + (questions[i]?.options[optionIndex]?.points ?? 0),
    0,
  );
}

export function classify(score: number): Tier {
  if (score >= 22) {
    return {
      title: "High opportunity to automate",
      summary:
        "Inquiries are arriving faster than your current process can handle them. The fixes below are mostly one-time setups that keep working without extra staff time.",
    };
  }
  if (score >= 12) {
    return {
      title: "Several easy wins are being missed",
      summary:
        "The basics are partly in place. A few targeted changes to response speed and follow-up would close most of the gap.",
    };
  }
  return {
    title: "You have a workable base — now remove the manual steps",
    summary:
      "Your process holds up. The remaining gains come from removing steps that still depend on someone remembering to do them.",
  };
}

export type Recommendation = { title: string; body: string };

export const recommendations: Recommendation[] = [
  {
    title: "1. Instant lead response",
    body: "Send an automatic reply the moment a form, chat or message comes in — confirming you received it and asking one qualifying question (address, issue, urgency). Aim to open the conversation in under a minute, then let a human take over.",
  },
  {
    title: "2. Missed-call text back",
    body: "When a call goes unanswered, fire an immediate text: who you are, that you saw the call, and a question or booking link. Most callers will simply move to the next company if nothing happens, so this single automation usually recovers the most work.",
  },
  {
    title: "3. Follow-up sequence",
    body: "People who ask for a quote but don't book aren't lost — they're busy. A short sequence of 3–5 touches over about two weeks by text and email, each with a clear next step and an easy opt-out, keeps the job alive without nagging.",
  },
  {
    title: "4. Single lead pipeline",
    body: "Route calls, forms and social messages into one list with clear stages: new, contacted, quoted, booked, lost. Leads spread over an inbox, a phone and a spreadsheet are the ones that quietly disappear.",
  },
  {
    title: "5. Measurement",
    body: "Track four numbers each month: inquiries received, first-response time, quotes sent, and jobs booked. Without them you can't tell whether a change helped — and you can't spot the week your intake broke.",
  },
];