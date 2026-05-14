import assert from "node:assert/strict";
import test from "node:test";
import { getPlayerIdHeaderName, resolvePlayerId } from "./player.service.js";

test("player header name stays stable for client and server integration", () => {
  assert.equal(getPlayerIdHeaderName(), "x-player-id");
});

test("resolvePlayerId accepts a valid guest id", () => {
  const playerId = resolvePlayerId("guest_abc123XYZ");
  assert.equal(playerId, "guest_abc123XYZ");
});

test("resolvePlayerId trims surrounding whitespace", () => {
  const playerId = resolvePlayerId("  guest_trimmed_01  ");
  assert.equal(playerId, "guest_trimmed_01");
});

test("resolvePlayerId rejects missing value", () => {
  assert.throws(() => resolvePlayerId(undefined), /Missing player id/);
});

test("resolvePlayerId rejects unsupported characters", () => {
  assert.throws(() => resolvePlayerId("guest:bad:value"), /unsupported characters/);
});

test("resolvePlayerId rejects too long values", () => {
  const tooLongPlayerId = `guest_${"a".repeat(130)}`;
  assert.throws(() => resolvePlayerId(tooLongPlayerId), /too long/);
});
