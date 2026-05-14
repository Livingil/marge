import type { DailyRewardEntryDto } from "./game.types.js";

export const DAILY_REWARDS_CYCLE: Array<{ energy: number; freeSpawns: number; freeDeletes: number }> = [
  { energy: 18, freeSpawns: 0, freeDeletes: 0 },
  { energy: 22, freeSpawns: 0, freeDeletes: 0 },
  { energy: 0, freeSpawns: 1, freeDeletes: 0 },
  { energy: 28, freeSpawns: 0, freeDeletes: 0 },
  { energy: 0, freeSpawns: 0, freeDeletes: 1 },
  { energy: 34, freeSpawns: 0, freeDeletes: 0 },
  { energy: 42, freeSpawns: 1, freeDeletes: 0 }
];

export const toDateKeyUtc = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKeyUtc = (dateKey: string): Date | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return null;
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day));
};

const addDaysUtc = (date: Date, days: number): Date => {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
};

export const getDayInCycle = (streak: number): number => {
  if (streak <= 0) {
    return 1;
  }

  return ((streak - 1) % DAILY_REWARDS_CYCLE.length) + 1;
};

export const getDailyRewardByDay = (
  dayInCycle: number
): { energy: number; freeSpawns: number; freeDeletes: number } => {
  return DAILY_REWARDS_CYCLE[dayInCycle - 1] ?? DAILY_REWARDS_CYCLE[0];
};

export const canClaimDailyReward = (lastClaimAt: Date | null, now: Date): boolean => {
  if (!lastClaimAt) {
    return true;
  }

  return toDateKeyUtc(lastClaimAt) !== toDateKeyUtc(now);
};

export const getNextDailyClaimAt = (lastClaimAt: Date | null): Date | null => {
  if (!lastClaimAt) {
    return null;
  }

  const claimDate = parseDateKeyUtc(toDateKeyUtc(lastClaimAt));
  if (!claimDate) {
    return null;
  }

  return addDaysUtc(claimDate, 1);
};

export const isYesterdayUtc = (lastClaimAt: Date, now: Date): boolean => {
  const lastDate = parseDateKeyUtc(toDateKeyUtc(lastClaimAt));
  const nowDate = parseDateKeyUtc(toDateKeyUtc(now));
  if (!lastDate || !nowDate) {
    return false;
  }

  return addDaysUtc(lastDate, 1).getTime() === nowDate.getTime();
};

export const buildWeeklyRewards = (streak: number, canClaim: boolean): DailyRewardEntryDto[] => {
  const todayCycle = getDayInCycle(streak > 0 ? streak : 1);

  return DAILY_REWARDS_CYCLE.map((reward, index) => {
    const day = index + 1;
    const completed = streak > 0 && day < todayCycle;
    const todayAlreadyClaimed = !canClaim && day === todayCycle && streak > 0;

    return {
      day,
      energy: reward.energy,
      freeSpawns: reward.freeSpawns,
      freeDeletes: reward.freeDeletes,
      isToday: day === todayCycle,
      claimed: completed || todayAlreadyClaimed
    };
  });
};
