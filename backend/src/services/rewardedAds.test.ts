import test from "node:test";
import assert from "node:assert/strict";
import {
  assertRewardedAdBoostSupported,
  assertRewardedAdLimitAvailable,
  completeRewardedAdSession,
  createRewardedAdSession,
  expireRewardedAdSessions,
  markRewardedAdSessionGranted,
  trimRewardedAdSessions
} from "./rewardedAds.js";
import { AD_BOOST_LIMITS, createEmptyAdBoostClaims, setAdBoostUsage } from "./adBoosts.js";

test("rewardedAds creates started session with ttl", () => {
  const now = new Date("2026-05-09T10:00:00.000Z");
  const session = createRewardedAdSession("rewarded_free_spawn", now, "mock", "gameboard_utility");

  assert.equal(session.boostType, "rewarded_free_spawn");
  assert.equal(session.status, "started");
  assert.equal(session.provider, "mock");
  assert.equal(session.placement, "gameboard_utility");
  assert.equal(session.completedAt, null);
  assert.equal(session.rewardedAt, null);
  assert.equal(session.expiresAt.toISOString(), "2026-05-09T10:10:00.000Z");
});

test("rewardedAds rejects unsupported offline income boost", () => {
  assert.throws(
    () => assertRewardedAdBoostSupported("rewarded_double_offline_income"),
    /офлайн-сбора/
  );
});

test("rewardedAds enforces daily limit before starting", () => {
  const claims = setAdBoostUsage(
    createEmptyAdBoostClaims("2026-05-09"),
    "rewarded_free_delete",
    AD_BOOST_LIMITS.rewarded_free_delete
  );

  assert.throws(
    () => assertRewardedAdLimitAvailable(claims, "rewarded_free_delete"),
    /Дневной лимит/
  );
});

test("rewardedAds completes and grants session only once", () => {
  const now = new Date("2026-05-09T10:00:00.000Z");
  const session = createRewardedAdSession("rewarded_flow_boost", now);

  const completed = completeRewardedAdSession([session], session.sessionId, "rewarded_flow_boost", now);
  assert.equal(completed[0]?.status, "completed");
  assert.equal(completed[0]?.completedAt?.toISOString(), now.toISOString());

  const rewarded = markRewardedAdSessionGranted(completed, session.sessionId, now);
  assert.equal(rewarded[0]?.status, "rewarded");
  assert.equal(rewarded[0]?.rewardedAt?.toISOString(), now.toISOString());

  assert.throws(
    () => markRewardedAdSessionGranted(rewarded, session.sessionId, now),
    /не готова к выдаче/
  );
});

test("rewardedAds expires old started sessions", () => {
  const startedAt = new Date("2026-05-09T10:00:00.000Z");
  const session = createRewardedAdSession("rewarded_free_spawn", startedAt);
  const expired = expireRewardedAdSessions([session], new Date("2026-05-09T10:11:00.000Z"));

  assert.equal(expired[0]?.status, "expired");
});

test("rewardedAds trims old history", () => {
  const sessions = Array.from({ length: 25 }, (_, index) =>
    createRewardedAdSession("rewarded_free_spawn", new Date(`2026-05-09T10:${String(index).padStart(2, "0")}:00.000Z`))
  );

  const trimmed = trimRewardedAdSessions(sessions);

  assert.equal(trimmed.length, 20);
  assert.ok(trimmed[0].createdAt.getTime() >= trimmed[19].createdAt.getTime());
});
