import { useMemo, useState } from "react";
import {
  useClaimIncomeMutation,
  useGetUserQuery,
  useMergeCellsMutation,
  useSpawnItemMutation,
  useUpgradeBaseMutation
} from "../../shared/api/gameApi";

const GRID_SIZE = 5;

export const GameBoard = () => {
  const { data: user, isLoading, isError } = useGetUserQuery();
  const [mergeCells, { isLoading: isMerging }] = useMergeCellsMutation();
  const [spawnItem, { isLoading: isSpawning }] = useSpawnItemMutation();
  const [claimIncome, { isLoading: isClaimingIncome }] = useClaimIncomeMutation();
  const [upgradeBase, { isLoading: isUpgradingBase }] = useUpgradeBaseMutation();
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);

  const cells = useMemo(() => user?.grid.cells ?? [], [user]);

  const targetItem = useMemo(() => {
    if (!user) {
      return null;
    }

    return user.itemCatalog.find((item) => item.id === user.currentGoal.targetItemId) ?? null;
  }, [user]);

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
    <section>
      <div className="top-bar">
        <p>
          <span className="label-full">✨ Энергия:</span>
          <span className="label-compact">✨</span>
          <span>{user.gold}</span>
        </p>
        <p>
          <span className="label-full">🏛️ Лаборатория ур.:</span>
          <span className="label-compact">🏛️</span>
          <span>{user.baseLevel}</span>
        </p>
        <p>
          <span className="label-full">⚙️ Производство/мин:</span>
          <span className="label-compact">⚙️</span>
          <span>{user.incomePerMinute}</span>
          <span className="label-compact">/мин</span>
        </p>
      </div>

      {user.latestDiscovery ? (
        <div className="discovery-box">
          🎉 Новое открытие: {user.latestDiscovery.icon} {user.latestDiscovery.name}
        </div>
      ) : null}

      <div className="hero-goal-card">
        <div className="hero-goal-emoji">{targetItem?.icon ?? "☢️"}</div>
        <div>
          <p className="hero-goal-title">{user.currentGoal.title}</p>
          <p className="hero-goal-subtitle">Соединяй символы энергии</p>
          <p className="hero-goal-reward">Награда: {user.currentGoal.rewardText}</p>
        </div>
      </div>

      {user.lastActionMessage ? <div className="action-message">{user.lastActionMessage}</div> : null}

      <div className="grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
        {cells.map((cell, index) => (
          <div
            key={index}
            className={`cell ${cell.itemId ? "filled" : "empty"} ${selectedCell === index ? "selected" : ""}`}
            draggable={Boolean(cell.itemId) && !isMerging}
            onDragStart={() => setDragFrom(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => void onDropCell(index)}
            onClick={() => void handleCellClick(index)}
          >
            {cell.item ? (
              <>
                <div className="cell-icon">{cell.item.icon}</div>
                <div className="cell-name">{cell.item.name}</div>
              </>
            ) : (
              <div className="cell-placeholder">Пусто</div>
            )}
          </div>
        ))}
      </div>

      <div className="actions">
        <button
          type="button"
          onClick={() => spawnItem()}
          disabled={isSpawning || user.gold < user.spawnCost}
        >
          ✨ Создать символ ({user.spawnCost})
        </button>
        <button type="button" onClick={() => claimIncome()} disabled={isClaimingIncome}>
          💰 Собрать энергию
        </button>
        <button
          type="button"
          onClick={() => upgradeBase()}
          disabled={isUpgradingBase || user.gold < user.baseUpgradeCost}
        >
          🏛️ Улучшить лабораторию ({user.baseUpgradeCost})
        </button>
      </div>

      <div className="collection-box">
        <div className="collection-header">
          <p>📖 Коллекция: {user.discoveredItems.length} / {user.itemCatalog.length}</p>
          <button
            type="button"
            className="collection-toggle"
            onClick={() => setIsCollectionOpen((value) => !value)}
          >
            {isCollectionOpen ? "Скрыть" : "Показать"}
          </button>
        </div>

        {isCollectionOpen ? (
          <div className="collection-grid">
            {user.itemCatalog.map((item) => {
              const discovered = user.discoveredItems.includes(item.id);

              return (
                <div key={item.id} className={`collection-card ${discovered ? "open" : "closed"}`}>
                  {discovered ? (
                    <>
                      <div className="collection-icon">{item.icon}</div>
                      <div className="collection-name">{item.name}</div>
                    </>
                  ) : (
                    <>
                      <div className="collection-icon">❔</div>
                      <div className="collection-name">Не открыто</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
};
