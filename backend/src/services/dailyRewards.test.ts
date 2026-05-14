import assert from "node:assert/strict";
import test from "node:test";
import {
  buildWeeklyRewards,
  canClaimDailyReward,
  getDailyRewardByDay,
  getDayInCycle,
  getNextDailyClaimAt,
  isYesterdayUtc,
  toDateKeyUtc
} from "./dailyRewards.js";

test("getDayInCycle wraps reward days after full week", () => {
  assert.equal(getDayInCycle(0), 1);
  assert.equal(getDayInCycle(1), 1);
  assert.equal(getDayInCycle(7), 7);
  assert.equal(getDayInCycle(8), 1);
  assert.equal(getDayInCycle(15), 1);
});

test("getDailyRewardByDay falls back to first reward for invalid index", () => {
  assert.deepEqual(getDailyRewardByDay(1), { energy: 18, freeSpawns: 0, freeDeletes: 0 });
  assert.deepEqual(getDailyRewardByDay(999), { energy: 18, freeSpawns: 0, freeDeletes: 0 });
});

test("canClaimDailyReward allows only one claim per UTC day", () => {
  const firstClaim = new Date("2026-05-09T08:00:00.000Z");
  const sameDayLater = new Date("2026-05-09T20:00:00.000Z");
  const nextDay = new Date("2026-05-10T00:01:00.000Z");

  assert.equal(canClaimDailyReward(null, firstClaim), true);
  assert.equal(canClaimDailyReward(firstClaim, sameDayLater), false);
  assert.equal(canClaimDailyReward(firstClaim, nextDay), true);
});

test("getNextDailyClaimAt returns the next UTC day boundary from last claim date", () => {
  const lastClaim = new Date("2026-05-09T18:45:00.000Z");
  const nextClaimAt = getNextDailyClaimAt(lastClaim);

  assert.equal(nextClaimAt?.toISOString(), "2026-05-10T00:00:00.000Z");
});

test("isYesterdayUtc correctly detects consecutive claim days", () => {
  const lastClaim = new Date("2026-05-09T23:59:00.000Z");
  const nextDay = new Date("2026-05-10T01:00:00.000Z");
  const skippedDay = new Date("2026-05-11T01:00:00.000Z");

  assert.equal(isYesterdayUtc(lastClaim, nextDay), true);
  assert.equal(isYesterdayUtc(lastClaim, skippedDay), false);
});

test("buildWeeklyRewards marks completed and current entries consistently", () => {
  const claimableWeek = buildWeeklyRewards(3, true);
  assert.equal(claimableWeek[0]?.claimed, true);
  assert.equal(claimableWeek[1]?.claimed, true);
  assert.equal(claimableWeek[2]?.isToday, true);
  assert.equal(claimableWeek[2]?.claimed, false);

  const alreadyClaimedWeek = buildWeeklyRewards(3, false);
  assert.equal(alreadyClaimedWeek[2]?.claimed, true);
});

test("toDateKeyUtc formats UTC dates without local timezone drift", () => {
  const date = new Date("2026-05-09T23:15:00.000Z");
  assert.equal(toDateKeyUtc(date), "2026-05-09");
});
