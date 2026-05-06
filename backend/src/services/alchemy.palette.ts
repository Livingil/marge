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
  { id: "spark", icon: "⚡", name: "Искра", description: "Мгновенный скачок сырой энергии", chain: "energy", stage: "early" },
  { id: "charge", icon: "🔌", name: "Заряд", description: "Короткий накопленный импульс тока", chain: "energy", stage: "early" },
  { id: "battery", icon: "🔋", name: "Батарея", description: "Базовый переносной накопитель энергии", chain: "energy", stage: "early" },
  { id: "energyCell", icon: "💠", name: "Энергоячейка", description: "Усиленный стабильный контейнер энергии", chain: "energy", stage: "mid" },
  { id: "lightning", icon: "🌩️", name: "Молния", description: "Импульс высоковольтного атмосферного разряда", chain: "energy", stage: "mid" },
  { id: "plasma", icon: "🫧", name: "Плазма", description: "Перегретая ионизированная энергетическая среда", chain: "energy", stage: "mid" },
  { id: "powerCore", icon: "🔶", name: "Силовое ядро", description: "Центр хранения боевого напряжения", chain: "energy", stage: "late" },
  { id: "quantumCore", icon: "🧿", name: "Квантовое ядро", description: "Сверхплотный источник фазовой мощности", chain: "energy", stage: "late" },
  { id: "reactor", icon: "☢️", name: "Реактор", description: "Сердце постоянной генерации энергии", chain: "energy", stage: "late" },
  { id: "radiation", icon: "☣️", name: "Радиация", description: "Опасный поток проникающих квантов", chain: "energy", stage: "late" },
  { id: "pulse", icon: "〰️", name: "Импульс", description: "Ритм кратких энергетических выбросов", chain: "energy", stage: "early" },
  { id: "current", icon: "🔄", name: "Ток", description: "Направленное движение заряженных частиц", chain: "energy", stage: "early" },
  { id: "voltage", icon: "📈", name: "Напряжение", description: "Разность потенциалов для работы", chain: "energy", stage: "mid" },
  { id: "capacitor", icon: "🧱", name: "Конденсатор", description: "Временное хранилище электрического заряда", chain: "energy", stage: "mid" },
  { id: "generator", icon: "⚙️", name: "Генератор", description: "Узел преобразования движения в ток", chain: "energy", stage: "mid" },
  { id: "turbine", icon: "🌀", name: "Турбина", description: "Вращатель для энергетических контуров", chain: "energy", stage: "mid" },
  { id: "overload", icon: "💥", name: "Перегрузка", description: "Аварийный выброс лишней мощности", chain: "energy", stage: "late" },
  { id: "arc", icon: "🪄", name: "Дуга", description: "Стабилизированный электрический мост разряда", chain: "energy", stage: "mid" },
  { id: "stormCore", icon: "🌪️", name: "Штормовое ядро", description: "Конденсат турбулентной атмосферной силы", chain: "energy", stage: "late" },
  { id: "ion", icon: "🔹", name: "Ион", description: "Заряженная частица реактивной среды", chain: "energy", stage: "early" },
  { id: "flux", icon: "➿", name: "Флюкс", description: "Плавающий поток переменной мощности", chain: "energy", stage: "late" },
  { id: "superconductor", icon: "🧲", name: "Сверхпроводник", description: "Канал тока почти без потерь", chain: "energy", stage: "endgame" },

  { id: "fire", icon: "🔥", name: "Огонь", description: "Горячая активная стихийная фаза", chain: "elemental", stage: "early" },
  { id: "water", icon: "💧", name: "Вода", description: "Текучая основа ранних реакций", chain: "elemental", stage: "early" },
  { id: "stone", icon: "🪨", name: "Камень", description: "Твердая минеральная база материи", chain: "elemental", stage: "early" },
  { id: "wind", icon: "💨", name: "Ветер", description: "Подвижный воздушный поток среды", chain: "elemental", stage: "early" },
  { id: "ice", icon: "🧊", name: "Лёд", description: "Застывшая форма чистой воды", chain: "elemental", stage: "early" },
  { id: "steam", icon: "♨️", name: "Пар", description: "Горячая летучая фаза воды", chain: "elemental", stage: "early" },
  { id: "ash", icon: "🌫️", name: "Пепел", description: "Остаток сгоревшей органической массы", chain: "elemental", stage: "early" },
  { id: "lava", icon: "🌋", name: "Лава", description: "Расплавленная огненная минеральная смесь", chain: "elemental", stage: "mid" },
  { id: "smoke", icon: "💭", name: "Дым", description: "Газовый след жаркой реакции", chain: "elemental", stage: "early" },
  { id: "dust", icon: "🫧", name: "Пыль", description: "Мелкая взвесь сухой материи", chain: "elemental", stage: "early" },
  { id: "clay", icon: "🟫", name: "Глина", description: "Пластичная минеральная влажная смесь", chain: "elemental", stage: "early" },
  { id: "sand", icon: "🟨", name: "Песок", description: "Сыпучая фракция дробленого камня", chain: "elemental", stage: "early" },
  { id: "glass", icon: "🪞", name: "Стекло", description: "Прозрачная застывшая силикатная масса", chain: "elemental", stage: "mid" },
  { id: "crystal", icon: "💎", name: "Кристалл", description: "Упорядоченная решетка твердой энергии", chain: "elemental", stage: "mid" },
  { id: "mud", icon: "🟤", name: "Грязь", description: "Сырая смесь почвы и воды", chain: "elemental", stage: "early" },
  { id: "metalOre", icon: "⛏️", name: "Руда", description: "Камень с примесью металлов", chain: "elemental", stage: "mid" },
  { id: "salt", icon: "🧂", name: "Соль", description: "Кристаллический остаток высохшей воды", chain: "elemental", stage: "mid" },
  { id: "acid", icon: "🧪", name: "Кислота", description: "Едкая активная химическая среда", chain: "elemental", stage: "mid" },
  { id: "mist", icon: "🌁", name: "Туман", description: "Рассеянная влажная воздушная взвесь", chain: "elemental", stage: "early" },
  { id: "frost", icon: "❄️", name: "Иней", description: "Холодный узор кристаллов влаги", chain: "elemental", stage: "early" },
  { id: "ember", icon: "🟠", name: "Уголёк", description: "Тлеющее зерно высокой температуры", chain: "elemental", stage: "early" },
  { id: "quartz", icon: "🔷", name: "Кварц", description: "Чистый минеральный кристалл структуры", chain: "elemental", stage: "mid" },

  { id: "seed", icon: "🌱", name: "Росток", description: "Зачаток будущей живой структуры", chain: "nature", stage: "early" },
  { id: "sprout", icon: "🌿", name: "Побег", description: "Молодая фаза активного роста", chain: "nature", stage: "early" },
  { id: "plant", icon: "🪴", name: "Растение", description: "Стабильная органическая форма развития", chain: "nature", stage: "early" },
  { id: "root", icon: "🫚", name: "Корень", description: "Опора и питание живой системы", chain: "nature", stage: "early" },
  { id: "leaf", icon: "🍃", name: "Лист", description: "Пластина сбора солнечной энергии", chain: "nature", stage: "early" },
  { id: "flower", icon: "🌸", name: "Цветок", description: "Фаза репродукции и аромата", chain: "nature", stage: "mid" },
  { id: "tree", icon: "🌳", name: "Дерево", description: "Крупная устойчивая биологическая структура", chain: "nature", stage: "mid" },
  { id: "moss", icon: "🌱", name: "Мох", description: "Низкий покров влажной среды", chain: "nature", stage: "early" },
  { id: "algae", icon: "🪸", name: "Водоросль", description: "Примитивная живая водная матрица", chain: "nature", stage: "mid" },
  { id: "vine", icon: "🌿", name: "Лиана", description: "Гибкий цепляющийся стебель роста", chain: "nature", stage: "mid" },
  { id: "mushroom", icon: "🍄", name: "Гриб", description: "Споровая форма теневой экологии", chain: "nature", stage: "mid" },
  { id: "fruit", icon: "🍎", name: "Плод", description: "Носитель семян и питательных веществ", chain: "nature", stage: "mid" },
  { id: "pollen", icon: "🟡", name: "Пыльца", description: "Микрочастицы репродуктивного переноса", chain: "nature", stage: "mid" },
  { id: "forest", icon: "🌲", name: "Лес", description: "Плотный массив живых экосвязей", chain: "nature", stage: "late" },
  { id: "herb", icon: "🌿", name: "Трава", description: "Лекарственное мягкое растение среды", chain: "nature", stage: "early" },
  { id: "thorn", icon: "🌵", name: "Шип", description: "Защитный природный острый вырост", chain: "nature", stage: "mid" },
  { id: "bark", icon: "🪵", name: "Кора", description: "Внешний слой защиты дерева", chain: "nature", stage: "mid" },
  { id: "resin", icon: "🟠", name: "Смола", description: "Клейкий древесный защитный экссудат", chain: "nature", stage: "mid" },
  { id: "nectar", icon: "🍯", name: "Нектар", description: "Сладкая жидкость цветочных тканей", chain: "nature", stage: "mid" },
  { id: "soil", icon: "🟫", name: "Почва", description: "Питательная основа наземной жизни", chain: "nature", stage: "early" },
  { id: "fern", icon: "🌿", name: "Папоротник", description: "Древняя листовая форма роста", chain: "nature", stage: "mid" },
  { id: "spore", icon: "⚪", name: "Спора", description: "Микрокапсула распространения грибов", chain: "nature", stage: "mid" },

  { id: "metal", icon: "🔩", name: "Металл", description: "Прочный базовый материал механизмов", chain: "material", stage: "early" },
  { id: "copper", icon: "🟠", name: "Медь", description: "Пластичный проводящий технический металл", chain: "material", stage: "early" },
  { id: "iron", icon: "⚙️", name: "Железо", description: "Тяжелая основа инженерных конструкций", chain: "material", stage: "early" },
  { id: "steel", icon: "🔧", name: "Сталь", description: "Укрепленный сплав для узлов", chain: "material", stage: "mid" },
  { id: "silver", icon: "🥈", name: "Серебро", description: "Редкий проводящий благородный металл", chain: "material", stage: "mid" },
  { id: "gold", icon: "🥇", name: "Золото", description: "Ценный стабильный благородный металл", chain: "material", stage: "mid" },
  { id: "alloy", icon: "🧲", name: "Сплав", description: "Комбинация металлов для прочности", chain: "material", stage: "mid" },
  { id: "gear", icon: "⚙️", name: "Шестерня", description: "Зубчатый элемент передачи движения", chain: "material", stage: "mid" },
  { id: "wire", icon: "🧵", name: "Проводник", description: "Гибкий канал для электротока", chain: "material", stage: "mid" },
  { id: "magnet", icon: "🧲", name: "Магнит", description: "Узел взаимодействия с полем", chain: "material", stage: "mid" },
  { id: "lens", icon: "🔍", name: "Линза", description: "Фокусирующий прозрачный оптический элемент", chain: "material", stage: "mid" },
  { id: "mirror", icon: "🪞", name: "Зеркало", description: "Отражающая поверхность для лучей", chain: "material", stage: "mid" },
  { id: "prism", icon: "🔶", name: "Призма", description: "Геометрия расщепления светового потока", chain: "material", stage: "late" },
  { id: "ceramic", icon: "🏺", name: "Керамика", description: "Обожженный материал тепловой стойкости", chain: "material", stage: "mid" },
  { id: "coal", icon: "⚫", name: "Уголь", description: "Плотное горючее вещество недр", chain: "material", stage: "early" },
  { id: "graphite", icon: "⬛", name: "Графит", description: "Мягкая форма углеродной структуры", chain: "material", stage: "mid" },
  { id: "obsidian", icon: "◼️", name: "Обсидиан", description: "Вулканическое стекло темной текстуры", chain: "material", stage: "late" },
  { id: "gem", icon: "💍", name: "Самоцвет", description: "Редкий декоративный кристалл силы", chain: "material", stage: "late" },

  { id: "mechanism", icon: "⚙️", name: "Механизм", description: "Согласованная система деталей движения", chain: "technology", stage: "early" },
  { id: "circuit", icon: "🖧", name: "Схема", description: "Контур логики и сигналов", chain: "technology", stage: "mid" },
  { id: "chip", icon: "💾", name: "Чип", description: "Миниатюрный носитель вычислительных узлов", chain: "technology", stage: "mid" },
  { id: "sensor", icon: "📡", name: "Сенсор", description: "Модуль чтения внешних параметров", chain: "technology", stage: "mid" },
  { id: "drone", icon: "🛸", name: "Дрон", description: "Мобильный автономный техноразведчик", chain: "technology", stage: "mid" },
  { id: "robot", icon: "🤖", name: "Робот", description: "Автономный исполнитель лабораторных задач", chain: "technology", stage: "mid" },
  { id: "android", icon: "🦾", name: "Андроид", description: "Искусственный носитель сложного поведения", chain: "technology", stage: "late" },
  { id: "machine", icon: "🛠️", name: "Машина", description: "Техномодуль выполнения полезных процессов", chain: "technology", stage: "mid" },
  { id: "factory", icon: "🏭", name: "Фабрика", description: "Комплекс массового техносинтеза узлов", chain: "technology", stage: "late" },
  { id: "engine", icon: "🚂", name: "Двигатель", description: "Источник тяги и вращения", chain: "technology", stage: "mid" },
  { id: "pump", icon: "⚗️", name: "Насос", description: "Узел перекачки рабочих жидкостей", chain: "technology", stage: "mid" },
  { id: "terminal", icon: "🖥️", name: "Терминал", description: "Точка управления лабораторными модулями", chain: "technology", stage: "mid" },
  { id: "scanner", icon: "📟", name: "Сканер", description: "Блок анализа структурных параметров", chain: "technology", stage: "mid" },
  { id: "transmitter", icon: "📶", name: "Передатчик", description: "Узел отправки сигналов и данных", chain: "technology", stage: "mid" },
  { id: "batteryPack", icon: "🔋", name: "Блок батарей", description: "Сборка модулей для запаса", chain: "technology", stage: "mid" },
  { id: "labModule", icon: "🧰", name: "Лаб-модуль", description: "Стандартизированный блок научной станции", chain: "technology", stage: "late" },
  { id: "stabilizer", icon: "🧭", name: "Стабилизатор", description: "Гаситель колебаний системы питания", chain: "technology", stage: "late" },
  { id: "processor", icon: "🧠", name: "Процессор", description: "Ядро вычислительных преобразований сигнала", chain: "technology", stage: "late" },
  { id: "serverCore", icon: "🗄️", name: "Серверное ядро", description: "Центр хранения расчетных потоков", chain: "technology", stage: "late" },
  { id: "automaton", icon: "🦿", name: "Автоматон", description: "Самодействующая механическая платформа операций", chain: "technology", stage: "late" },
  { id: "nanoforge", icon: "🧫", name: "Нанокузня", description: "Микросборка точных технологичных деталей", chain: "technology", stage: "endgame" },
  { id: "quantumRouter", icon: "🛰️", name: "Квантовый узел", description: "Маршрутизация нестабильных фазовых пакетов", chain: "technology", stage: "endgame" },

  { id: "life", icon: "🧬", name: "Жизнь", description: "Самоподдерживающаяся комплексная биосистема", chain: "biology", stage: "mid" },
  { id: "organism", icon: "🦠", name: "Организм", description: "Единый адаптивный биологический контур", chain: "biology", stage: "mid" },
  { id: "cell", icon: "🔬", name: "Клетка", description: "Базовая единица живой материи", chain: "biology", stage: "early" },
  { id: "tissue", icon: "🩹", name: "Ткань", description: "Слой специализированных живых клеток", chain: "biology", stage: "mid" },
  { id: "nerve", icon: "🕸️", name: "Нерв", description: "Канал быстрой передачи сигналов", chain: "biology", stage: "mid" },
  { id: "brain", icon: "🧠", name: "Мозг", description: "Центр обработки поведения и памяти", chain: "biology", stage: "late" },
  { id: "mind", icon: "🧠", name: "Разум", description: "Осознанный когнитивный контур управления", chain: "biology", stage: "late" },
  { id: "beast", icon: "🐾", name: "Зверь", description: "Сильная инстинктивная форма жизни", chain: "biology", stage: "late" },
  { id: "shell", icon: "🐚", name: "Панцирь", description: "Наружная защита органической структуры", chain: "biology", stage: "mid" },
  { id: "bone", icon: "🦴", name: "Кость", description: "Жесткая опора живого тела", chain: "biology", stage: "mid" },
  { id: "blood", icon: "🩸", name: "Кровь", description: "Жидкий транспортный поток организма", chain: "biology", stage: "mid" },
  { id: "dna", icon: "🧬", name: "ДНК", description: "Код наследования и мутаций", chain: "biology", stage: "late" },
  { id: "mutation", icon: "🧪", name: "Мутация", description: "Изменение биокода под нагрузкой", chain: "biology", stage: "late" },
  { id: "symbiote", icon: "🪱", name: "Симбиот", description: "Партнерская форма совместной жизни", chain: "biology", stage: "late" },
  { id: "bioCore", icon: "🫀", name: "Биоядро", description: "Стабилизатор органической жизненной энергии", chain: "biology", stage: "endgame" },
  { id: "embryo", icon: "🥚", name: "Эмбрион", description: "Начальная фаза развития организма", chain: "biology", stage: "mid" },
  { id: "instinct", icon: "🧭", name: "Инстинкт", description: "Встроенная реакция выживания системы", chain: "biology", stage: "late" },

  { id: "mana", icon: "✨", name: "Мана", description: "Чистый поток аркан-энергии поля", chain: "magic", stage: "mid" },
  { id: "rune", icon: "🔯", name: "Руна", description: "Символический ключ управления силой", chain: "magic", stage: "mid" },
  { id: "spell", icon: "📜", name: "Заклинание", description: "Программируемый паттерн магического действия", chain: "magic", stage: "late" },
  { id: "scroll", icon: "🧾", name: "Свиток", description: "Носитель записанных аркан-формул", chain: "magic", stage: "mid" },
  { id: "soul", icon: "🫀", name: "Душа", description: "Ядро индивидуального жизненного импульса", chain: "magic", stage: "late" },
  { id: "spirit", icon: "👻", name: "Дух", description: "Нестабильная форма вне телесной материи", chain: "magic", stage: "late" },
  { id: "ghost", icon: "👻", name: "Призрак", description: "Эхо сознания в эфирной форме", chain: "magic", stage: "late" },
  { id: "golem", icon: "🗿", name: "Голем", description: "Материальный носитель связанной души", chain: "magic", stage: "late" },
  { id: "crystalHeart", icon: "💎", name: "Кристалл-сердце", description: "Фокусирующий сосуд живой маны", chain: "magic", stage: "late" },
  { id: "wand", icon: "🪄", name: "Жезл", description: "Инструмент точной фокусировки чар", chain: "magic", stage: "mid" },
  { id: "sigil", icon: "✴️", name: "Сигил", description: "Печать активации аркан-контуров", chain: "magic", stage: "mid" },
  { id: "curse", icon: "⚠️", name: "Проклятие", description: "Негативный паттерн магического влияния", chain: "magic", stage: "late" },
  { id: "blessing", icon: "🛡️", name: "Благословение", description: "Позитивное усиление устойчивости сущности", chain: "magic", stage: "late" },
  { id: "ritual", icon: "🕯️", name: "Ритуал", description: "Последовательность шагов вызова силы", chain: "magic", stage: "late" },
  { id: "altar", icon: "🏛️", name: "Алтарь", description: "Стационарный узел аркан-стабилизации", chain: "magic", stage: "late" },
  { id: "relic", icon: "🗝️", name: "Реликт", description: "Древний предмет с остатком силы", chain: "magic", stage: "late" },
  { id: "aura", icon: "🔆", name: "Аура", description: "Светящийся слой личной энергии", chain: "magic", stage: "mid" },
  { id: "enchantment", icon: "🧿", name: "Чары", description: "Длительное наложение магических эффектов", chain: "magic", stage: "late" },
  { id: "oracle", icon: "🔮", name: "Оракул", description: "Инструмент предсказания скрытых связей", chain: "magic", stage: "late" },
  { id: "arcaneCore", icon: "🔷", name: "Аркан-ядро", description: "Конденсат чистой мистической мощности", chain: "magic", stage: "endgame" },

  { id: "meteor", icon: "☄️", name: "Метеор", description: "Разогретое тело космической материи", chain: "space", stage: "mid" },
  { id: "star", icon: "⭐", name: "Звезда", description: "Стабильный источник космического излучения", chain: "space", stage: "late" },
  { id: "planet", icon: "🪐", name: "Планета", description: "Крупное небесное тело орбиты", chain: "space", stage: "late" },
  { id: "moon", icon: "🌙", name: "Луна", description: "Естественный спутник планетарной системы", chain: "space", stage: "mid" },
  { id: "comet", icon: "☄️", name: "Комета", description: "Ледяное тело с ярким хвостом", chain: "space", stage: "mid" },
  { id: "nebula", icon: "🌌", name: "Туманность", description: "Облако пыли звездообразования", chain: "space", stage: "late" },
  { id: "galaxy", icon: "🌌", name: "Галактика", description: "Гигантская система звездных скоплений", chain: "space", stage: "late" },
  { id: "orbit", icon: "🌀", name: "Орбита", description: "Траектория устойчивого космического движения", chain: "space", stage: "mid" },
  { id: "gravity", icon: "🧲", name: "Гравитация", description: "Сила притяжения массивных тел", chain: "space", stage: "late" },
  { id: "portal", icon: "🌀", name: "Портал", description: "Туннель между удаленными слоями пространства", chain: "space", stage: "late" },
  { id: "gate", icon: "🚪", name: "Врата", description: "Контролируемая рамка межпространственного перехода", chain: "space", stage: "late" },
  { id: "dimension", icon: "🧱", name: "Измерение", description: "Изолированный слой пространственных правил", chain: "space", stage: "endgame" },
  { id: "cosmos", icon: "🌠", name: "Космос", description: "Суммарный слой наблюдаемой реальности", chain: "space", stage: "endgame" },
  { id: "universe", icon: "🌌", name: "Вселенная", description: "Единый космический контур реальности", chain: "space", stage: "endgame" },

  { id: "void", icon: "🕳️", name: "Пустота", description: "Безструктурное поле до формы мира", chain: "void", stage: "late" },
  { id: "shadow", icon: "🌑", name: "Тень", description: "Низкоэнергетический след отсутствия света", chain: "void", stage: "mid" },
  { id: "abyss", icon: "⬛", name: "Бездна", description: "Глубокий слой нестабильного ничто", chain: "void", stage: "late" },
  { id: "blackHole", icon: "⚫", name: "Чёрная дыра", description: "Сверхплотный коллапс пространства и времени", chain: "void", stage: "endgame" },
  { id: "singularity", icon: "⚫", name: "Сингулярность", description: "Точка предельной кривизны реальности", chain: "void", stage: "endgame" },
  { id: "entropy", icon: "📉", name: "Энтропия", description: "Рост хаоса в замкнутой системе", chain: "void", stage: "late" },
  { id: "echo", icon: "📡", name: "Эхо", description: "Затухающая копия далекого сигнала", chain: "void", stage: "mid" },
  { id: "rift", icon: "🕳️", name: "Разлом", description: "Трещина между несовместимыми слоями", chain: "void", stage: "late" },
  { id: "anomaly", icon: "❔", name: "Аномалия", description: "Локальное нарушение известных законов", chain: "void", stage: "late" },
  { id: "darkMatter", icon: "⚫", name: "Тёмная материя", description: "Скрытая масса космической структуры", chain: "void", stage: "endgame" },

  { id: "camp", icon: "⛺", name: "Лагерь", description: "Первая точка организации экспедиции", chain: "civilization", stage: "early" },
  { id: "forge", icon: "🔥", name: "Кузня", description: "Площадка плавки и обработки металла", chain: "civilization", stage: "mid" },
  { id: "workshop", icon: "🧰", name: "Мастерская", description: "Сборка инструментов и модулей", chain: "civilization", stage: "mid" },
  { id: "library", icon: "📚", name: "Библиотека", description: "Хранилище знаний и схем", chain: "civilization", stage: "mid" },
  { id: "tower", icon: "🗼", name: "Башня", description: "Высокий узел обзора и связи", chain: "civilization", stage: "late" },
  { id: "city", icon: "🏙️", name: "Город", description: "Сложная сеть производственных систем", chain: "civilization", stage: "late" },
  { id: "guild", icon: "🛡️", name: "Гильдия", description: "Союз мастеров и исследователей", chain: "civilization", stage: "late" },
  { id: "market", icon: "🏪", name: "Рынок", description: "Обмен ресурсами и артефактами", chain: "civilization", stage: "mid" },
  { id: "temple", icon: "⛩️", name: "Храм", description: "Центр ритуалов и стабилизации", chain: "civilization", stage: "late" },
  { id: "archive", icon: "🗂️", name: "Архив", description: "Систематизация редких открытий лаборатории", chain: "civilization", stage: "late" },
  { id: "observatory", icon: "🔭", name: "Обсерватория", description: "Узел наблюдения космических феноменов", chain: "civilization", stage: "late" },
  { id: "colony", icon: "🏘️", name: "Колония", description: "Автономный контур выживания цивилизации", chain: "civilization", stage: "endgame" },

  { id: "artificialSoul", icon: "🪫", name: "Искусственная душа", description: "Сконструированное сознательное внутреннее ядро", chain: "final", stage: "endgame" },
  { id: "livingMachine", icon: "🦿", name: "Живая машина", description: "Гибрид биологии, души и механики", chain: "final", stage: "endgame" },
  { id: "worldEngine", icon: "🌐", name: "Двигатель мира", description: "Система стабилизации планетарных процессов", chain: "final", stage: "endgame" },
  { id: "genesisCore", icon: "🧬", name: "Ядро генезиса", description: "Финальный техно-магический источник творения", chain: "final", stage: "endgame" },
  { id: "realitySeed", icon: "🌰", name: "Семя реальности", description: "Зачаток новой физической ветви", chain: "final", stage: "endgame" },
  { id: "cosmicMind", icon: "🌌", name: "Космический разум", description: "Сверхсвязное сознание звездных контуров", chain: "final", stage: "endgame" },
  { id: "eternalReactor", icon: "♾️", name: "Вечный реактор", description: "Бесконечный цикл чистой генерации", chain: "final", stage: "endgame" },
  { id: "universeHeart", icon: "❤️", name: "Сердце вселенной", description: "Центральный ритм мироздания и энергии", chain: "final", stage: "endgame" },
  { id: "creationMatrix", icon: "🧩", name: "Матрица творения", description: "Шаблон сборки новых миров", chain: "final", stage: "endgame" },
  { id: "omegaCore", icon: "🔱", name: "Омега-ядро", description: "Предельный узел завершения цикла", chain: "final", stage: "endgame" }
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
  });
};

validateAlchemyEmojiPalette();
