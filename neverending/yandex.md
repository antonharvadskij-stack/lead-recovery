# NEVERENDING — Yandex Games release plan

Target: browser-first Yandex Games build.

Release architecture:
- HTML5 game with no required installation.
- Yandex Games SDK integration should be added only in the platform build.
- Rewarded ads belong at natural pauses such as run-end or optional revive.
- Purchases should be cosmetic or convenience-based, never pay-to-win.
- Analytics should measure starts, session length, run-end, event choices, returns and monetization conversion.

Pre-publication QA:
1. Test touch controls on Android and iOS browsers.
2. Test desktop pointer controls.
3. Verify pause/focus behavior.
4. Verify local progress and first-run state.
5. Add platform SDK and test ads in the Yandex Games test environment.
6. Submit the build for moderation only after the core loop is stable.
