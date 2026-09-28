# Neon Drop analytics events

Recommended events for the production build:

- `game_start` — every new run
- `gate_passed` — include score
- `game_over` — include score and best score
- `new_best` — include score
- `daily_bonus_claimed`
- `shop_open`
- `cosmetic_purchase` — include cosmetic ID and coin cost
- `rewarded_ad_started`
- `rewarded_ad_completed`
- `revive_used`
- `remove_ads_purchase`

The current prototype intentionally keeps analytics local/offline. Production analytics can be connected later through Firebase Analytics or another privacy-compliant analytics provider.
