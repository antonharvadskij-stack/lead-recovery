// Privacy-safe event hooks. Only an event name is recorded — never answers, IDs or personal data.
// The platform's built-in analytics counts page views only, so events are pushed to
// window.dataLayer, ready for a future analytics tool. Nothing is sent anywhere today.
export type TrackEvent =
  | "audit_start"
  | "audit_complete"
  | "detector_use"
  | "tool_match_click"
  | "starter_kit_click";

export function track(event: TrackEvent) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event });
}