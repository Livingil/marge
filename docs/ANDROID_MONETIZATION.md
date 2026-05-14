# Android Monetization Bridge

Current state:

- Capacitor Android shell is present
- `MonetizationBridge` plugin exists in:
  - `frontend/android/app/src/main/java/ru/marge/game/MonetizationBridgePlugin.java`
- Web client routes rewarded ads and purchases through:
  - `frontend/src/shared/monetization/monetizationBridge.ts`
- Backend already supports:
  - rewarded ad sessions
  - purchase sessions
  - purchase entitlements

## What is already wired

- Web/dev builds use `mock` provider flow
- Android exposes monetization capabilities through native plugin
- Android manifest has callback deep link shape:
  - scheme: `ru.marge.game`
  - host: `payment`
- BuildConfig flags exist:
  - `RUSTORE_BILLING_ENABLED`
  - `RUSTORE_BILLING_ENVIRONMENT`
  - `RUSTORE_PAYMENT_CALLBACK_HOST`
  - `RUSTORE_PAYMENT_SCHEME`
  - `RUSTORE_CONSOLE_APP_ID`
- Android manifest already contains RuStore metadata:
  - `console_app_id_value`
  - `sdk_pay_scheme_value`
- Android app now declares official Pay SDK dependency coordinates in Gradle

## What is not connected yet

- Real RuStore Billing SDK dependency
- Native purchase launch flow
- Native purchase confirmation / callback handling
- Provider-side verification handoff to backend
- Rewarded ads native SDK

## Verified current RuStore direction

- Official docs currently point to `Pay SDK 10.3.1`
- Dependency path is now based on:
  - `ru.rustore.sdk:bom:2026.04.02`
  - `ru.rustore.sdk:pay`
- Legacy `billingclient` path is deprecated and should not be used for new integration

## Next implementation step

1. Set local Android SDK path via:
   - `frontend/android/local.properties`
   - or `ANDROID_HOME`
2. Set real RuStore project properties:
   - `RUSTORE_BILLING_ENABLED=true`
   - `RUSTORE_CONSOLE_APP_ID=...`
3. Replace `launchPurchase()` mock branch with real SDK purchase start.
4. Map SDK purchase result to:
   - `provider = "rustore"`
   - `transactionId`
5. Keep backend completion on `/purchases/session/complete`.

## Safety rule

Do not flip `RUSTORE_BILLING_ENABLED` to `true` until native SDK flow is actually implemented, otherwise Android clients will stop falling back to safe mock mode and purchases will reject immediately.
