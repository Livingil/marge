import type { AdBoostOptionDto, AdBoostType } from "./game.types.js";
import { toDateKeyUtc } from "./dailyRewards.js";

export type AdBoostClaimsState = {
  dateKey: string;
  freeSpawnToday: number;
  freeDeleteToday: number;
  flowBoostToday: number;
  doubleOfflineToday: number;
};

export type ActiveBoostsState = {
  flowMultiplierUntil: Date | null;
  flowMultiplier: number;
};

export const AD_BOOST_LIMITS = {
  rewarded_free_spawn: 30,
  rewarded_free_delete: 20,
  rewarded_flow_boost: 20,
  rewarded_double_offline_income: 10
} as const;

export const AD_BOOST_FLOW_MULTIPLIER = 2;
export const AD_BOOST_FLOW_DURATION_MS = 30 * 60 * 1000;
export const AD_BOOST_INITIAL_DATE_KEY = "1970-01-01";

export const createEmptyAdBoostClaims = (dateKey = AD_BOOST_INITIAL_DATE_KEY): AdBoostClaimsState => ({
  dateKey,
  freeSpawnToday: 0,
  freeDeleteToday: 0,
  flowBoostToday: 0,
  doubleOfflineToday: 0
});

export const createDefaultActiveBoosts = (): ActiveBoostsState => ({
  flowMultiplierUntil: null,
  flowMultiplier: 1
});

export const resetAdBoostClaimsIfNeeded = (claims: AdBoostClaimsState, now: Date): AdBoostClaimsState => {
  const dateKey = toDateKeyUtc(now);
  if (claims.dateKey === dateKey) {
    return claims;
  }

  return createEmptyAdBoostClaims(dateKey);
};

export const settleActiveFlowBoost = (activeBoosts: ActiveBoostsState, now: Date): ActiveBoostsState => {
  if (!activeBoosts.flowMultiplierUntil) {
    if (activeBoosts.flowMultiplier === 1) {
      return activeBoosts;
    }

    return {
      flowMultiplierUntil: null,
      flowMultiplier: 1
    };
  }

  if (activeBoosts.flowMultiplierUntil.getTime() <= now.getTime()) {
    return {
      flowMultiplierUntil: null,
      flowMultiplier: 1
    };
  }

  return activeBoosts;
};

export const getEffectiveFlowMultiplier = (activeBoosts: ActiveBoostsState, now: Date): number => {
  const settled = settleActiveFlowBoost(activeBoosts, now);
  if (!settled.flowMultiplierUntil) {
    return 1;
  }

  return Math.max(1, settled.flowMultiplier);
};

export const getAdBoostUsage = (claims: AdBoostClaimsState, boostType: AdBoostType): number => {
  switch (boostType) {
    case "rewarded_free_spawn":
      return claims.freeSpawnToday;
    case "rewarded_free_delete":
      return claims.freeDeleteToday;
    case "rewarded_flow_boost":
      return claims.flowBoostToday;
    case "rewarded_double_offline_income":
      return claims.doubleOfflineToday;
  }
};

export const setAdBoostUsage = (
  claims: AdBoostClaimsState,
  boostType: AdBoostType,
  value: number
): AdBoostClaimsState => {
  switch (boostType) {
    case "rewarded_free_spawn":
      return { ...claims, freeSpawnToday: value };
    case "rewarded_free_delete":
      return { ...claims, freeDeleteToday: value };
    case "rewarded_flow_boost":
      return { ...claims, flowBoostToday: value };
    case "rewarded_double_offline_income":
      return { ...claims, doubleOfflineToday: value };
  }
};

export const activateFlowBoost = (now: Date): ActiveBoostsState => ({
  flowMultiplier: AD_BOOST_FLOW_MULTIPLIER,
  flowMultiplierUntil: new Date(now.getTime() + AD_BOOST_FLOW_DURATION_MS)
});

export const buildAdBoostOptions = (claims: AdBoostClaimsState): AdBoostOptionDto[] => [
  {
    type: "rewarded_free_spawn",
    title: "+1 синтез",
    description: "Добровольный бонус для ускорения прогресса.",
    rewardText: "+1 бесплатный синтез",
    claimsUsed: claims.freeSpawnToday,
    dailyLimit: AD_BOOST_LIMITS.rewarded_free_spawn,
    canClaim: claims.freeSpawnToday < AD_BOOST_LIMITS.rewarded_free_spawn
  },
  {
    type: "rewarded_free_delete",
    title: "+1 утилизация",
    description: "Полезно, когда поле переполнено.",
    rewardText: "+1 бесплатная утилизация",
    claimsUsed: claims.freeDeleteToday,
    dailyLimit: AD_BOOST_LIMITS.rewarded_free_delete,
    canClaim: claims.freeDeleteToday < AD_BOOST_LIMITS.rewarded_free_delete
  },
  {
    type: "rewarded_flow_boost",
    title: "x2 поток на 30 мин",
    description: "Временный буст производства энергии.",
    rewardText: "x2 поток на 30 минут",
    claimsUsed: claims.flowBoostToday,
    dailyLimit: AD_BOOST_LIMITS.rewarded_flow_boost,
    canClaim: claims.flowBoostToday < AD_BOOST_LIMITS.rewarded_flow_boost
  },
  {
    type: "rewarded_double_offline_income",
    title: "x2 офлайн-сбор",
    description: "Подготовлено для следующего обновления.",
    rewardText: "Подготовка (скоро)",
    claimsUsed: claims.doubleOfflineToday,
    dailyLimit: AD_BOOST_LIMITS.rewarded_double_offline_income,
    canClaim: false
  }
];
