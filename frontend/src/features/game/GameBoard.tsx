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
        <p>Gold: {user.gold}</p>
        <p>Base level: {user.baseLevel}</p>
        <p>Доход/мин: {user.incomePerMinute}</p>
      </div>

      <div className="goal-box">
        <p>Цель: {user.goal.title}</p>
        <p>Награда: {user.goal.rewardGold} gold</p>
      </div>

      <div className="actions">
        <button
          type="button"
          onClick={() => spawnItem()}
          disabled={isSpawning || user.gold < user.spawnCost}
        >
          Получить предмет ({user.spawnCost})
        </button>
        <button type="button" onClick={() => claimIncome()} disabled={isClaimingIncome}>
          Собрать доход
        </button>
        <button
          type="button"
          onClick={() => upgradeBase()}
          disabled={isUpgradingBase || user.gold < user.baseUpgradeCost}
        >
          Улучшить базу ({user.baseUpgradeCost})
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
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
};
