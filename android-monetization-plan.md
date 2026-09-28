# Android monetization implementation

The game UI already exposes a rewarded-revive action. The native Android layer should implement the actual rewarded ad using Google Mobile Ads SDK.

Development rewarded test unit: ca-app-pub-3940256099942544/5224354917

The revive must only be granted from OnUserEarnedRewardListener. Do not grant it merely when the ad closes.

Production:
- Replace the test unit with the app's AdMob rewarded unit before release.
- Add the AdMob App ID to AndroidManifest.xml.
- Initialize the Mobile Ads SDK.
- Consider server-side verification for higher-value rewards.
- Add a Play Billing non-consumable product with ID neon_drop_remove_ads for permanent ad removal.

Google documentation:
https://developers.google.com/admob/android/rewarded
https://developer.android.com/google/play/billing/one-time-products
