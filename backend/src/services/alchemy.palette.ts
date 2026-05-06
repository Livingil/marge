export type AlchemyPaletteStage = "early" | "mid" | "late" | "endgame";

export type AlchemyPaletteChain =
  | "energy"
  | "elemental"
  | "nature"
  | "material"
  | "technology"
  | "biology"
  | "magic"
  | "space"
  | "void"
  | "civilization"
  | "final";

export interface AlchemyPaletteItem {
  id: string;
  icon: string;
  name: string;
  description: string;
  chain: AlchemyPaletteChain;
  stage: AlchemyPaletteStage;
}

export const ALCHEMY_EMOJI_PALETTE: AlchemyPaletteItem[] = [
  { id: "spark", icon: "⚡", name: "Искра", description: "Малый нестабильный разряд", chain: "energy", stage: "early" },
  { id: "charge", icon: "🔌", name: "Заряд", description: "Короткий накопленный импульс", chain: "energy", stage: "early" },
  { id: "battery", icon: "🔋", name: "Батарея", description: "Переносной накопитель энергии", chain: "energy", stage: "early" },
  { id: "energyCell", icon: "💠", name: "Энергоячейка", description: "Стабильная энергетическая ячейка", chain: "energy", stage: "early" },
  { id: "current", icon: "〰️", name: "Ток", description: "Направленный поток заряда", chain: "energy", stage: "mid" },
  { id: "coil", icon: "➰", name: "Катушка", description: "Свернутый проводящий контур", chain: "energy", stage: "mid" },
  { id: "lightning", icon: "🌩️", name: "Молния", description: "Мощный импульсный разряд", chain: "energy", stage: "mid" },
  { id: "capacitor", icon: "🧱", name: "Конденсатор", description: "Быстрый накопитель заряда", chain: "energy", stage: "mid" },
  { id: "generator", icon: "🔄", name: "Генератор", description: "Модуль выработки энергии", chain: "energy", stage: "mid" },
  { id: "plasma", icon: "🫧", name: "Плазма", description: "Ионизированная горячая среда", chain: "energy", stage: "mid" },
  { id: "ion", icon: "\u269b\ufe0f", name: "Ион", description: "Заряженная частица материи", chain: "energy", stage: "mid" },
  { id: "pulse", icon: "💓", name: "Импульс", description: "Краткий энергетический толчок", chain: "energy", stage: "mid" },
  { id: "radiation", icon: "☣️", name: "Излучение", description: "Опасный энергетический фон", chain: "energy", stage: "mid" },
  { id: "overload", icon: "💥", name: "Перегрузка", description: "Избыточный энергетический всплеск", chain: "energy", stage: "mid" },
  { id: "powerCore", icon: "🔶", name: "Силовое ядро", description: "Узел концентрированной мощности", chain: "energy", stage: "mid" },
  { id: "reactor", icon: "☢️", name: "Реактор", description: "Ядро стабильной генерации", chain: "energy", stage: "mid" },
  { id: "stormCore", icon: "🌪️", name: "Грозовое ядро", description: "Сжатая буревая энергия", chain: "energy", stage: "late" },
  { id: "fusionCore", icon: "🔆", name: "Термоядро", description: "Сверхгорячий источник синтеза", chain: "energy", stage: "late" },
  { id: "quantumCore", icon: "🧿", name: "Квантовое ядро", description: "Фазовый источник мощности", chain: "energy", stage: "late" },
  { id: "zeroPointCell", icon: "🪬", name: "Нулевая ячейка", description: "Энергия вакуумного покоя", chain: "energy", stage: "late" },
  { id: "solarFlare", icon: "☀️", name: "Солнечная вспышка", description: "Взрыв звездной энергии", chain: "energy", stage: "late" },
  { id: "eternalReactor", icon: "♾️", name: "Вечный реактор", description: "Почти бесконечная генерация", chain: "energy", stage: "endgame" },
  { id: "omegaCharge", icon: "🔱", name: "Омега-заряд", description: "Предельный энергетический импульс", chain: "energy", stage: "endgame" },

  { id: "fire", icon: "🔥", name: "Огонь", description: "Горячая активная стихия", chain: "elemental", stage: "early" },
  { id: "water", icon: "💧", name: "Вода", description: "Текучая базовая среда", chain: "elemental", stage: "early" },
  { id: "stone", icon: "🪨", name: "Камень", description: "Твердая минеральная основа", chain: "elemental", stage: "early" },
  { id: "wind", icon: "🌬️", name: "Ветер", description: "Движущийся поток воздуха", chain: "elemental", stage: "early" },
  { id: "ice", icon: "🧊", name: "Лёд", description: "Застывшая водная структура", chain: "elemental", stage: "early" },
  { id: "steam", icon: "♨️", name: "Пар", description: "Горячая летучая среда", chain: "elemental", stage: "early" },
  { id: "ash", icon: "🌫️", name: "Пепел", description: "Остаток сгоревшей материи", chain: "elemental", stage: "early" },
  { id: "smoke", icon: "💨", name: "Дым", description: "Летучий след горения", chain: "elemental", stage: "early" },
  { id: "clay", icon: "🟫", name: "Глина", description: "Пластичная минеральная смесь", chain: "elemental", stage: "early" },
  { id: "mud", icon: "🟤", name: "Ил", description: "Влажная земляная масса", chain: "elemental", stage: "early" },
  { id: "sand", icon: "🏜️", name: "Песок", description: "Мелкая каменная крошка", chain: "elemental", stage: "early" },
  { id: "dust", icon: "\ud83e\uddf9", name: "Пыль", description: "Легкая сухая взвесь", chain: "elemental", stage: "early" },
  { id: "lava", icon: "🌋", name: "Лава", description: "Расплавленная каменная масса", chain: "elemental", stage: "mid" },
  { id: "glass", icon: "🪞", name: "Стекло", description: "Прозрачная застывшая поверхность", chain: "elemental", stage: "mid" },
  { id: "crystal", icon: "💎", name: "Кристалл", description: "Упорядоченная минеральная решетка", chain: "elemental", stage: "mid" },
  { id: "frost", icon: "❄️", name: "Мороз", description: "Сухой холодный узор", chain: "elemental", stage: "mid" },
  { id: "mist", icon: "🌁", name: "Туман", description: "Влажная рассеянная завеса", chain: "elemental", stage: "mid" },
  { id: "acid", icon: "🧪", name: "Кислота", description: "Едкая реактивная жидкость", chain: "elemental", stage: "mid" },
  { id: "salt", icon: "🧂", name: "Соль", description: "Кристаллический минеральный остаток", chain: "elemental", stage: "mid" },
  { id: "quake", icon: "〽️", name: "Разлом", description: "Трещина напряженной породы", chain: "elemental", stage: "late" },
  { id: "geyser", icon: "⛲", name: "Гейзер", description: "Водяной выброс из глубин", chain: "elemental", stage: "late" },
  { id: "elementalCore", icon: "🔷", name: "Стихийное ядро", description: "Сжатый баланс стихий", chain: "elemental", stage: "late" },

  { id: "seed", icon: "🌱", name: "Росток", description: "Зачаток живой структуры", chain: "nature", stage: "early" },
  { id: "root", icon: "🫚", name: "Корень", description: "Опора будущего роста", chain: "nature", stage: "early" },
  { id: "leaf", icon: "🍃", name: "Лист", description: "Мягкая зеленая пластина", chain: "nature", stage: "early" },
  { id: "plant", icon: "🌿", name: "Растение", description: "Стабильная форма роста", chain: "nature", stage: "early" },
  { id: "moss", icon: "🟢", name: "Мох", description: "Мягкий зеленый покров", chain: "nature", stage: "early" },
  { id: "algae", icon: "🪸", name: "Водоросль", description: "Примитивная водная флора", chain: "nature", stage: "early" },
  { id: "flower", icon: "🌸", name: "Цветок", description: "Яркая фаза растения", chain: "nature", stage: "early" },
  { id: "mushroom", icon: "🍄", name: "Гриб", description: "Теневая органическая форма", chain: "nature", stage: "mid" },
  { id: "vine", icon: "\ud83c\udf47", name: "Лоза", description: "Гибкий цепкий побег", chain: "nature", stage: "mid" },
  { id: "tree", icon: "🌳", name: "Дерево", description: "Крупная устойчивая флора", chain: "nature", stage: "mid" },
  { id: "fruit", icon: "🍎", name: "Плод", description: "Питательный результат роста", chain: "nature", stage: "mid" },
  { id: "pollen", icon: "🌼", name: "Пыльца", description: "Мелкая живая пыль", chain: "nature", stage: "mid" },
  { id: "resin", icon: "🟧", name: "Смола", description: "Липкая древесная защита", chain: "nature", stage: "mid" },
  { id: "bark", icon: "🪵", name: "Кора", description: "Твердая оболочка дерева", chain: "nature", stage: "mid" },
  { id: "thorn", icon: "🌵", name: "Шип", description: "Острый защитный вырост", chain: "nature", stage: "mid" },
  { id: "herb", icon: "\ud83c\udf3e", name: "Трава", description: "Лечебная зеленая масса", chain: "nature", stage: "mid" },
  { id: "nectar", icon: "🍯", name: "Нектар", description: "Сладкий цветочный сок", chain: "nature", stage: "mid" },
  { id: "forest", icon: "🌲", name: "Лес", description: "Сообщество деревьев и жизни", chain: "nature", stage: "late" },
  { id: "garden", icon: "🏡", name: "Сад", description: "Упорядоченная живая среда", chain: "nature", stage: "late" },
  { id: "worldTree", icon: "\ud83c\udf34", name: "Мировое дерево", description: "Опора живого мира", chain: "nature", stage: "endgame" },

  { id: "coal", icon: "⚫", name: "Уголь", description: "Плотное горючее вещество", chain: "material", stage: "early" },
  { id: "ore", icon: "⛏️", name: "Руда", description: "Минеральный источник металла", chain: "material", stage: "early" },
  { id: "metal", icon: "🔩", name: "Металл", description: "Прочный техноматериал", chain: "material", stage: "early" },
  { id: "copper", icon: "🟠", name: "Медь", description: "Мягкий проводящий металл", chain: "material", stage: "mid" },
  { id: "iron", icon: "\ud83e\ude99", name: "Железо", description: "Базовый крепкий металл", chain: "material", stage: "mid" },
  { id: "steel", icon: "🔗", name: "Сталь", description: "Усиленный железный сплав", chain: "material", stage: "mid" },
  { id: "silver", icon: "⚪", name: "Серебро", description: "Чистый проводящий металл", chain: "material", stage: "mid" },
  { id: "gold", icon: "🟡", name: "Золото", description: "Редкий стабильный металл", chain: "material", stage: "mid" },
  { id: "alloy", icon: "🧩", name: "Сплав", description: "Смешанный прочный материал", chain: "material", stage: "mid" },
  { id: "wire", icon: "🧵", name: "Проводник", description: "Гибкий канал заряда", chain: "material", stage: "mid" },
  { id: "magnet", icon: "🧲", name: "Магнит", description: "Материал с полем притяжения", chain: "material", stage: "mid" },
  { id: "lens", icon: "🔍", name: "Линза", description: "Фокусирующая прозрачная форма", chain: "material", stage: "mid" },
  { id: "mirror", icon: "\ud83e\udea9", name: "Зеркало", description: "Отражающая гладкая поверхность", chain: "material", stage: "mid" },
  { id: "prism", icon: "🔺", name: "Призма", description: "Расщепитель направленного света", chain: "material", stage: "mid" },
  { id: "ceramic", icon: "🏺", name: "Керамика", description: "Обожженная минеральная форма", chain: "material", stage: "mid" },
  { id: "graphite", icon: "✏️", name: "Графит", description: "Темный проводящий углерод", chain: "material", stage: "mid" },
  { id: "obsidian", icon: "⬛", name: "Обсидиан", description: "Темное вулканическое стекло", chain: "material", stage: "late" },
  { id: "gem", icon: "\ud83d\udc8d", name: "Самоцвет", description: "Ценный природный кристалл", chain: "material", stage: "late" },
  { id: "mythril", icon: "🔹", name: "Мифрил", description: "Легкий магический металл", chain: "material", stage: "late" },
  { id: "adamant", icon: "\ud83d\udcaa", name: "Адамант", description: "Почти нерушимый материал", chain: "material", stage: "endgame" },

  { id: "gear", icon: "⚙️", name: "Шестерня", description: "Простейшая деталь передачи", chain: "technology", stage: "early" },
  { id: "mechanism", icon: "\ud83d\udd79\ufe0f", name: "Механизм", description: "Система движущихся деталей", chain: "technology", stage: "mid" },
  { id: "circuit", icon: "🖧", name: "Схема", description: "Замкнутая логическая сеть", chain: "technology", stage: "mid" },
  { id: "chip", icon: "💾", name: "Чип", description: "Малый вычислительный модуль", chain: "technology", stage: "mid" },
  { id: "sensor", icon: "📡", name: "Сенсор", description: "Узел считывания сигналов", chain: "technology", stage: "mid" },
  { id: "terminal", icon: "🖥️", name: "Терминал", description: "Панель управления системой", chain: "technology", stage: "mid" },
  { id: "scanner", icon: "📟", name: "Сканер", description: "Прибор анализа образцов", chain: "technology", stage: "mid" },
  { id: "processor", icon: "🧮", name: "Процессор", description: "Центр вычисления команд", chain: "technology", stage: "mid" },
  { id: "machine", icon: "🛠️", name: "Машина", description: "Собранный рабочий модуль", chain: "technology", stage: "mid" },
  { id: "engine", icon: "🚂", name: "Двигатель", description: "Модуль создания движения", chain: "technology", stage: "mid" },
  { id: "pump", icon: "⛽", name: "Насос", description: "Перекачивает жидкие среды", chain: "technology", stage: "mid" },
  { id: "drone", icon: "🛸", name: "Дрон", description: "Летающий автономный модуль", chain: "technology", stage: "mid" },
  { id: "robot", icon: "🤖", name: "Робот", description: "Автономный лабораторный исполнитель", chain: "technology", stage: "mid" },
  { id: "automaton", icon: "🦿", name: "Автоматон", description: "Механический имитатор жизни", chain: "technology", stage: "late" },
  { id: "android", icon: "🦾", name: "Андроид", description: "Искусственный разумный носитель", chain: "technology", stage: "late" },
  { id: "factory", icon: "🏭", name: "Фабрика", description: "Комплекс массового производства", chain: "technology", stage: "late" },
  { id: "serverCore", icon: "🖲️", name: "Серверное ядро", description: "Центр цифрового управления", chain: "technology", stage: "late" },
  { id: "labModule", icon: "🧰", name: "Лабомодуль", description: "Сменный блок лаборатории", chain: "technology", stage: "late" },
  { id: "stabilizer", icon: "🛡️", name: "Стабилизатор", description: "Снижает хаос реакций", chain: "technology", stage: "late" },
  { id: "replicator", icon: "🖨️", name: "Репликатор", description: "Повторяет сложные образцы", chain: "technology", stage: "endgame" },

  { id: "life", icon: "🧬", name: "Жизнь", description: "Самоподдерживающийся живой контур", chain: "biology", stage: "early" },
  { id: "cell", icon: "🔬", name: "Клетка", description: "Малая единица жизни", chain: "biology", stage: "mid" },
  { id: "tissue", icon: "🧫", name: "Ткань", description: "Группа связанных клеток", chain: "biology", stage: "mid" },
  { id: "organism", icon: "🦠", name: "Организм", description: "Единая адаптивная жизнь", chain: "biology", stage: "mid" },
  { id: "nerve", icon: "\ud83e\udea2", name: "Нерв", description: "Канал живого сигнала", chain: "biology", stage: "mid" },
  { id: "brain", icon: "🧠", name: "Мозг", description: "Центр обработки ощущений", chain: "biology", stage: "mid" },
  { id: "mind", icon: "\ud83d\udcad", name: "Разум", description: "Осознанный контур мышления", chain: "biology", stage: "mid" },
  { id: "bone", icon: "🦴", name: "Кость", description: "Твердая опора организма", chain: "biology", stage: "mid" },
  { id: "blood", icon: "🩸", name: "Кровь", description: "Жидкая ткань жизни", chain: "biology", stage: "mid" },
  { id: "beast", icon: "🐾", name: "Зверь", description: "Сложная активная жизнь", chain: "biology", stage: "mid" },
  { id: "shell", icon: "🐚", name: "Панцирь", description: "Твердая защитная оболочка", chain: "biology", stage: "mid" },
  { id: "dna", icon: "\ud83e\uddfe", name: "ДНК", description: "Код наследования формы", chain: "biology", stage: "late" },
  { id: "mutation", icon: "\ud83e\udddf", name: "Мутация", description: "Нестабильное изменение жизни", chain: "biology", stage: "late" },
  { id: "symbiote", icon: "🪱", name: "Симбиот", description: "Сращенная живая система", chain: "biology", stage: "late" },
  { id: "bioCore", icon: "💚", name: "Биоядро", description: "Сжатый центр жизни", chain: "biology", stage: "late" },
  { id: "embryo", icon: "🥚", name: "Эмбрион", description: "Зародыш будущей формы", chain: "biology", stage: "late" },
  { id: "hivemind", icon: "\ud83d\udc1d", name: "Улей-разум", description: "Коллективное сознание жизни", chain: "biology", stage: "endgame" },

  { id: "mana", icon: "✨", name: "Мана", description: "Управляемая аркан-энергия", chain: "magic", stage: "mid" },
  { id: "rune", icon: "🔣", name: "Руна", description: "Символ силы и правила", chain: "magic", stage: "mid" },
  { id: "sigil", icon: "🔯", name: "Сигил", description: "Закрепленный магический знак", chain: "magic", stage: "mid" },
  { id: "scroll", icon: "📜", name: "Свиток", description: "Носитель записанного знания", chain: "magic", stage: "mid" },
  { id: "spell", icon: "\ud83d\udcab", name: "Заклинание", description: "Исполняемый магический паттерн", chain: "magic", stage: "mid" },
  { id: "soul", icon: "🫀", name: "Душа", description: "Индивидуальный жизненный импульс", chain: "magic", stage: "mid" },
  { id: "spirit", icon: "👻", name: "Дух", description: "Свободная нематериальная форма", chain: "magic", stage: "mid" },
  { id: "ghost", icon: "\ud83d\udc80", name: "Призрак", description: "След потерянного сознания", chain: "magic", stage: "mid" },
  { id: "golem", icon: "🗿", name: "Голем", description: "Материя с вложенной волей", chain: "magic", stage: "mid" },
  { id: "wand", icon: "🪄", name: "Жезл", description: "Фокус ручного колдовства", chain: "magic", stage: "mid" },
  { id: "altar", icon: "🕯️", name: "Алтарь", description: "Место усиленной связи", chain: "magic", stage: "late" },
  { id: "ritual", icon: "⭕", name: "Ритуал", description: "Последовательность магических действий", chain: "magic", stage: "late" },
  { id: "relic", icon: "\ud83c\udff5\ufe0f", name: "Реликвия", description: "Предмет с древней силой", chain: "magic", stage: "late" },
  { id: "aura", icon: "\ud83c\udf08", name: "Аура", description: "Внешнее поле сущности", chain: "magic", stage: "late" },
  { id: "curse", icon: "🕸️", name: "Проклятие", description: "Вредоносная магическая программа", chain: "magic", stage: "late" },
  { id: "blessing", icon: "🌟", name: "Благословение", description: "Поддерживающая магическая программа", chain: "magic", stage: "late" },
  { id: "oracle", icon: "🔮", name: "Оракул", description: "Источник предельного знания", chain: "magic", stage: "late" },
  { id: "arcaneCore", icon: "\ud83d\udfe3", name: "Аркан-ядро", description: "Концентрат чистой магии", chain: "magic", stage: "endgame" },

  { id: "meteor", icon: "☄️", name: "Метеор", description: "Разогретое космическое тело", chain: "space", stage: "mid" },
  { id: "comet", icon: "\ud83e\udeb6", name: "Комета", description: "Ледяной странник орбиты", chain: "space", stage: "mid" },
  { id: "moon", icon: "🌙", name: "Луна", description: "Спутник стабильной планеты", chain: "space", stage: "mid" },
  { id: "star", icon: "⭐", name: "Звезда", description: "Источник космического света", chain: "space", stage: "late" },
  { id: "planet", icon: "🪐", name: "Планета", description: "Крупный устойчивый мир", chain: "space", stage: "late" },
  { id: "orbit", icon: "➿", name: "Орбита", description: "Устойчивая траектория движения", chain: "space", stage: "late" },
  { id: "gravity", icon: "\u2b07\ufe0f", name: "Гравитация", description: "Сила удержания материи", chain: "space", stage: "late" },
  { id: "nebula", icon: "🌌", name: "Туманность", description: "Облако звездной пыли", chain: "space", stage: "late" },
  { id: "galaxy", icon: "\ud83c\udf09", name: "Галактика", description: "Скопление звездных систем", chain: "space", stage: "late" },
  { id: "portal", icon: "🌀", name: "Портал", description: "Проход между слоями мира", chain: "space", stage: "mid" },
  { id: "gate", icon: "🚪", name: "Врата", description: "Управляемая рамка перехода", chain: "space", stage: "mid" },
  { id: "dimension", icon: "\ud83e\ude9f", name: "Измерение", description: "Слой иных физических правил", chain: "space", stage: "late" },
  { id: "cosmos", icon: "\ud83c\udf03", name: "Космос", description: "Внешнее пространство миров", chain: "space", stage: "late" },
  { id: "universe", icon: "\ud83c\udf10", name: "Вселенная", description: "Полная структура реальности", chain: "space", stage: "endgame" },
  { id: "eclipse", icon: "🌘", name: "Затмение", description: "Перекрытый небесный свет", chain: "space", stage: "late" },
  { id: "asteroid", icon: "\ud83d\udef0\ufe0f", name: "Астероид", description: "Каменное тело орбиты", chain: "space", stage: "mid" },

  { id: "shadow", icon: "🌑", name: "Тень", description: "Недостаток света и формы", chain: "void", stage: "mid" },
  { id: "echo", icon: "\ud83d\udd0a", name: "Эхо", description: "Повтор угасающего сигнала", chain: "void", stage: "mid" },
  { id: "rift", icon: "\ud83e\ude7b", name: "Разлом", description: "Разрыв стабильной ткани", chain: "void", stage: "late" },
  { id: "anomaly", icon: "❓", name: "Аномалия", description: "Нарушение ожидаемых правил", chain: "void", stage: "late" },
  { id: "darkMatter", icon: "\u25fc\ufe0f", name: "Тёмная материя", description: "Скрытая масса реальности", chain: "void", stage: "late" },
  { id: "void", icon: "◾", name: "Пустота", description: "Безструктурное поле до формы", chain: "void", stage: "late" },
  { id: "abyss", icon: "\ud83d\udda4", name: "Бездна", description: "Глубина без устойчивых границ", chain: "void", stage: "late" },
  { id: "entropy", icon: "\ud83d\udcc9", name: "Энтропия", description: "Распад порядка и энергии", chain: "void", stage: "endgame" },
  { id: "blackHole", icon: "\ud83d\udd73\ufe0f", name: "Чёрная дыра", description: "Гравитационная ловушка света", chain: "void", stage: "endgame" },
  { id: "singularity", icon: "🔘", name: "Сингулярность", description: "Точка предельной плотности", chain: "void", stage: "endgame" },

  { id: "camp", icon: "⛺", name: "Лагерь", description: "Первое организованное место", chain: "civilization", stage: "mid" },
  { id: "forge", icon: "\u2692\ufe0f", name: "Кузница", description: "Место обработки металла", chain: "civilization", stage: "mid" },
  { id: "workshop", icon: "🪚", name: "Мастерская", description: "Зона сборки механизмов", chain: "civilization", stage: "mid" },
  { id: "library", icon: "📚", name: "Библиотека", description: "Хранилище знаний и схем", chain: "civilization", stage: "mid" },
  { id: "archive", icon: "🗄️", name: "Архив", description: "Упорядоченная память системы", chain: "civilization", stage: "mid" },
  { id: "tower", icon: "🗼", name: "Башня", description: "Вертикальный узел наблюдения", chain: "civilization", stage: "late" },
  { id: "city", icon: "🏙️", name: "Город", description: "Сложная живая инфраструктура", chain: "civilization", stage: "late" },
  { id: "guild", icon: "⚜️", name: "Гильдия", description: "Орден общего ремесла", chain: "civilization", stage: "late" },
  { id: "market", icon: "🏪", name: "Рынок", description: "Обмен ресурсами и знаниями", chain: "civilization", stage: "late" },
  { id: "temple", icon: "🏛️", name: "Храм", description: "Узел веры и ритуала", chain: "civilization", stage: "late" },
  { id: "observatory", icon: "🔭", name: "Обсерватория", description: "Место наблюдения космоса", chain: "civilization", stage: "late" },
  { id: "colony", icon: "🏘️", name: "Колония", description: "Самостоятельный внешний мир", chain: "civilization", stage: "endgame" },

  { id: "artificialSoul", icon: "🪫", name: "Искусственная душа", description: "Сконструированное внутреннее ядро", chain: "final", stage: "late" },
  { id: "livingMachine", icon: "\ud83e\udddf\u200d\u2642\ufe0f", name: "Живая машина", description: "Гибрид жизни и механики", chain: "final", stage: "late" },
  { id: "world", icon: "🌍", name: "Мир", description: "Стабильный контур экосистемы", chain: "final", stage: "late" },
  { id: "worldEngine", icon: "🗺️", name: "Двигатель мира", description: "Стабилизатор планетарных процессов", chain: "final", stage: "endgame" },
  { id: "genesisCore", icon: "\ud83d\udd4a\ufe0f", name: "Ядро генезиса", description: "Источник управляемого творения", chain: "final", stage: "endgame" },
  { id: "realitySeed", icon: "\ud83e\udec4", name: "Семя реальности", description: "Зачаток нового закона мира", chain: "final", stage: "endgame" },
  { id: "creationMatrix", icon: "\ud83e\udded", name: "Матрица творения", description: "Схема сборки реальности", chain: "final", stage: "endgame" },
  { id: "cosmicMind", icon: "\ud83c\udf20", name: "Космический разум", description: "Сознание масштаба вселенной", chain: "final", stage: "endgame" },
  { id: "universeHeart", icon: "💖", name: "Сердце вселенной", description: "Живой центр космоса", chain: "final", stage: "endgame" },
  { id: "omegaCore", icon: "\ud83d\udc51", name: "Омега-ядро", description: "Предельный финальный источник", chain: "final", stage: "endgame" },

  { id: "science", icon: "\ud83d\udcd0", name: "Наука", description: "Системное знание о реакциях", chain: "technology", stage: "mid" },
  { id: "transmitter", icon: "📶", name: "Передатчик", description: "Узел направленной передачи сигнала", chain: "technology", stage: "late" },
  { id: "colossus", icon: "\ud83c\udfd4\ufe0f", name: "Колосс", description: "Гигантская устойчивая конструкция", chain: "final", stage: "endgame" }
];

