import { ALCHEMY_ITEMS_BY_ID, GOAL_SEQUENCE } from "./alchemy.data.js";
import { getGoalRewardBundle, getItemTier } from "./game.economy.js";
import type { CurrentGoalDto, GoalRewardDto } from "./game.types.js";

export type GoalRewardSummary = {
  energy: number;
  freeSpawns: number;
  freeDeletes: number;
};

type GoalProgressUser = {
  discoveredItems: string[];
  rewardedGoals: string[];
  goalFreeSpawns: number;
  goalFreeDeletes: number;
  gold: number;
};

const emptyGoalRewardSummary = (): GoalRewardSummary => ({
  energy: 0,
  freeSpawns: 0,
  freeDeletes: 0
});

export const hasGoalRewardSummary = (summary: GoalRewardSummary): boolean => {
  return summary.energy > 0 || summary.freeSpawns > 0 || summary.freeDeletes > 0;
};

export const formatGoalRewardSummary = (summary: GoalRewardSummary): string => {
  const parts: string[] = [];
  if (summary.energy > 0) {
    parts.push(`+${summary.energy} энергии`);
  }
  if (summary.freeSpawns > 0) {
    parts.push(`+${summary.freeSpawns} синтез`);
  }
  if (summary.freeDeletes > 0) {
    parts.push(`+${summary.freeDeletes} утилизация`);
  }

  return parts.join(", ");
};

export const buildGoalRewardText = (reward: GoalRewardDto): string => {
  const parts = [`Награда: +${reward.energy} энергии`];
  if (reward.freeSpawns > 0) {
    parts.push(`+${reward.freeSpawns} синтез`);
  }
  if (reward.freeDeletes > 0) {
    parts.push(`+${reward.freeDeletes} утилизация`);
  }

  return parts.join(", ");
};

export const applyGoalRewards = (user: GoalProgressUser): GoalRewardSummary => {
  const summary = emptyGoalRewardSummary();

  const goalIndex = GOAL_SEQUENCE.findIndex((goalItemId) => !user.rewardedGoals.includes(goalItemId));
  if (goalIndex === -1) {
    return summary;
  }

  const goalItemId = GOAL_SEQUENCE[goalIndex];
  if (!user.discoveredItems.includes(goalItemId)) {
    return summary;
  }

  const tier = getItemTier(goalItemId);
  const reward = getGoalRewardBundle(goalIndex, tier);
  user.rewardedGoals = [...user.rewardedGoals, goalItemId].sort();
  summary.energy = reward.energy;
  summary.freeSpawns = reward.freeSpawns;
  summary.freeDeletes = reward.freeDeletes;

  user.gold += summary.energy;
  user.goalFreeSpawns += summary.freeSpawns;
  user.goalFreeDeletes += summary.freeDeletes;

  return summary;
};

export const applyGoalRewardsAndBuildMessage = (user: GoalProgressUser): string | null => {
  const rewardSummary = applyGoalRewards(user);
  if (!hasGoalRewardSummary(rewardSummary)) {
    return null;
  }

  return `🎯 Цель выполнена: ${formatGoalRewardSummary(rewardSummary)}`;
};

export const getCurrentGoal = (discoveredItems: string[]): CurrentGoalDto => {
  const nextTargetIndex = GOAL_SEQUENCE.findIndex((itemId) => !discoveredItems.includes(itemId));
  const allGoalsCompleted = nextTargetIndex === -1;
  const nextTarget = allGoalsCompleted
    ? GOAL_SEQUENCE[GOAL_SEQUENCE.length - 1]
    : GOAL_SEQUENCE[nextTargetIndex];

  if (allGoalsCompleted) {
    return {
      title: "Все цели сектора выполнены",
      targetItemId: nextTarget,
      rewardText: "Все награды получены",
      reward: { energy: 0, freeSpawns: 0, freeDeletes: 0 }
    };
  }

  const tier = getItemTier(nextTarget);
  const reward = getGoalRewardBundle(nextTargetIndex, tier);
  return {
    title: `Открой ${ALCHEMY_ITEMS_BY_ID[nextTarget].name}`,
    targetItemId: nextTarget,
    rewardText: buildGoalRewardText(reward),
    reward
  };
};
