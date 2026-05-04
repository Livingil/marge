import { useMemo, useState } from "react";
import {
  useClaimIncomeMutation,
  useGetUserQuery,
  useMergeCellsMutation,
  useSpawnItemMutation,
  useUpgradeBaseMutation
} from "../../shared/api/gameApi";

const GRID_SIZE = 5;
const TOTAL_ITEMS = 5;

export const GameBoard = () => {
  const { data: user, isLoading, isError } = useGetUserQuery();
  const [mergeCells, { isLoading: isMerging }] = useMergeCellsMutation();
  const [spawnItem, { isLoading: isSpawning }] = useSpawnItemMutation();
  const [claimIncome, { isLoading: isClaimingIncome }] = useClaimIncomeMutation();
  const [upgradeBase, { isLoading: isUpgradingBase }] = useUpgradeBaseMutation();
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  const cells = useMemo(() => user?.grid.cells ?? [], [user]);

  const onDropCell = async (toIndex: number) => {
    if (dragFrom === null || dragFrom === toIndex) {
      setDragFrom(null);
      return;
    }

    try {
      await mergeCells({ cellA: dragFrom, cellB: toIndex }).unwrap();
    } finally {
      setDragFrom(null);
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
        <p>✨ Энергия: {user.gold}</p>
        <p>🏛️ Лаборатория ур.: {user.baseLevel}</p>
        <p>⚙️ Производство/мин: {user.incomePerMinute}</p>
      </div>

      {user.latestDiscovery ? (
        <div className="discovery-box">
          🎉 Новое открытие: {user.latestDiscovery.icon} {user.latestDiscovery.name}
        </div>
      ) : null}

      <div className="goal-box">
        <p>Текущая цель:</p>
        <p>{user.currentGoal.title}</p>
        <p>Награда:</p>
        <p>{user.currentGoal.rewardText}</p>
      </div>

      <div className="collection-box">
        <p>Коллекция: {user.discoveredItems.length} / {TOTAL_ITEMS}</p>
        <div className="collection-grid">
          {user.itemCatalog.map((item) => {
            const discovered = user.discoveredItems.includes(item.level);

            return (
              <div key={item.level} className={`collection-card ${discovered ? "open" : "closed"}`}>
                {discovered ? (
                  <>
                    <div className="collection-icon">{item.icon}</div>
                    <div className="collection-name">{item.name}</div>
                    <div className="collection-level">Ур. {item.level}</div>
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

      <div className="grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
        {cells.map((cell, index) => (
          <div
            key={index}
            className={`cell ${cell.itemLevel > 0 ? "filled" : "empty"}`}
            draggable={cell.itemLevel > 0 && !isMerging}
            onDragStart={() => setDragFrom(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => void onDropCell(index)}
          >
            {cell.item ? (
              <>
                <div className="cell-icon">{cell.item.icon}</div>
                <div className="cell-name">{cell.item.name}</div>
                <div className="cell-level">Ур. {cell.item.level}</div>
              </>
            ) : (
              <div className="cell-placeholder">Пусто</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
