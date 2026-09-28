# AdMob production switch

The Android rewarded-revive flow is prepared. During development use Google's official rewarded test ad unit `ca-app-pub-3940256099942544/5224354917`; replace it with the app's own AdMob rewarded ad unit before release. Google states that test ads should be used during development to avoid invalid activity/account risk. See: https://developers.google.com/admob/android/test-ads

Production checklist:
1. Create the Neon Drop app in AdMob.
2. Create a Rewarded ad unit.
3. Replace the test unit ID in the Android integration.
4. Verify test-device behavior and reward callback.
5. Only then release the production build.

For the premium `remove_ads` product, use a Google Play non-consumable one-time product. Google Play Billing supports permanent one-time benefits such as an ad-free version.