import { useEffect, useMemo, useState } from "react";
import {
  type GridCell,
  type GridItem,
  useClaimIncomeMutation,
  useGetUserQuery,
  useMergeCellsMutation,
  useSpawnItemMutation,
  useUpgradeBaseMutation
} from "../../shared/api/gameApi";

const GRID_SIZE = 5;
const FLASH_DURATION_MS = 900;
const ONBOARDING_HINT_DISMISSED_KEY = "marge_onboarding_hint_dismissed";
const ONBOARDING_GUIDE_DISMISSED_KEY = "marge_onboarding_guide_dismissed";
const readDismissedFlag = (key: string): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  return window.localStorage.getItem(key) === "1";
};

type FlashTone =
  | "merge"
  | "bonus"
  | "downgrade"
  | "income"
  | "discovery"
  | "failed"
  | "upgrade"
  | "spawn"
  | "neutral";
type ContextHint = {
  title: string;
  text: string;
};
type CatalogTab = "items" | "reactions";
type TierFilter = "all" | "1" | "2" | "3" | "4" | "5";
type ChainFilter = "all" | "Энергия" | "Жизнь" | "Технологии" | "Магия" | "Пространство" | "Техно-магия" | "Прочее";

const getActionTone = (message: string | null, latestDiscovery: GridItem | null): FlashTone => {
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

export const GameBoard = () => {
  const { data: user, isLoading, isError } = useGetUserQuery();
  const [mergeCells, { isLoading: isMerging }] = useMergeCellsMutation();
  const [spawnItem, { isLoading: isSpawning }] = useSpawnItemMutation();
  const [claimIncome, { isLoading: isClaimingIncome }] = useClaimIncomeMutation();
  const [upgradeBase, { isLoading: isUpgradingBase }] = useUpgradeBaseMutation();
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [flashTone, setFlashTone] = useState<FlashTone>("neutral");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isUtilityMenuOpen, setIsUtilityMenuOpen] = useState(false);
  const [catalogTab, setCatalogTab] = useState<CatalogTab>("items");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [chainFilter, setChainFilter] = useState<ChainFilter>("all");
  const [isHintDismissed, setIsHintDismissed] = useState(() => readDismissedFlag(ONBOARDING_HINT_DISMISSED_KEY));
  const [isGuideDismissed, setIsGuideDismissed] = useState(() => readDismissedFlag(ONBOARDING_GUIDE_DISMISSED_KEY));

  const cells = useMemo(() => user?.grid.cells ?? [], [user]);

  const targetItem = useMemo(() => {
    if (!user) {
      return null;
    }

    return user.itemCatalog.find((item) => item.id === user.currentGoal.targetItemId) ?? null;
  }, [user]);

  const discoveredProgress = useMemo(() => {
    if (!user || user.itemCatalog.length === 0) {
      return 0;
    }

    return Math.round((user.discoveredItems.length / user.itemCatalog.length) * 100);
  }, [user]);

  const filledCellsCount = useMemo(() => cells.filter((cell) => Boolean(cell.itemId)).length, [cells]);
  const emptyCellsCount = GRID_SIZE * GRID_SIZE - filledCellsCount;
  const hasSelectedCell = selectedCell !== null;
  const discoveredCount = user?.discoveredItems.length ?? 0;
  const hasAnyDiscoveredItems = discoveredCount > 0;
  const canSpawn = user ? user.gold >= user.spawnCost : false;
  const canUpgradeBase = user ? user.gold >= user.baseUpgradeCost : false;

  const selectedCellItem = useMemo(() => {
    if (selectedCell === null) {
      return null;
    }
    return cells[selectedCell]?.item ?? null;
  }, [cells, selectedCell]);

  const getItemChain = (itemId: string): string => {
    const energy = new Set(["spark", "battery", "energyCell", "magnet", "reactor", "lightning", "plasma", "powerCore", "quantumCore"]);
    const life = new Set(["water", "seed", "plant", "algae", "tree", "life", "organism", "beast", "mind"]);
    const tech = new Set(["stone", "metal", "mechanism", "wire", "circuit", "machine", "robot", "drone", "android", "factory"]);
    const magic = new Set(["crystal", "mana", "soul", "golem", "spirit", "spell"]);
    const space = new Set(["portal", "gate", "dimension", "meteor", "star", "world", "universe", "void"]);
    const finalChain = new Set(["artificialSoul", "livingMachine", "worldEngine", "genesisCore"]);

    if (energy.has(itemId)) {
      return "Энергия";
    }
    if (life.has(itemId)) {
      return "Жизнь";
    }
    if (tech.has(itemId)) {
      return "Технологии";
    }
    if (magic.has(itemId)) {
      return "Магия";
    }
    if (space.has(itemId)) {
      return "Пространство";
    }
    if (finalChain.has(itemId)) {
      return "Техно-магия";
    }

    return "Прочее";
  };

  const filteredCatalogItems = useMemo(() => {
    const filtered = user?.itemCatalog.filter((item) => {
      if (tierFilter !== "all" && String(item.tier) !== tierFilter) {
        return false;
      }
      const itemChain = getItemChain(item.id);
      if (chainFilter !== "all" && itemChain !== chainFilter) {
        return false;
      }
      return true;
    }) ?? [];

    return [...filtered].sort((a, b) => {
      if (a.tier !== b.tier) {
        return a.tier - b.tier;
      }
      return a.name.localeCompare(b.name, "ru");
    });
  }, [chainFilter, tierFilter, user]);

  const getContextHint = (): ContextHint => {
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

  const contextHint = getContextHint();

  const dismissHint = () => {
    setIsHintDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_HINT_DISMISSED_KEY, "1");
    }
  };

  const dismissGuide = () => {
    setIsGuideDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_GUIDE_DISMISSED_KEY, "1");
    }
  };

  useEffect(() => {
    if (!user?.lastActionMessage && !user?.latestDiscovery) {
      return;
    }

    setFlashTone(getActionTone(user.lastActionMessage, user.latestDiscovery));

    const timeoutId = window.setTimeout(() => {
      setFlashTone("neutral");
    }, FLASH_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [user?.lastActionMessage, user?.latestDiscovery]);

  useEffect(() => {
    if (isHelpOpen || isCatalogOpen) {
      setIsUtilityMenuOpen(false);
    }
  }, [isCatalogOpen, isHelpOpen]);

  const getCellTierClassName = (cell: GridCell): string => {
    if (!cell.item) {
      return "tier-empty";
    }

    return `tier-${cell.item.tier}`;
  };

  const onDropCell = async (toIndex: number) => {
    if (dragFrom === null || dragFrom === toIndex) {
      setDragFrom(null);
      return;
    }

    try {
      await mergeCells({ cellA: dragFrom, cellB: toIndex }).unwrap();
    } finally {
      setDragFrom(null);
      setSelectedCell(null);
    }
  };

  const handleCellClick = async (index: number) => {
    const cell = cells[index];

    if (!cell || !cell.itemId || isMerging) {
      return;
    }

    if (selectedCell === null) {
      setSelectedCell(index);
      return;
    }

    if (selectedCell === index) {
      setSelectedCell(null);
      return;
    }

    try {
      await mergeCells({ cellA: selectedCell, cellB: index }).unwrap();
    } finally {
      setSelectedCell(null);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isError || !user) {
    return <p>Failed to load user.</p>;
  }

  return (
    <section className={`lab-screen flash-${flashTone}`}>
      <div className="lab-chrome" />

      <header className="resource-bar">
        <div className="resource-pill resource-pill-energy">
          <span className="resource-icon">✨</span>
          <span className="resource-copy">
            <span className="resource-label">Энергия</span>
            <span className="resource-value">{user.gold}</span>
          </span>
        </div>
        <div className="resource-pill resource-pill-base">
          <span className="resource-icon">🏛️</span>
          <span className="resource-copy">
            <span className="resource-label">Лаборатория</span>
            <span className="resource-value">Ур. {user.baseLevel}</span>
          </span>
        </div>
        <div className="resource-pill resource-pill-income">
          <span className="resource-icon">⚙️</span>
          <span className="resource-copy">
            <span className="resource-label">Поток</span>
            <span className="resource-value">{user.incomePerMinute}/мин</span>
          </span>
        </div>
        <div className="resource-menu-shell mobile-only">
          <button
            type="button"
            className="utility-menu-button"
            aria-label="Открыть меню"
            onClick={() => setIsUtilityMenuOpen((value) => !value)}
          >
            ⋯
          </button>
          {isUtilityMenuOpen ? (
            <div className="utility-menu-panel">
              <button
                type="button"
                className="utility-menu-item"
                onClick={() => {
                  setCatalogTab("items");
                  setIsCatalogOpen(true);
                  setIsUtilityMenuOpen(false);
                }}
              >
                Каталог {user.discoveredItems.length}/{user.itemCatalog.length}
              </button>
              <button
                type="button"
                className="utility-menu-item"
                onClick={() => {
                  setIsHelpOpen(true);
                  setIsUtilityMenuOpen(false);
                }}
              >
                Помощь
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="lab-layout">
        <div className="lab-main">
          <div className="mission-panel">
            <div className="mission-copy">
              <div className="mission-topline">
                <p className="eyebrow">Сектор синтеза</p>
                <div className="mission-actions desktop-only">
                  <button
                    type="button"
                    className="utility-button utility-button-catalog"
                    aria-label="Открыть каталог"
                    onClick={() => {
                      setCatalogTab("items");
                      setIsCatalogOpen(true);
                    }}
                  >
                    <span className="desktop-label">Каталог {user.discoveredItems.length}/{user.itemCatalog.length}</span>
                    <span className="mobile-label">📚 {user.discoveredItems.length}/{user.itemCatalog.length}</span>
                  </button>
                  <button
                    type="button"
                    className="utility-button utility-button-icon"
                    aria-label="Открыть помощь"
                    onClick={() => setIsHelpOpen(true)}
                  >
                    ?
                  </button>
                </div>
              </div>
              <h1 className="mission-title">{user.currentGoal.title}</h1>
              <p className="mission-subtitle">
                Соединяй символы, открывай новые образцы и усиливай лабораторию.
              </p>
            </div>
            <div className="target-core">
              <div className="target-core-icon">{targetItem?.icon ?? "☢️"}</div>
              <div className="target-core-ring" />
            </div>
          </div>

          {!isHintDismissed || !isGuideDismissed ? (
            <div className="onboarding-grid">
              {!isHintDismissed ? (
                <div className="onboarding-card">
                  <button type="button" className="onboarding-close" onClick={dismissHint}>
                    ✕
                  </button>
                  <p className="eyebrow">Подсказка лаборатории</p>
                  <p className="onboarding-title">{contextHint.title}</p>
                  <p className="onboarding-text">{contextHint.text}</p>
                  <p className={`onboarding-selected ${selectedCellItem ? "" : "empty"}`}>
                    {selectedCellItem ? (
                      <>
                        Выбран символ: {selectedCellItem.icon} {selectedCellItem.name}
                        <br />
                        Теперь выбери второй символ для реакции.
                      </>
                    ) : (
                      " "
                    )}
                  </p>
                </div>
              ) : null}

              {!isGuideDismissed ? (
                <div className="onboarding-card how-to-play">
                  <button type="button" className="onboarding-close" onClick={dismissGuide}>
                    ✕
                  </button>
                  <p className="eyebrow">Как играть</p>
                  <ol className="onboarding-steps">
                    <li>Синтезируй ядро</li>
                    <li>Соедини два символа</li>
                    <li>Открой новый образец</li>
                    <li>Собери поток энергии</li>
                  </ol>
                </div>
              ) : null}
            </div>
          ) : null}

          {user.lastActionMessage ? (
            <div className={`action-banner action-${flashTone}`}>
              <span className="action-banner-label">Журнал</span>
              <span>{user.lastActionMessage}</span>
            </div>
          ) : null}

          {user.latestDiscovery ? (
            <div className="discovery-banner">
              <span className="discovery-kicker">Новое открытие</span>
              <strong>
                {user.latestDiscovery.icon} {user.latestDiscovery.name}
              </strong>
            </div>
          ) : null}

          <div className="board-shell">
            <div className="board-header">
              <div>
                <p className="board-kicker">Реакторное поле</p>
                <h2>Камера слияния 5x5</h2>
              </div>
              <p className="board-hint">Перетащи один символ на другой или выбери две клетки по очереди.</p>
            </div>
            {filledCellsCount === 0 ? (
              <p className="board-empty-state">Поле пустое. Синтезируй первое ядро.</p>
            ) : null}
            <div className="grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
              {cells.map((cell, index) => (
                <div
                  key={index}
                  className={[
                    "cell",
                    cell.itemId ? "filled" : "empty",
                    selectedCell === index ? "selected" : "",
                    dragFrom === index ? "dragging" : "",
                    getCellTierClassName(cell)
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  draggable={Boolean(cell.itemId) && !isMerging}
                  onDragStart={() => setDragFrom(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => void onDropCell(index)}
                  onClick={() => void handleCellClick(index)}
                >
                  <div className="cell-frame" />
                  {cell.item ? (
                    <>
                      <div className="cell-level-badge">T{cell.item.tier}</div>
                      <div className="cell-energy-lines" />
                      <div className="cell-icon">{cell.item.icon}</div>
                      <div className="cell-name">{cell.item.name}</div>
                      <div className="cell-level">{cell.item.description}</div>
                    </>
                  ) : (
                    <div className="cell-placeholder">
                      <span className="cell-placeholder-plus">+</span>
                      <span className="cell-placeholder-text">Пусто</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="control-deck">
            <button
              type="button"
              className="action-button action-button-primary"
              onClick={() => spawnItem()}
              disabled={isSpawning || user.gold < user.spawnCost}
            >
              <span className="action-button-label">
                <span className="desktop-label">{isSpawning ? "Синтез..." : "Синтезировать ядро"}</span>
                <span className="mobile-label">{isSpawning ? "Синтез..." : "Синтез"}</span>
              </span>
              <span className="action-button-meta">
                {canSpawn ? `Стоимость: ${user.spawnCost}` : `Нужно энергии: ${user.spawnCost}`}
              </span>
            </button>
            <button
              type="button"
              className="action-button action-button-secondary"
              onClick={() => upgradeBase()}
              disabled={isUpgradingBase || user.gold < user.baseUpgradeCost}
            >
              <span className="action-button-label">
                <span className="desktop-label">{isUpgradingBase ? "Усиление..." : "Усилить лабораторию"}</span>
                <span className="mobile-label">{isUpgradingBase ? "Усиление..." : "Усилить"}</span>
              </span>
              <span className="action-button-meta">
                {canUpgradeBase ? `Стоимость: ${user.baseUpgradeCost}` : `Нужно энергии: ${user.baseUpgradeCost}`}
              </span>
            </button>
            <button
              type="button"
              className="action-button action-button-secondary action-button-income"
              onClick={() => claimIncome()}
              disabled={isClaimingIncome}
            >
              <span className="action-button-label">
                <span className="desktop-label">{isClaimingIncome ? "Сбор..." : "Собрать поток"}</span>
                <span className="mobile-label">{isClaimingIncome ? "Сбор..." : "Собрать"}</span>
              </span>
              <span className="action-button-meta">Снять накопленную энергию</span>
            </button>
          </div>
        </div>

        <aside className="lab-sidepanel">
          <div className="meta-card progress-card desktop-only">
            <div className="progress-head">
              <div>
                <p className="meta-kicker">Каталог образцов</p>
                <h3>
                  {user.discoveredItems.length} / {user.itemCatalog.length}
                </h3>
              </div>
              <button
                type="button"
                className="collection-toggle"
                onClick={() => setIsCollectionOpen((value) => !value)}
              >
                {isCollectionOpen ? "Свернуть" : "Открыть"}
              </button>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${discoveredProgress}%` }} />
            </div>
            <p className="meta-text">Новые образцы дают прогресс каталога и открывают следующую ветку.</p>
          </div>

          <div className="meta-card reactions-card desktop-only">
            <p className="meta-kicker">Открытые реакции</p>
            {user.discoveredRecipeDetails.length === 0 ? (
              <p className="reaction-empty">Первые реакции появятся здесь после успешных слияний.</p>
            ) : (
              <div className="reaction-list">
                {user.discoveredRecipeDetails.map((reaction) => (
                  <div key={reaction.key} className="reaction-row">
                    <span className="reaction-part">
                      {reaction.left.icon} {reaction.left.name}
                    </span>
                    <span className="reaction-plus">+</span>
                    <span className="reaction-part">
                      {reaction.right.icon} {reaction.right.name}
                    </span>
                    <span className="reaction-arrow">→</span>
                    <span className="reaction-part reaction-result">
                      {reaction.result.icon} {reaction.result.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`collection-sheet ${isCollectionOpen ? "open" : ""}`}>
            <div className="collection-grid">
              {user.itemCatalog.map((item) => {
                const discovered = user.discoveredItems.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`collection-card ${discovered ? "open" : "closed"} tier-${item.tier}`}
                  >
                    <div className="collection-level-badge">T{item.tier}</div>
                    {discovered ? (
                      <>
                        <div className="collection-icon">{item.icon}</div>
                        <div className="collection-name">{item.name}</div>
                        <div className="collection-level">{item.description}</div>
                      </>
                    ) : (
                      <>
                        <div className="collection-icon">?</div>
                        <div className="collection-name">Не открыто</div>
                        <div className="collection-level">Неизвестный образец</div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {isHelpOpen ? (
        <div className="fullscreen-overlay mobile-only" role="dialog" aria-modal="true">
          <div className="fullscreen-sheet">
            <div className="fullscreen-header">
              <h3>Помощь</h3>
              <button type="button" className="fullscreen-close" onClick={() => setIsHelpOpen(false)}>
                Закрыть
              </button>
            </div>
            <div className="fullscreen-content">
              <p className="eyebrow">Подсказка лаборатории</p>
              <p className="onboarding-title">{contextHint.title}</p>
              <p className="onboarding-text">{contextHint.text}</p>
              {selectedCellItem ? (
                <p className="onboarding-selected">
                  Выбран символ: {selectedCellItem.icon} {selectedCellItem.name}
                  <br />
                  Теперь выбери второй символ для реакции.
                </p>
              ) : null}
              <p className="eyebrow">Как играть</p>
              <ol className="onboarding-steps">
                <li>Синтезируй ядро</li>
                <li>Соедини два символа</li>
                <li>Открой новый образец</li>
                <li>Собери поток энергии</li>
              </ol>
            </div>
          </div>
        </div>
      ) : null}

      {isCatalogOpen ? (
        <div className="fullscreen-overlay mobile-only" role="dialog" aria-modal="true">
          <div className="fullscreen-sheet">
            <div className="fullscreen-header">
              <h3>Каталог</h3>
              <button type="button" className="fullscreen-close" onClick={() => setIsCatalogOpen(false)}>
                Закрыть
              </button>
            </div>
            <div className="catalog-tabs">
              <button
                type="button"
                className={`catalog-tab ${catalogTab === "items" ? "active" : ""}`}
                onClick={() => {
                  setCatalogTab("items");
                }}
              >
                Образцы
              </button>
              <button
                type="button"
                className={`catalog-tab ${catalogTab === "reactions" ? "active" : ""}`}
                onClick={() => setCatalogTab("reactions")}
              >
                Реакции
              </button>
            </div>
            <div className="catalog-filter-bar">
              {catalogTab === "items" ? (
                <div className="catalog-filter-chips catalog-filter-sort">
                  <label className="catalog-sort-label" htmlFor="catalog-sort-select">
                    Тир
                  </label>
                  <select
                    id="catalog-sort-select"
                    className="catalog-sort-select"
                    value={tierFilter}
                    onChange={(event) => setTierFilter(event.target.value as TierFilter)}
                  >
                    <option value="all">Все</option>
                    <option value="1">T1</option>
                    <option value="2">T2</option>
                    <option value="3">T3</option>
                    <option value="4">T4</option>
                    <option value="5">T5</option>
                  </select>
                  <label className="catalog-sort-label" htmlFor="catalog-chain-select">
                    Цепочка
                  </label>
                  <select
                    id="catalog-chain-select"
                    className="catalog-sort-select"
                    value={chainFilter}
                    onChange={(event) => setChainFilter(event.target.value as ChainFilter)}
                  >
                    <option value="all">Все</option>
                    <option value="Энергия">Энергия</option>
                    <option value="Жизнь">Жизнь</option>
                    <option value="Технологии">Технологии</option>
                    <option value="Магия">Магия</option>
                    <option value="Пространство">Пространство</option>
                    <option value="Техно-магия">Техно-магия</option>
                    <option value="Прочее">Прочее</option>
                  </select>
                </div>
              ) : (
                <p className="catalog-hint">Рецепты показывают только найденные реакции.</p>
              )}
            </div>
            <div className="fullscreen-content">
              {catalogTab === "items" ? (
                <div className="collection-grid">
                  {filteredCatalogItems.map((item) => {
                    const discovered = user.discoveredItems.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        className={`collection-card ${discovered ? "open" : "closed"} tier-${item.tier}`}
                      >
                        <div className="collection-level-badge">T{item.tier}</div>
                        {discovered ? (
                          <>
                            <div className="collection-icon">{item.icon}</div>
                            <div className="collection-name">{item.name}</div>
                            <div className="collection-level">{item.description}</div>
                          </>
                        ) : (
                          <>
                            <div className="collection-icon">?</div>
                            <div className="collection-name">Не открыто</div>
                            <div className="collection-level">Неизвестный образец</div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : user.discoveredRecipeDetails.length === 0 ? (
                <p className="reaction-empty">Первые реакции появятся здесь после успешных слияний.</p>
              ) : (
                <div className="reaction-list">
                  {user.discoveredRecipeDetails.map((reaction) => (
                    <div key={reaction.key} className="reaction-row">
                      <span className="reaction-part">
                        {reaction.left.icon} {reaction.left.name}
                      </span>
                      <span className="reaction-plus">+</span>
                      <span className="reaction-part">
                        {reaction.right.icon} {reaction.right.name}
                      </span>
                      <span className="reaction-arrow">→</span>
                      <span className="reaction-part reaction-result">
                        {reaction.result.icon} {reaction.result.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
