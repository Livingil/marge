const PLAYER_ID_HEADER = "x-player-id";
const PLAYER_ID_MAX_LENGTH = 128;
const PLAYER_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

const normalizePlayerId = (value: string): string => value.trim();

export const getPlayerIdHeaderName = (): string => PLAYER_ID_HEADER;

export const resolvePlayerId = (rawHeaderValue: unknown): string => {
  const rawValue = Array.isArray(rawHeaderValue) ? rawHeaderValue[0] : rawHeaderValue;
  if (typeof rawValue !== "string") {
    throw new Error("Missing player id");
  }

  const playerId = normalizePlayerId(rawValue);
  if (!playerId) {
    throw new Error("Missing player id");
  }

  if (playerId.length > PLAYER_ID_MAX_LENGTH) {
    throw new Error("Player id is too long");
  }

  if (!PLAYER_ID_PATTERN.test(playerId)) {
    throw new Error("Player id contains unsupported characters");
  }

  return playerId;
};
