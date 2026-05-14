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

## When rewarded ads are triggered in the current game flow

Rewarded ads are triggered only from ad-boost actions (`Бонусы` panel):

- `+1 синтез` (`rewarded_free_spawn`)
- `+1 утилизация` (`rewarded_free_delete`)
- `x2 поток на 30 мин` (`rewarded_flow_boost`)

Not triggered:

- `x2 офлайн-сбор` (`rewarded_double_offline_income`) is visible but disabled in logic.
- Daily bonus claim is not ad-based.
- Spawn, merge, delete, income claim, and base upgrades do not auto-show ads.

Flow per click:

1. Frontend creates ad session: `POST /ad-boosts/session`
2. Native layer opens rewarded flow (`MonetizationBridge.launchRewardedAd`)
3. If completed, frontend finalizes reward: `POST /ad-boosts/session/complete`

If ad flow is canceled/failed, step 3 is not called and no reward is granted.

Additional auto-ad behavior:

- App now attempts an automatic rewarded ad launch every 10 minutes (`placement=auto_10m`).
- Auto launch works only on Android native and only when rewarded provider is non-`mock`.
- Auto ads do not call reward session completion endpoint, so they do not grant gameplay bonuses.

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

## VK rewarded quick setup (current implementation)

The Android plugin now supports real myTarget/VK rewarded flow when enabled.

Required Gradle properties (project `android/gradle.properties` or global `~/.gradle/gradle.properties`):

- `VK_REWARDED_ENABLED=true`
- `VK_REWARDED_SLOT_ID=<your rewarded slot id>`
- `VK_REWARDED_PLACEMENT=gameboard_utility` (or your placement label)

Backend gate for temporary client-trust mode (until server-side VK verification is added):

- `REWARDED_VKADS_TRUST_CLIENT=true`

Important:

- Keep `REWARDED_VKADS_TRUST_CLIENT=false` in production unless you implement provider-side verification callback/signature checks.

## Safety rule

Do not flip `RUSTORE_BILLING_ENABLED` to `true` until native SDK flow is actually implemented, otherwise Android clients will stop falling back to safe mock mode and purchases will reject immediately.
