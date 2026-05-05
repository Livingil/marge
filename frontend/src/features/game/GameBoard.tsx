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
const FLASH_DURATION_MS = 1100;

type FlashTone = "merge" | "bonus" | "downgrade" | "income" | "discovery" | "neutral";

const getActionTone = (message: string | null, latestDiscovery: GridItem | null): FlashTone => {
  if (latestDiscovery) {
    return "discovery";
  }

  if (!message) {
    return "neutral";
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
              <span className="action-button-label">Синтезировать ядро</span>
              <span className="action-button-meta">Стоимость: {user.spawnCost}</span>
            </button>
            <button
              type="button"
              className="action-button action-button-secondary action-button-income"
              onClick={() => claimIncome()}
              disabled={isClaimingIncome}
            >
              <span className="action-button-label">Собрать поток</span>
              <span className="action-button-meta">Снять накопленную энергию</span>
            </button>
            <button
              type="button"
              className="action-button action-button-secondary"
              onClick={() => upgradeBase()}
              disabled={isUpgradingBase || user.gold < user.baseUpgradeCost}
            >
              <span className="action-button-label">Усилить лабораторию</span>
              <span className="action-button-meta">Стоимость: {user.baseUpgradeCost}</span>
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
