# Lead Recovery

Lead Recovery is a free audit tool for local service businesses. It helps identify where inbound inquiries can be lost through missed calls, slow response, weak follow-up, and unclear lead ownership.

## Product hypothesis

The project is intentionally positioned as a diagnostic layer rather than another AI receptionist. The audit identifies potential leakage points first; the product can then guide users toward relevant fixes and tools.

## Status

- Public MVP: hosted on Lovable while infrastructure is being migrated.
- Source of truth: this GitHub repository.
- Validation priority: completed audits and downstream intent, not vanity traffic.
- Paid development and advertising: paused during demand validation.

## Local development

Requirements: Node.js 20+ or Bun.

```bash
git clone https://github.com/antonharvadskij-stack/lead-recovery.git
cd lead-recovery
bun install
bun run dev
```

For a production build:

```bash
bun run build
```

## Repository structure

- `src/routes/` — application routes and SEO content
- `src/components/` — reusable UI and audit components
- `src/lib/` — audit, tracking, SEO, and utility logic
- `public/` — static assets
- `vite.config.ts` / `src/server.ts` — application/runtime configuration

## Validation principles

1. Prefer free distribution while validating demand.
2. Measure real product use, not artificial engagement.
3. Do not fabricate users, reviews, votes, or traffic.
4. Keep secrets and credentials out of Git.
5. Make changes reproducible and reviewable through commits.
