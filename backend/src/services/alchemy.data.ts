import { validateAlchemyData } from "./alchemy.validation.js";
export interface AlchemyItem {
  id: string;
  icon: string;
  name: string;
  description: string;
}

type RecipePair = [string, string, string];
export interface RecipeDetails {
  key: string;
  leftId: string;
  rightId: string;
  resultId: string;
}

const MAX_VISUAL_TIER = 5;

export const ALCHEMY_ITEMS: AlchemyItem[] = [
  { id: "spark", icon: "⚡", name: "Искра", description: "Малый источник нестабильной энергии" },
  { id: "battery", icon: "🔋", name: "Батарея", description: "Стабильный переносной накопитель энергии" },
  { id: "energyCell", icon: "💠", name: "Энергоячейка", description: "Усиленная ячейка для длительной работы" },
  { id: "magnet", icon: "🧲", name: "Магнит", description: "Проводник для сложных энергетических связей" },
  { id: "reactor", icon: "☢️", name: "Реактор", description: "Ядро генерации чистой энергии" },
  { id: "science", icon: "🧪", name: "Наука", description: "Новая ветка лабораторных исследований" },
  { id: "fire", icon: "🔥", name: "Огонь", description: "Горячая и агрессивная стихийная фаза" },
  { id: "water", icon: "💧", name: "Вода", description: "Базовая текучая среда для реакций" },
  { id: "seed", icon: "🌱", name: "Росток", description: "Зачаток живой биологической структуры" },
  { id: "plant", icon: "🌿", name: "Растение", description: "Стабильная органическая форма роста" },
  { id: "life", icon: "🧬", name: "Жизнь", description: "Комплексная самоподдерживающаяся система" },
  { id: "stone", icon: "🪨", name: "Камень", description: "Твердая минеральная основа материи" },
  { id: "metal", icon: "🔩", name: "Металл", description: "Прочный материал для техноузлов" },
  { id: "mechanism", icon: "⚙️", name: "Механизм", description: "Согласованная система движущихся деталей" },
  { id: "robot", icon: "🤖", name: "Робот", description: "Автономный исполнитель лабораторных задач" },
  { id: "portal", icon: "🌀", name: "Портал", description: "Туннель между удаленными слоями пространства" },
  { id: "world", icon: "🌍", name: "Мир", description: "Стабильный контур новой экосистемы" },

  { id: "lightning", icon: "🌩️", name: "Молния", description: "Импульсный разряд высокой плотности" },
  { id: "plasma", icon: "🫧", name: "Плазма", description: "Перегретая ионизированная энергетическая среда" },
  { id: "powerCore", icon: "🔶", name: "Силовое ядро", description: "Узел хранения и отдачи энергии" },
  { id: "quantumCore", icon: "🧿", name: "Квантовое ядро", description: "Сверхплотный источник фазовой мощности" },

  { id: "algae", icon: "🪸", name: "Водоросль", description: "Примитивная живая водная матрица" },
  { id: "tree", icon: "🌳", name: "Дерево", description: "Крупная устойчивая биологическая структура" },
  { id: "organism", icon: "🦠", name: "Организм", description: "Единая адаптивная живая система" },
  { id: "beast", icon: "🐾", name: "Зверь", description: "Сложная и сильная форма жизни" },
  { id: "mind", icon: "🧠", name: "Разум", description: "Осознанный когнитивный контур управления" },

  { id: "wire", icon: "🧵", name: "Проводник", description: "Гибкий канал передачи заряда" },
  { id: "circuit", icon: "🖧", name: "Схема", description: "Замкнутая электрическая логическая сеть" },
  { id: "machine", icon: "🛠️", name: "Машина", description: "Собранный техномодуль выполнения процессов" },
  { id: "drone", icon: "🛸", name: "Дрон", description: "Мобильный автономный техноразведчик" },
  { id: "android", icon: "🦾", name: "Андроид", description: "Искусственный носитель сложного поведения" },
  { id: "factory", icon: "🏭", name: "Фабрика", description: "Комплекс массового техносинтеза" },

  { id: "crystal", icon: "💎", name: "Кристалл", description: "Фокусирующая решетка для тонкой энергии" },
  { id: "mana", icon: "✨", name: "Мана", description: "Чистый поток управляемой аркан-энергии" },
  { id: "soul", icon: "🫀", name: "Душа", description: "Ядро индивидуального жизненного импульса" },
  { id: "golem", icon: "🗿", name: "Голем", description: "Материальный носитель связанной души" },
  { id: "spirit", icon: "👻", name: "Дух", description: "Нестабильная форма вне телесной материи" },
  { id: "spell", icon: "📜", name: "Заклинание", description: "Программируемый паттерн магического действия" },

  { id: "gate", icon: "🚪", name: "Врата", description: "Контролируемая рамка межпространственного перехода" },
  { id: "dimension", icon: "🧱", name: "Измерение", description: "Изолированный слой пространственных правил" },
  { id: "meteor", icon: "☄️", name: "Метеор", description: "Разогретое тело космической материи" },
  { id: "star", icon: "⭐", name: "Звезда", description: "Стабильный источник космического излучения" },
  { id: "universe", icon: "🌌", name: "Вселенная", description: "Единый космический контур реальности" },
  { id: "void", icon: "🕳️", name: "Пустота", description: "Безструктурное поле до формы мира" },

  { id: "artificialSoul", icon: "🪫", name: "Искусственная душа", description: "Сконструированное сознательное внутреннее ядро" },
  { id: "livingMachine", icon: "🦿", name: "Живая машина", description: "Гибрид биологии, души и механики" },
  { id: "worldEngine", icon: "🌐", name: "Двигатель мира", description: "Система стабилизации планетарных процессов" },
  { id: "genesisCore", icon: "🧬", name: "Ядро генезиса", description: "Финальный техно-магический источник творения" }
];

