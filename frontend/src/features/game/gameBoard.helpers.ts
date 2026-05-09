import type { GridItem } from "../../shared/api/gameApi";

export const GRID_COLUMNS = 5;
export const BASE_GRID_ROWS = 5;
export const GRID_ROW_UNLOCK_LEVELS = [25, 75, 150] as const;
export const FLASH_DURATION_MS = 900;

export type FlashTone =
  | "merge"
  | "bonus"
  | "downgrade"
  | "income"
  | "discovery"
  | "failed"
  | "upgrade"
  | "spawn"
  | "neutral";

export type ContextHint = {
  title: string;
  text: string;
};

export type OnboardingHintCopy = {
  title: string;
  text: string;
};

export type ExpansionModule = {
  id: string;
  title: string;
  unlockLevel: number;
  description: string;
  hideWhenReached?: boolean;
};

export type CatalogTab = "items" | "reactions";
export type TierFilter = "all" | "1" | "2" | "3" | "4" | "5";
export type ChainFilter = "all" | "Энергия" | "Жизнь" | "Технологии" | "Магия" | "Пространство" | "Техно-магия" | "Прочее";

// Expansion concept: columns stay fixed at 5 on mobile.
// Future upgrades may add rows only: 5x5 -> 5x6 -> 5x7 -> 5x8.
// Do not add 6-column layouts.
export const expansionModules: ExpansionModule[] = [
  {
    id: "row-extension-1",
    title: "+1 ряд поля",
    unlockLevel: 25,
    description: "Поле станет 5×6: ширина останется удобной.",
    hideWhenReached: true
  },
  {
    id: "auto-income",
    title: "Автосбор потока",
    unlockLevel: 50,
    description: "Лаборатория сама собирает часть энергии."
  },
  {
    id: "advanced-reactor",
    title: "Расширенный реактор",
    unlockLevel: 100,
    description: "Откроет крупные цепочки синтеза."
  },
  {
    id: "row-extension-2",
    title: "+2 ряд поля",
    unlockLevel: 75,
    description: "Поле станет 5×7 без уменьшения клеток.",
    hideWhenReached: true
  },
  {
    id: "row-extension-3",
    title: "+3 ряд поля",
    unlockLevel: 150,
    description: "Поле станет 5×8 для длинных цепочек.",
    hideWhenReached: true
  }
];

export const getActiveGridRows = (baseLevel: number): number => {
  const unlockedRows = GRID_ROW_UNLOCK_LEVELS.filter((level) => baseLevel >= level).length;
  return BASE_GRID_ROWS + unlockedRows;
};

export const getActiveGridCells = (baseLevel: number): number => {
  return GRID_COLUMNS * getActiveGridRows(baseLevel);
};

const energyChain = new Set(["spark", "battery", "energyCell", "magnet", "reactor", "lightning", "plasma", "powerCore", "quantumCore"]);
const lifeChain = new Set(["water", "seed", "plant", "algae", "tree", "life", "organism", "beast", "mind"]);
const techChain = new Set(["stone", "metal", "mechanism", "wire", "circuit", "machine", "robot", "drone", "android", "factory"]);
const magicChain = new Set(["crystal", "mana", "soul", "golem", "spirit", "spell"]);
const spaceChain = new Set(["portal", "gate", "dimension", "meteor", "star", "world", "universe", "void"]);
const finalChain = new Set(["artificialSoul", "livingMachine", "worldEngine", "genesisCore"]);

export const getActionTone = (message: string | null, latestDiscovery: GridItem | null): FlashTone => {
  if (latestDiscovery) {
    return "discovery";
  }

  if (!message) {
    return "neutral";
  }

  if (message.includes("не соединяются")) {
    return "failed";
  }

  if (message.includes("Синтезирован")) {
    return "spawn";
  }

  if (message.includes("Лаборатория усилена")) {
    return "upgrade";
  }

  if (message.includes("Удач")) {
    return "bonus";
  }

  if (message.includes("Нестаб") || message.includes("ослаб")) {
    return "downgrade";
  }

  if (message.includes("Энерг") || message.includes("Поток")) {
    return "income";
  }

  if (message.includes("Открыто") || message.includes("соедин")) {
    return "merge";
  }

  return "neutral";
};

export const getItemChain = (itemId: string): ChainFilter => {
  if (energyChain.has(itemId)) {
    return "Энергия";
  }

  if (lifeChain.has(itemId)) {
    return "Жизнь";
  }

  if (techChain.has(itemId)) {
    return "Технологии";
  }

  if (magicChain.has(itemId)) {
    return "Магия";
  }

  if (spaceChain.has(itemId)) {
    return "Пространство";
  }

  if (finalChain.has(itemId)) {
    return "Техно-магия";
  }

  return "Прочее";
};

export const getContextHint = (
  filledCellsCount: number,
  emptyCellsCount: number,
  hasSelectedCell: boolean,
  canSpawn: boolean,
  discoveredCount: number,
  hasAnyDiscoveredItems: boolean
): ContextHint => {
  if (filledCellsCount === 0) {
    return {
      title: "Начни синтез",
      text: "Нажми «Синтезировать ядро», чтобы создать первый символ."
    };
  }

  if (filledCellsCount === 1) {
    return {
      title: "Нужна пара",
      text: "Создай ещё одно ядро, чтобы попробовать первое слияние."
    };
  }

  if (hasSelectedCell) {
    return {
      title: "Выбери второй символ",
      text: "Нажми на другой символ, чтобы проверить реакцию."
    };
  }

  if (emptyCellsCount === 0) {
    return {
      title: "Поле заполнено",
      text: "Соедини образцы или собери поток перед новым синтезом."
    };
  }

  if (!canSpawn) {
    return {
      title: "Не хватает энергии",
      text: "Собери поток энергии или попробуй новые слияния."
    };
  }

  if (discoveredCount < 5 || !hasAnyDiscoveredItems) {
    return {
      title: "Ищи первые реакции",
      text: "Пробуй соединять одинаковые символы и простые стихии."
    };
  }

  return {
    title: "Продолжай исследование",
    text: "Следуй цели смены и открывай новые ветки каталога."
  };
};

export const getOnboardingHintCopy = (
  targetItemId: string,
  contextHint: ContextHint
): OnboardingHintCopy => {
  const goalHintOverrides: Record<string, string> = {
    battery: "Соедини две ⚡ Искры, чтобы открыть 🔋 Батарею.",
    charge: "Соедини ⚡ Искру и 💧 Воду, чтобы открыть 🔌 Заряд.",
    energyCell: "Попробуй соединить две 🔋 Батареи или 🔋 Батарею с 🔌 Зарядом.",
  };

  const hasOverride = targetItemId in goalHintOverrides;
  return {
    title: hasOverride ? "Подсказка по цели" : contextHint.title,
    text: goalHintOverrides[targetItemId] ?? contextHint.text,
  };
};

export const getGoalRewardInlineText = (reward: {
  energy: number;
  freeSpawns: number;
  freeDeletes: number;
}): string => {
  const rewardExtras = [
    reward.freeSpawns > 0 ? `+${reward.freeSpawns} синтез бесплатно` : null,
    reward.freeDeletes > 0 ? `+${reward.freeDeletes} утилизация бесплатно` : null,
  ].filter(Boolean);

  return [`Награда: +${reward.energy} энергии`, ...rewardExtras].join(" · ");
};
