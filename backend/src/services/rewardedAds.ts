import { randomUUID } from "node:crypto";
import { AD_BOOST_LIMITS, getAdBoostUsage, type AdBoostClaimsState } from "./adBoosts.js";
import type { AdBoostType, RewardedAdProvider, RewardedAdSessionStatus } from "./game.types.js";

export type RewardedAdSessionState = {
  sessionId: string;
  boostType: AdBoostType;
  provider: RewardedAdProvider;
  placement: string;
  status: RewardedAdSessionStatus;
  createdAt: Date;
  expiresAt: Date;
  completedAt: Date | null;
  rewardedAt: Date | null;
};

export const REWARDED_AD_SESSION_TTL_MS = 10 * 60 * 1000;
export const REWARDED_AD_SUPPORTED_PROVIDERS: RewardedAdProvider[] = ["mock", "vkads", "rustore"];
export const REWARDED_AD_DEFAULT_PROVIDER: RewardedAdProvider = "mock";
export const REWARDED_AD_DEFAULT_PLACEMENT = "gameboard_utility";
export const REWARDED_AD_HISTORY_LIMIT = 20;

export const assertRewardedAdBoostSupported = (boostType: AdBoostType): void => {
  if (boostType === "rewarded_double_offline_income") {
    throw new Error("Буст офлайн-сбора пока не активирован");
  }
};

export const assertRewardedAdLimitAvailable = (
  claims: AdBoostClaimsState,
  boostType: AdBoostType
): void => {
  const currentUsage = getAdBoostUsage(claims, boostType);
  const dailyLimit = AD_BOOST_LIMITS[boostType];

  if (currentUsage >= dailyLimit) {
    throw new Error("Дневной лимит бонуса исчерпан");
  }
};

export const expireRewardedAdSessions = (
  sessions: RewardedAdSessionState[],
  now: Date
): RewardedAdSessionState[] => {
  return sessions.map((session) => {
    if (session.status !== "started" || session.expiresAt.getTime() > now.getTime()) {
      return session;
    }

    return {
      ...session,
      status: "expired" as const
    };
  });
};

export const trimRewardedAdSessions = (sessions: RewardedAdSessionState[]): RewardedAdSessionState[] => {
  return [...sessions]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .slice(0, REWARDED_AD_HISTORY_LIMIT);
};

export const createRewardedAdSession = (
  boostType: AdBoostType,
  now: Date,
  provider: RewardedAdProvider = REWARDED_AD_DEFAULT_PROVIDER,
  placement = REWARDED_AD_DEFAULT_PLACEMENT
): RewardedAdSessionState => ({
  sessionId: randomUUID(),
  boostType,
  provider,
  placement,
  status: "started",
  createdAt: now,
  expiresAt: new Date(now.getTime() + REWARDED_AD_SESSION_TTL_MS),
  completedAt: null,
  rewardedAt: null
});

export const completeRewardedAdSession = (
  sessions: RewardedAdSessionState[],
  sessionId: string,
  boostType: AdBoostType,
  now: Date
): RewardedAdSessionState[] => {
  let matched = false;

  const updatedSessions = sessions.map((session) => {
    if (session.sessionId !== sessionId) {
      return session;
    }

    matched = true;

    if (session.boostType !== boostType) {
      throw new Error("Сессия не соответствует типу бонуса");
    }

    if (session.status === "expired") {
      throw new Error("Сессия просмотра уже истекла");
    }

    if (session.status === "rewarded") {
      throw new Error("Награда по этой сессии уже выдана");
    }

    if (session.expiresAt.getTime() <= now.getTime()) {
      return {
        ...session,
        status: "expired" as const
      };
    }

    if (session.status !== "started") {
      throw new Error("Сессия уже завершена");
    }

    return {
      ...session,
      status: "completed" as const,
      completedAt: now
    };
  });

  if (!matched) {
    throw new Error("Сессия rewarded ads не найдена");
  }

  return updatedSessions;
};

export const markRewardedAdSessionGranted = (
  sessions: RewardedAdSessionState[],
  sessionId: string,
  now: Date
): RewardedAdSessionState[] => {
  let matched = false;

  const updatedSessions = sessions.map((session) => {
    if (session.sessionId !== sessionId) {
      return session;
    }

    matched = true;

    if (session.status !== "completed") {
      throw new Error("Сессия не готова к выдаче награды");
    }

    return {
      ...session,
      status: "rewarded" as const,
      rewardedAt: now
    };
  });

  if (!matched) {
    throw new Error("Сессия rewarded ads не найдена");
  }

  return updatedSessions;
};