export const getRecipeKey = (a: string, b: string): string => {
  return [a, b].sort().join("+");
};

const recipePairs: RecipePair[] = [
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
  ["portal", "life", "world"],

  ["spark", "fire", "lightning"],
  ["fire", "energyCell", "plasma"],
  ["plasma", "magnet", "powerCore"],
  ["powerCore", "reactor", "quantumCore"],
  ["lightning", "battery", "plasma"],
  ["lightning", "energyCell", "powerCore"],
  ["plasma", "battery", "powerCore"],
  ["quantumCore", "portal", "dimension"],

  ["water", "plant", "algae"],
  ["plant", "plant", "tree"],
  ["life", "water", "organism"],
  ["organism", "life", "beast"],
  ["life", "energyCell", "mind"],
  ["algae", "spark", "organism"],
  ["tree", "life", "organism"],
  ["beast", "energyCell", "mind"],
  ["organism", "mind", "beast"],

  ["metal", "energyCell", "wire"],
  ["wire", "spark", "circuit"],
  ["circuit", "mechanism", "machine"],
  ["circuit", "robot", "drone"],
  ["machine", "robot", "factory"],
  ["robot", "mind", "android"],
  ["drone", "mind", "android"],
  ["machine", "mind", "android"],
  ["factory", "mind", "android"],
  ["wire", "mechanism", "machine"],
  ["drone", "factory", "android"],

  ["stone", "energyCell", "crystal"],
  ["spark", "crystal", "mana"],
  ["life", "spark", "soul"],
  ["soul", "metal", "golem"],
  ["soul", "portal", "spirit"],
  ["mana", "science", "spell"],
  ["mana", "mind", "spell"],
  ["crystal", "science", "mana"],
  ["spell", "life", "spirit"],
  ["spell", "robot", "android"],

  ["portal", "reactor", "gate"],
  ["portal", "world", "dimension"],
  ["stone", "reactor", "meteor"],
  ["meteor", "fire", "star"],
  ["star", "world", "universe"],
  ["dimension", "universe", "void"],
  ["gate", "science", "dimension"],
  ["gate", "star", "universe"],
  ["void", "life", "spirit"],

  ["android", "soul", "artificialSoul"],
  ["artificialSoul", "machine", "livingMachine"],
  ["world", "reactor", "worldEngine"],
  ["worldEngine", "artificialSoul", "genesisCore"],
  ["livingMachine", "worldEngine", "genesisCore"],
  ["quantumCore", "mind", "artificialSoul"],
  ["worldEngine", "mind", "livingMachine"],
  ["universe", "reactor", "worldEngine"],
  ["spirit", "machine", "artificialSoul"]
];

