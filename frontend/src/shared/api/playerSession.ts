const PLAYER_ID_STORAGE_KEY = "marge.playerId";
const PLAYER_ID_PREFIX = "guest";

const createPlayerId = (): string => {
  const randomPart =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "")
      : `${Date.now()}${Math.random().toString(36).slice(2, 10)}`;

  return `${PLAYER_ID_PREFIX}_${randomPart}`;
};

export const getOrCreatePlayerId = (): string => {
  const existingValue = window.localStorage.getItem(PLAYER_ID_STORAGE_KEY);
  if (existingValue) {
    return existingValue;
  }

  const playerId = createPlayerId();
  window.localStorage.setItem(PLAYER_ID_STORAGE_KEY, playerId);
  return playerId;
};

export const setPlayerId = (playerId: string): void => {
  window.localStorage.setItem(PLAYER_ID_STORAGE_KEY, playerId);
};

export const clearPlayerId = (): void => {
  window.localStorage.removeItem(PLAYER_ID_STORAGE_KEY);
};
