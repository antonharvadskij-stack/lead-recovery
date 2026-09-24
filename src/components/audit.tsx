import { useState } from "react";
import {
  questions,
  scoreAudit,
  classify,
  recommendations,
  maxScore,
} from "@/lib/audit";
import { track } from "@/lib/track";

// ADMIN NOTE — REPLACE BEFORE LAUNCH:
// hello@example.com is a placeholder. Swap it for a real inbox before going live.
const EARLY_ACCESS_EMAIL = "hello@example.com";

export function Audit() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    questions.map(() => null),
  );
  const [done, setDone] = useState(false);

  if (done) {
    const score = scoreAudit(answers as number[]);
    const tier = classify(score);
    return (
      <Results
        tier={tier}
        score={score}
        onRestart={() => {
          setAnswers(questions.map(() => null));
          setStep(0);
          setDone(false);
        }}
      />
    );
  }

  const question = questions[step]!;
  const selected = answers[step];
  const progress = ((step + (selected !== null ? 1 : 0)) / questions.length) * 100;

  const select = (i: number) => {
    if (step === 0 && answers.every((a) => a === null)) track("audit_start");
    const next = [...answers];
    next[step] = i;
    setAnswers(next);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-9">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>
          Question {step + 1} of {questions.length}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h3 className="mt-7 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {question.title}
      </h3>

      <div className="mt-5 space-y-2.5">
        {question.options.map((option, i) => {
          const active = selected === i;
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => select(i)}
              aria-pressed={active}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-[15px] transition-colors ${
                active
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                  active ? "border-primary" : "border-border"
                }`}
              >
                {active ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
              </span>
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="mt-7 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          disabled={selected === null}
          onClick={() => {
            if (step === questions.length - 1) {
              track("audit_complete");
              setDone(true);
            }
            else setStep((s) => s + 1);
          }}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {step === questions.length - 1 ? "See my plan" : "Next"}
        </button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Your answers stay in your browser. Nothing is stored or sent.
      </p>
    </div>
  );
}

function Results({
  tier,
  score,
  onRestart,
}: {
  tier: { title: string; summary: string };
  score: number;
  onRestart: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Your result
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {tier.title}
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{tier.summary}</p>
        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min(100, (score / maxScore) * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Automation gap score: {score} of {maxScore} (higher means more to gain)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {recommendations.map((rec) => (
          <div key={rec.title} className="rounded-2xl border border-border bg-card p-6">
            <h4 className="text-base font-semibold text-foreground">{rec.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{rec.body}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Recommended tool
        </p>
        <h4 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
          Start automating with HighLevel
        </h4>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          HighLevel can cover most of the plan above in one subscription: missed-call text back,
          instant replies, follow-up sequences, a single pipeline and online booking. It's not the
          only option — an existing CRM plus a texting tool can do the same job.
        </p>
        <a
          href="https://www.gohighlevel.com/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("tool_match_click")}
          className="mt-5 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft transition-colors hover:bg-primary/90"
        >
          Start automating →
        </a>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Disclosure: this is HighLevel's plain public website with no affiliate or tracking code,
          and we currently earn nothing if you sign up. If this ever becomes an affiliate link, we
          will say so here, and you would pay nothing extra.
        </p>
      </div>

      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-9">
        <h4 className="text-xl font-semibold tracking-tight text-foreground">
          Want the system instead of the checklist?
        </h4>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Lead Recovery is being built to run this for you: capture every inquiry from calls, forms and
          messages, reply within seconds, ask the qualifying questions, and keep following up until
          the customer books or opts out. It handles scheduling and messaging only — it never
          diagnoses work or replaces your licensed technicians.
        </p>
        <a
          href={`mailto:${EARLY_ACCESS_EMAIL}?subject=Lead%20Recovery%20early%20access`}
          className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-soft transition-colors hover:bg-primary/90"
        >
          Request early access
        </a>
        <p className="mt-3 text-xs text-muted-foreground">
          Opens your email app. We don't collect anything on this site.
        </p>
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="text-sm text-primary hover:underline"
      >
        Start the audit again
      </button>
    </div>
  );
}