# Release Roadmap

## Product Direction

- Target first commercial release: `Android + RuStore`
- Monetization model: `hybrid`
- Guest mode first, account linking later
- Current web client stays as development shell and possible landing/demo channel

## Phase 1. Core Release Foundation

Status: `in progress`

- Separate player state by `playerId`
- Remove hardcoded API/CORS dev-only values
- Add `.env.example` files for backend and frontend
- Introduce stable player metadata in API responses
- Prepare project for staging and production configs

Definition of done:

- Every request is bound to a single player profile
- Frontend works with configurable API URL
- Backend accepts configurable client origins
- New developer can boot the project from example env files

## Phase 2. Guest Progress And Account Linking

Status: `in progress`

- Keep first-session flow as guest without registration wall
- Design backend model for `guest -> linked account`
- Decide auth method for Russia-first release
- Add progress migration path from guest profile to linked account

Current implementation decision:

- The user profile now keeps account-linking metadata even before real auth is enabled
- Player mode is derived as `guest` or `linked`
- First recommended provider for Russia-first Android release: `VK ID`
- Secondary future providers: `Telegram`, then `email`

Target linking flow:

1. Player installs app and starts as guest
2. Guest progress is stored under local player id
3. User chooses `Link account`
4. Backend validates provider identity
5. Guest profile is marked as linked without resetting progress
6. Future devices restore the same linked profile

Decision needed later:

- Email/password
- Telegram login
- VK ID
- Other provider

## Phase 3. Economy And Reward Hardening

Status: `planned`

- Split oversized game service into domain modules
- Expand automated tests for spawn, merge, income, daily rewards, boosts and edge cases
- Audit pacing for first session, first day and first week
- Replace fake ad reward calls with validated rewarded flow

Definition of done:

- Economy logic is test-covered at critical paths
- Rewarded bonuses cannot be claimed by direct API abuse
- Core balance tables are documented

## Phase 4. Android Packaging

Status: `in progress`

- Add Capacitor shell
- Configure Android app id, icons, splash and signing strategy
- Build APK/AAB pipeline
- Verify app behavior on real Android devices

Definition of done:

- Android project builds locally
- Game works inside packaged app
- Release candidate can be uploaded to RuStore

Current implementation decision:

- Capacitor Android shell already exists in the repo
- A native `MonetizationBridge` plugin scaffold is now added for future `RuStore Billing` and rewarded SDK wiring
- Current Android bridge still resolves to `mock` behavior until the real SDK layer is connected

## Phase 5. Monetization Integration

Status: `in progress`

- Add rewarded ads SDK
- Add IAP foundation
- Ship simple offer set:
  - starter pack
  - soft currency pack
  - no-ads or premium convenience pack
- Add entitlement handling on backend

Definition of done:

- Rewarded ads are tracked and validated
- Purchases change player entitlements safely
- Monetization events are visible in analytics

Current implementation decision:

- Rewarded ads already use backend `session -> complete -> grant` flow
- IAP foundation now uses the same server-side pattern
- Current providers are `mock` for local/dev flow and `rustore` as the target production provider
- First offer set in backend catalog:
  - `starter_pack`
  - `energy_pack_small`
  - `premium_no_ads`

## Phase 6. Analytics And Operations

Status: `planned`

- Add product analytics events
- Add crash reporting
- Add server logs for critical business actions
- Define release KPIs:
  - D1
  - D3
  - D7
  - ad completion rate
  - first purchase conversion
  - ARPDAU

## Phase 7. Store Readiness

Status: `planned`

- Privacy policy
- Support email
- Store assets
- Age rating
- RuStore release checklist
- Personal data compliance review for selected auth/ads/analytics stack

## Current Execution Order

1. Core release foundation
2. Guest-to-account design
3. Economy hardening
4. Android shell
5. Monetization SDKs
6. Analytics and store preparation
