import { GRID_SIZE, expansionModules } from "./gameBoard.helpers";
import type { GameBoardViewProps } from "./gameBoard.view.types";

export const GameBoardPlaySection = ({
  cells,
  filledCellsCount,
  selectedCell,
  dragFrom,
  isMerging,
  onDropCell,
  setDragFrom,
  handleCellClick,
  getCellTierClassName,
  user,
  isSpawning,
  isClaimingIncome,
  isUpgradingBase,
  canSpawn,
  canUpgradeBase,
  spawnItemAction,
  claimIncomeAction,
  upgradeBaseAction
}: Pick<GameBoardViewProps,
  | "cells"
  | "filledCellsCount"
  | "selectedCell"
  | "dragFrom"
  | "isMerging"
  | "onDropCell"
  | "setDragFrom"
  | "handleCellClick"
  | "getCellTierClassName"
  | "user"
  | "isSpawning"
  | "isClaimingIncome"
  | "isUpgradingBase"
  | "canSpawn"
  | "canUpgradeBase"
  | "spawnItemAction"
  | "claimIncomeAction"
  | "upgradeBaseAction"
>) => {
  return (
    <>
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

      <section className="lab-expansion-preview">
        <div className="expansion-header">
          <span>Расширение лаборатории</span>
          <span>На вырост</span>
        </div>
        <div className="expansion-modules">
          {expansionModules.map((module) => {
            const isReady = user.baseLevel >= module.unlockLevel;

            return (
              <article
                key={module.id}
                className={`expansion-module ${isReady ? "ready" : "locked"}`}
              >
                <p className="expansion-module-title">{module.title}</p>
                <p className="expansion-module-unlock">
                  {isReady ? "Готово к активации" : `🔒 Откроется на Ур. ${module.unlockLevel}`}
                </p>
                <p className="expansion-module-description">{module.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <div className="control-deck">
        <button
          type="button"
          className="action-button action-button-primary"
          onClick={spawnItemAction}
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
          onClick={upgradeBaseAction}
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
          onClick={claimIncomeAction}
          disabled={isClaimingIncome}
        >
          <span className="action-button-label">
            <span className="desktop-label">{isClaimingIncome ? "Сбор..." : "Собрать поток"}</span>
            <span className="mobile-label">{isClaimingIncome ? "Сбор..." : "Собрать"}</span>
          </span>
          <span className="action-button-meta">Снять накопленную энергию</span>
        </button>
      </div>
    </>
  );
};
