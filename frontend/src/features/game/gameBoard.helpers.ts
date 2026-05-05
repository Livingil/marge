import type { GridItem } from "../../shared/api/gameApi";

export const GRID_SIZE = 5;
export const FLASH_DURATION_MS = 900;
export const ONBOARDING_HINT_DISMISSED_KEY = "marge_onboarding_hint_dismissed";
export const ONBOARDING_GUIDE_DISMISSED_KEY = "marge_onboarding_guide_dismissed";

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

export type ExpansionModule = {
  id: string;
  title: string;
  unlockLevel: number;
  description: string;
};

export type CatalogTab = "items" | "reactions";
export type TierFilter = "all" | "1" | "2" | "3" | "4" | "5";
export type ChainFilter = "all" | "Энергия" | "Жизнь" | "Технологии" | "Магия" | "Пространство" | "Техно-магия" | "Прочее";

export const expansionModules: ExpansionModule[] = [
  {
    id: "row-extension",
    title: "Новый ряд поля",
    unlockLevel: 25,
    description: "Больше места для сложных реакций."
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
  }
];

const energyChain = new Set(["spark", "battery", "energyCell", "magnet", "reactor", "lightning", "plasma", "powerCore", "quantumCore"]);
const lifeChain = new Set(["water", "seed", "plant", "algae", "tree", "life", "organism", "beast", "mind"]);
const techChain = new Set(["stone", "metal", "mechanism", "wire", "circuit", "machine", "robot", "drone", "android", "factory"]);
const magicChain = new Set(["crystal", "mana", "soul", "golem", "spirit", "spell"]);
const spaceChain = new Set(["portal", "gate", "dimension", "meteor", "star", "world", "universe", "void"]);
const finalChain = new Set(["artificialSoul", "livingMachine", "worldEngine", "genesisCore"]);

export const readDismissedFlag = (key: string): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(key) === "1";
};

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
