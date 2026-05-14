import assert from "node:assert/strict";
import test from "node:test";
import { verifyRewardedAdCompletion } from "./rewardedAdVerification.js";

test("rewarded ad verification accepts mock provider", async () => {
  const result = await verifyRewardedAdCompletion({
    provider: "mock",
    boostType: "rewarded_free_spawn",
    sessionId: "session-1"
  });

  assert.equal(result.provider, "mock");
  assert.equal(result.boostType, "rewarded_free_spawn");
  assert.equal(result.sessionId, "session-1");
});

test("rewarded ad verification blocks vkads until native integration is connected", async () => {
  await assert.rejects(
    () =>
      verifyRewardedAdCompletion({
        provider: "vkads",
        boostType: "rewarded_flow_boost",
        sessionId: "session-2"
      }),
    /VK Ads rewarded verification/
  );
});
