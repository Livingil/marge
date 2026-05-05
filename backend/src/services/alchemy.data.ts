export interface AlchemyItem {
  id: string;
  icon: string;
  name: string;
  description: string;
}

type RecipePair = [string, string, string];

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

const keyFor = (a: string, b: string): string => {
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

const getReachableItemIds = (): Set<string> => {
  const reachable = new Set<string>(BASE_SPAWN_ITEM_IDS);
  let changed = true;

  while (changed) {
    changed = false;

    recipePairs.forEach(([leftId, rightId, resultId]) => {
      if (reachable.has(leftId) && reachable.has(rightId) && !reachable.has(resultId)) {
        reachable.add(resultId);
        changed = true;
      }
    });
  }

  return reachable;
};

export const validateAlchemyData = (): void => {
  const rawItemIds = ALCHEMY_ITEMS.map((item) => item.id);
  const uniqueItemIds = new Set(rawItemIds);

  if (uniqueItemIds.size !== rawItemIds.length) {
    const seen = new Set<string>();
    const duplicates = rawItemIds.filter((id) => {
      if (seen.has(id)) {
        return true;
      }
      seen.add(id);
      return false;
    });

    throw new Error(
      `Duplicate item ids in ALCHEMY_ITEMS: ${Array.from(new Set(duplicates)).join(", ")}`
    );
  }

  ALCHEMY_ITEMS.forEach((item) => {
    if (!item.id || !item.icon || !item.name || !item.description) {
      throw new Error(`Item '${item.id || "<empty>"}' must include id, icon, name and description`);
    }
  });

  const itemIds = new Set(rawItemIds);

  BASE_SPAWN_ITEM_IDS.forEach((itemId) => {
    if (!itemIds.has(itemId)) {
      throw new Error(`Spawn item '${itemId}' is missing in ALCHEMY_ITEMS`);
    }
  });

  GOAL_SEQUENCE.forEach((itemId) => {
    if (!itemIds.has(itemId)) {
      throw new Error(`Goal item '${itemId}' is missing in ALCHEMY_ITEMS`);
    }
  });

  Object.entries(LEGACY_LEVEL_TO_ITEM_ID).forEach(([level, itemId]) => {
    if (!itemIds.has(itemId)) {
      throw new Error(`Legacy level '${level}' points to missing item '${itemId}'`);
    }
  });

  const recipeResultsByKey = new Map<string, string>();

  recipePairs.forEach(([leftId, rightId, resultId]) => {
    if (!itemIds.has(leftId)) {
      throw new Error(`Recipe left item '${leftId}' is missing in ALCHEMY_ITEMS`);
    }
    if (!itemIds.has(rightId)) {
      throw new Error(`Recipe right item '${rightId}' is missing in ALCHEMY_ITEMS`);
    }
    if (!itemIds.has(resultId)) {
      throw new Error(`Recipe result item '${resultId}' is missing in ALCHEMY_ITEMS`);
    }

    const key = keyFor(leftId, rightId);
    const existingResult = recipeResultsByKey.get(key);

    if (existingResult && existingResult !== resultId) {
      throw new Error(
        `Ambiguous recipe '${key}': both '${existingResult}' and '${resultId}' are defined`
      );
    }

    if (existingResult) {
      throw new Error(`Duplicate recipe key '${key}' in recipePairs`);
    }

    recipeResultsByKey.set(key, resultId);
  });

  const reachable = getReachableItemIds();
  GOAL_SEQUENCE.forEach((goalId) => {
    if (!reachable.has(goalId)) {
      throw new Error(`Goal '${goalId}' is not reachable from BASE_SPAWN_ITEM_IDS`);
    }
  });
};

validateAlchemyData();

export const ALCHEMY_ITEMS_BY_ID: Record<string, AlchemyItem> = Object.fromEntries(
  ALCHEMY_ITEMS.map((item) => [item.id, item])
);

export const RECIPES: Record<string, string> = recipePairs.reduce<Record<string, string>>(
  (acc, [a, b, result]) => {
    acc[keyFor(a, b)] = result;
    return acc;
  },
  {}
);

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
