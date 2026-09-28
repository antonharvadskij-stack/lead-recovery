# Neon Drop monetization plan

## Rewarded ads
Primary flow: after Game Over, offer an optional rewarded ad for one revive. The player should receive the revive only after the ad reward callback fires. During development, use Google's official test rewarded-ad unit; replace it only after the AdMob app and ad unit are created. Google warns that production ad IDs must not be used during development.

## One-time premium
Product ID: `neon_drop_remove_ads`
Suggested product: permanently remove interstitial/banner ads and unlock a small cosmetic bonus.

## Economy
Coins are currently earned every 5 gates and stored locally. Coins can later be spent on cosmetic ball trails/background themes.

## Important
Real purchases should be verified and acknowledged through Google Play Billing; do not treat a client-only flag as proof of payment.
