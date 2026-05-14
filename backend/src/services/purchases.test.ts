import assert from "node:assert/strict";
import test from "node:test";
import {
  assertPurchaseAllowed,
  completePurchaseSession,
  createPurchaseSession,
  expirePurchaseSessions,
  getPurchaseOffer,
  grantPurchaseSession,
  hasProcessedTransaction,
  trimPurchaseHistory,
  trimPurchaseSessions
} from "./purchases.js";

test("purchase catalog exposes active release offers", () => {
  const starter = getPurchaseOffer("starter_pack");
  const noAds = getPurchaseOffer("premium_no_ads");

  assert.equal(starter.isActive, true);
  assert.equal(starter.rewards.energy > 0, true);
  assert.equal(noAds.rewards.removeAds, true);
});

test("purchase restrictions block repeated non-consumables", () => {
  assert.throws(
    () => assertPurchaseAllowed("starter_pack", { removeAds: false, starterPackPurchasedAt: new Date() }),
    /Стартовый набор/
  );
  assert.throws(
    () => assertPurchaseAllowed("premium_no_ads", { removeAds: true, starterPackPurchasedAt: null }),
    /Отключение рекламы/
  );
});

test("purchase sessions complete and grant once", () => {
  const now = new Date("2026-05-09T10:00:00.000Z");
  const session = createPurchaseSession("energy_pack_small", now);

  const completed = completePurchaseSession([session], session.sessionId, "tx-1", now);
  assert.equal(completed[0]?.status, "completed");
  assert.equal(completed[0]?.transactionId, "tx-1");

  const granted = grantPurchaseSession(completed, session.sessionId, now);
  assert.equal(granted[0]?.status, "granted");
  assert.equal(granted[0]?.grantedAt?.toISOString(), now.toISOString());
});

test("purchase sessions expire after ttl", () => {
  const startedAt = new Date("2026-05-09T10:00:00.000Z");
  const session = createPurchaseSession("starter_pack", startedAt);
  const expired = expirePurchaseSessions([session], new Date("2026-05-09T10:31:00.000Z"));

  assert.equal(expired[0]?.status, "expired");
});

test("purchase history prevents duplicate transaction ids", () => {
  const history = trimPurchaseHistory([
    {
      productId: "starter_pack",
      provider: "mock",
      transactionId: "tx-dup",
      grantedAt: new Date("2026-05-09T10:00:00.000Z")
    }
  ]);

  assert.equal(hasProcessedTransaction(history, "tx-dup"), true);
  assert.equal(hasProcessedTransaction(history, "tx-new"), false);
});

test("purchase session history is trimmed to latest entries", () => {
  const sessions = Array.from({ length: 25 }, (_, index) =>
    createPurchaseSession("energy_pack_small", new Date(`2026-05-09T10:${String(index).padStart(2, "0")}:00.000Z`))
  );

  const trimmed = trimPurchaseSessions(sessions);

  assert.equal(trimmed.length, 20);
  assert.ok(trimmed[0].createdAt.getTime() >= trimmed[19].createdAt.getTime());
});