const PALETTE_STAGES: AlchemyPaletteStage[] = ["early", "mid", "late", "endgame"];
const PALETTE_CHAINS: AlchemyPaletteChain[] = [
  "energy",
  "elemental",
  "nature",
  "material",
  "technology",
  "biology",
  "magic",
  "space",
  "void",
  "civilization",
  "final"
];

export const validateAlchemyEmojiPalette = (): void => {
  const ids = new Set<string>();
  const icons = new Map<string, AlchemyPaletteItem[]>();

  ALCHEMY_EMOJI_PALETTE.forEach((item) => {
    if (!item.id || !item.icon || !item.name || !item.description) {
      throw new Error(`Palette item '${item.id || "<empty>"}' must include id, icon, name and description`);
    }

    if (ids.has(item.id)) {
      throw new Error(`Duplicate palette id '${item.id}'`);
    }
    ids.add(item.id);

    if (!PALETTE_STAGES.includes(item.stage)) {
      throw new Error(`Invalid palette stage '${item.stage}' for '${item.id}'`);
    }

    if (!PALETTE_CHAINS.includes(item.chain)) {
      throw new Error(`Invalid palette chain '${item.chain}' for '${item.id}'`);
    }

    const sameIconItems = icons.get(item.icon) ?? [];
    sameIconItems.push(item);
    icons.set(item.icon, sameIconItems);
  });

  const duplicateIcons = Array.from(icons.entries())
    .filter(([, items]) => items.length > 1)
    .map(([icon, items]) => `${icon}: ${items.map((item) => `${item.id}(${item.name})`).join(", ")}`);

  if (duplicateIcons.length > 0) {
    throw new Error(`Duplicate palette emoji icons:\n${duplicateIcons.join("\n")}`);
  }
};

validateAlchemyEmojiPalette();
