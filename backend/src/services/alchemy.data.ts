export interface AlchemyItem {
  id: string;
  icon: string;
  name: string;
  description: string;
}

export const ALCHEMY_ITEMS: AlchemyItem[] = [
  { id: "spark", icon: "⚡", name: "Искра", description: "Малый источник нестабильной энергии" },
  { id: "battery", icon: "🔋", name: "Батарея", description: "Стабильный переносной накопитель энергии" },
  { id: "energyCell", icon: "💠", name: "Энергоячейка", description: "Усиленная ячейка для длительной работы" },
  { id: "magnet", icon: "🧲", name: "Магнит", description: "Проводник для сложных энергетических связей" },
  { id: "reactor", icon: "☢️", name: "Реактор", description: "Ядро генерации чистой энергии" },
  { id: "science", icon: "🧪", name: "Наука", description: "Новая ветка исследований" },
  { id: "fire", icon: "🔥", name: "Огонь", description: "Горячая нестабильная стихия" },
  { id: "water", icon: "💧", name: "Вода", description: "Базовая текучая стихия" },
  { id: "seed", icon: "🌱", name: "Росток", description: "Начало будущей жизни" },
  { id: "plant", icon: "🌿", name: "Растение", description: "Живая природная форма" },
  { id: "life", icon: "🧬", name: "Жизнь", description: "Сложная биологическая структура" },
  { id: "stone", icon: "🪨", name: "Камень", description: "Твердая основа материи" },
  { id: "metal", icon: "🔩", name: "Металл", description: "Прочный технологический материал" },
  { id: "mechanism", icon: "⚙️", name: "Механизм", description: "Система движущихся деталей" },
  { id: "robot", icon: "🤖", name: "Робот", description: "Автономный технологический модуль" },
  { id: "portal", icon: "🌀", name: "Портал", description: "Разрыв между мирами" },
  { id: "world", icon: "🌍", name: "Мир", description: "Цель алхимического цикла" }
];

export const ALCHEMY_ITEMS_BY_ID: Record<string, AlchemyItem> = Object.fromEntries(
  ALCHEMY_ITEMS.map((item) => [item.id, item])
);

const keyFor = (a: string, b: string): string => {
  return [a, b].sort().join("+");
};

const recipePairs: Array<[string, string, string]> = [
  ["spark", "spark", "battery"],
  ["battery", "battery", "energyCell"],
  ["energyCell", "energyCell", "magnet"],
  ["magnet", "magnet", "reactor"],
  ["spark", "battery", "energyCell"],
  ["spark", "energyCell", "magnet"],
  ["battery", "magnet", "reactor"],
  ["reactor", "spark", "science"],
  ["fire", "water", "science"],
  ["water", "seed", "plant"],
  ["plant", "spark", "life"],
  ["stone", "fire", "metal"],
  ["metal", "spark", "mechanism"],
  ["mechanism", "energyCell", "robot"],
  ["reactor", "magnet", "portal"],
  ["portal", "life", "world"]
];

export const RECIPES: Record<string, string> = recipePairs.reduce<Record<string, string>>(
  (acc, [a, b, result]) => {
    const key = keyFor(a, b);
    if (!acc[key]) {
      acc[key] = result;
    }
    return acc;
  },
  {}
);

export const BASE_SPAWN_ITEM_IDS = ["spark", "water", "seed", "stone", "fire"];

export const LEGACY_LEVEL_TO_ITEM_ID: Record<number, string> = {
  1: "spark",
  2: "battery",
  3: "energyCell",
  4: "magnet",
  5: "reactor"
};

export const GOAL_SEQUENCE = ["reactor", "science", "life", "portal", "world"];
