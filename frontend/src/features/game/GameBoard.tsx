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
      </header>

      <div className="lab-layout">
        <div className="lab-main">
          <div className="mission-panel">
            <div className="mission-copy">
              <p className="eyebrow">Сектор синтеза</p>
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

          <div className="onboarding-grid">
            <div className="onboarding-card">
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
            </div>
            <div className="onboarding-card">
              <p className="eyebrow">Как играть</p>
              <ol className="onboarding-steps">
                <li>Синтезируй ядро</li>
                <li>Соедини два символа</li>
                <li>Открой новый образец</li>
                <li>Собери поток энергии</li>
              </ol>
            </div>
          </div>

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
            {isMerging ? <p className="board-merge-state">Реакция...</p> : null}

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
                      <span>Пусто</span>
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
              <span className="action-button-label">{isSpawning ? "Синтез..." : "Синтезировать ядро"}</span>
              <span className="action-button-meta">
                {canSpawn ? `Стоимость: ${user.spawnCost}` : `Нужно энергии: ${user.spawnCost}`}
              </span>
            </button>
            <button
              type="button"
              className="action-button action-button-secondary action-button-income"
              onClick={() => claimIncome()}
              disabled={isClaimingIncome}
            >
              <span className="action-button-label">{isClaimingIncome ? "Сбор..." : "Собрать поток"}</span>
              <span className="action-button-meta">Снять накопленную энергию</span>
            </button>
            <button
              type="button"
              className="action-button action-button-secondary"
              onClick={() => upgradeBase()}
              disabled={isUpgradingBase || user.gold < user.baseUpgradeCost}
            >
              <span className="action-button-label">{isUpgradingBase ? "Усиление..." : "Усилить лабораторию"}</span>
              <span className="action-button-meta">
                {canUpgradeBase ? `Стоимость: ${user.baseUpgradeCost}` : `Нужно энергии: ${user.baseUpgradeCost}`}
              </span>
            </button>
          </div>
        </div>

        <aside className="lab-sidepanel">
          <div className="meta-card goal-card">
            <p className="meta-kicker">Цель смены</p>
            <h3>{targetItem?.name ?? "Неизвестный образец"}</h3>
            <p className="meta-text">
              {targetItem?.description ?? "Следующий этап исследования пока не определён."}
            </p>
            <p className="goal-reward">Награда: {user.currentGoal.rewardText}</p>
          </div>

          <div className="meta-card progress-card">
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

          <div className="meta-card reactions-card">
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
    </section>
  );
};