export const BASE_SPAWN_ITEM_IDS = ["spark", "water", "seed", "stone", "fire"];

export const LEGACY_LEVEL_TO_ITEM_ID: Record<number, string> = {
  1: "spark",
  2: "battery",
  3: "energyCell",
  4: "magnet",
  5: "reactor"
};

export const GOAL_SEQUENCE = [
  "battery",
  "energyCell",
  "magnet",
  "reactor",
  "science",
  "plant",
  "life",
  "mechanism",
  "robot",
  "portal",
  "world",
  "mind",
  "soul",
  "android",
  "golem",
  "star",
  "universe",
  "artificialSoul",
  "worldEngine",
  "genesisCore"
];

validateAlchemyData({
  items: ALCHEMY_ITEMS,
  recipePairs,
  baseSpawnItemIds: BASE_SPAWN_ITEM_IDS,
  goalSequence: GOAL_SEQUENCE,
  legacyLevelToItemId: LEGACY_LEVEL_TO_ITEM_ID,
  getRecipeKey
});

export const ALCHEMY_ITEMS_BY_ID: Record<string, AlchemyItem> = Object.fromEntries(
  ALCHEMY_ITEMS.map((item) => [item.id, item])
);

export const RECIPES: Record<string, string> = recipePairs.reduce<Record<string, string>>(
  (acc, [a, b, result]) => {
    acc[getRecipeKey(a, b)] = result;
    return acc;
  },
  {}
);

export const RECIPE_DETAILS: RecipeDetails[] = recipePairs.map(([leftId, rightId, resultId]) => ({
  key: getRecipeKey(leftId, rightId),
  leftId,
  rightId,
  resultId
}));

export const RECIPE_DETAILS_BY_KEY: Record<string, RecipeDetails> = Object.fromEntries(
  RECIPE_DETAILS.map((recipe) => [recipe.key, recipe])
);

export const getRecipeDetailsByKey = (key: string): RecipeDetails | null => {
  return RECIPE_DETAILS_BY_KEY[key] ?? null;
};

const computeAlchemyItemTiers = (): Record<string, number> => {
  const tiers = Object.fromEntries(
    ALCHEMY_ITEMS.map((item) => [item.id, Number.POSITIVE_INFINITY])
  ) as Record<string, number>;

  BASE_SPAWN_ITEM_IDS.forEach((itemId) => {
    tiers[itemId] = 1;
  });

  let changed = true;

  while (changed) {
    changed = false;

    recipePairs.forEach(([leftId, rightId, resultId]) => {
      const leftTier = tiers[leftId];
      const rightTier = tiers[rightId];

      if (!Number.isFinite(leftTier) || !Number.isFinite(rightTier)) {
        return;
      }

      const nextTier = Math.min(MAX_VISUAL_TIER, Math.max(leftTier, rightTier) + 1);

      if (nextTier < tiers[resultId]) {
        tiers[resultId] = nextTier;
        changed = true;
      }
    });
  }

  return Object.fromEntries(
    Object.entries(tiers).map(([itemId, tier]) => [itemId, Number.isFinite(tier) ? tier : MAX_VISUAL_TIER])
  );
};

export const ALCHEMY_ITEM_TIERS = computeAlchemyItemTiers();

