import { useEffect, useMemo, useState } from "react";
import { GRID_COLUMNS, expansionModules } from "./gameBoard.helpers";
import type { GameBoardViewProps } from "./gameBoard.view.types";

export const GameBoardPlaySection = ({
  contextHint,
  selectedCellItem,
  isHintDismissed,
  dismissHint,
  cells,
  activeRows,
  filledCellsCount,
  selectedCell,
  dragFrom,
  isMerging,
  onDropCell,
  setDragFrom,
  handleCellClick,
  getCellTierClassName,
  user,
  targetItem,
  isSpawning,
  isClaimingIncome,
  isUpgradingBase,
  isDeletingCell,
  canSpawn,
  canUpgradeBase,
  hasSelectedCellItem,
  canDeleteSelectedCell,
  selectedCellDeleteCost,
  spawnItemAction,
  claimIncomeAction,
  upgradeBaseAction,
  deleteCellAction
}: Pick<GameBoardViewProps,
  | "contextHint"
  | "selectedCellItem"
  | "isHintDismissed"
  | "dismissHint"
  | "cells"
  | "activeRows"
  | "filledCellsCount"
  | "selectedCell"
  | "dragFrom"
  | "isMerging"
  | "onDropCell"
  | "setDragFrom"
  | "handleCellClick"
  | "getCellTierClassName"
  | "user"
  | "targetItem"
  | "isSpawning"
  | "isClaimingIncome"
  | "isUpgradingBase"
  | "isDeletingCell"
  | "canSpawn"
  | "canUpgradeBase"
  | "hasSelectedCellItem"
  | "canDeleteSelectedCell"
  | "selectedCellDeleteCost"
  | "spawnItemAction"
  | "claimIncomeAction"
  | "upgradeBaseAction"
  | "deleteCellAction"
>) => {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  const liveClaimableIncome = useMemo(() => {
    const lastClaimMs = Date.parse(user.lastIncomeClaimAt);
    if (!Number.isFinite(lastClaimMs)) {
      return user.claimableIncome;
    }

    const elapsedSecondsRaw = Math.floor((nowMs - lastClaimMs) / 1000);
    const elapsedSeconds = Math.max(0, Math.min(elapsedSecondsRaw, 2 * 60 * 60));
    const incomePerSecond = user.incomePerMinute / 60;
    const computed = Math.floor(incomePerSecond * elapsedSeconds);
    return Math.max(user.claimableIncome, computed);
  }, [nowMs, user.claimableIncome, user.incomePerMinute, user.lastIncomeClaimAt]);
  const availableExpansionModules = expansionModules.filter(
    (module) => !(module.hideWhenReached && user.baseLevel >= module.unlockLevel)
  );
  const nextExpansionModule =
    availableExpansionModules.find((module) => user.baseLevel < module.unlockLevel) ??
    availableExpansionModules[0] ??
    null;
  const goalRewardExtras = [
    user.currentGoal.reward.freeSpawns > 0 ? `+${user.currentGoal.reward.freeSpawns} синтез` : null,
    user.currentGoal.reward.freeDeletes > 0 ? `+${user.currentGoal.reward.freeDeletes} утилизация` : null
  ].filter(Boolean);
  const goalHintOverrides: Record<string, string> = {
    battery: "Соедини две ⚡ Искры, чтобы открыть 🔋 Батарею.",
    charge: "Соедини ⚡ Искру и 💧 Воду, чтобы открыть 🔌 Заряд.",
    energyCell: "Попробуй соединить две 🔋 Батареи или 🔋 Батарею с 🔌 Зарядом."
  };
  const onboardingHintText =
    goalHintOverrides[user.currentGoal.targetItemId] ??
    "Ищи новые сочетания элементов, чтобы открыть текущую цель.";
  const onboardingHintTitle =
    user.currentGoal.targetItemId in goalHintOverrides ? "Подсказка по цели" : contextHint.title;

  return (
    <>
      <section className="lab-expansion-preview lab-expansion-preview-flat">
        <div className="expansion-header">
          <span>Следующая модернизация</span>
        </div>
        <div className="expansion-modules expansion-modules-single">
          {nextExpansionModule ? (
            <article
              key={nextExpansionModule.id}
              className={`expansion-module ${user.baseLevel >= nextExpansionModule.unlockLevel ? "ready" : "locked"}`}
            >
              <p className="expansion-module-title">{nextExpansionModule.title}</p>
              <p className="expansion-module-unlock">
                {user.baseLevel >= nextExpansionModule.unlockLevel
                  ? "Запланировано"
                  : `🔒 Ур. ${nextExpansionModule.unlockLevel}`}
              </p>
              <p className="expansion-module-description">{nextExpansionModule.description}</p>
            </article>
          ) : (
            <article className="expansion-module ready">
              <p className="expansion-module-title">Все модули открыты</p>
              <p className="expansion-module-unlock">Лаборатория стабилизирована</p>
              <p className="expansion-module-description">
                Базовая программа расширения завершена.
              </p>
            </article>
          )}
        </div>
      </section>

      <div className="board-shell">
        <div className="board-header">
          <div>
            <p className="board-kicker">Реакторное поле</p>
            <h2>{`Камера слияния 5x${activeRows}`}</h2>
          </div>
          <p className="board-hint">Перетащи один символ на другой или выбери две клетки по очереди.</p>
        </div>
        {filledCellsCount === 0 ? (
          <p className="board-empty-state">Поле пустое. Синтезируй первое ядро.</p>
        ) : null}
        <div className="grid" style={{ gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)` }}>
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

      <div className="mission-panel">
        <div className="mission-copy">
          <p className="eyebrow mission-kicker">Текущая цель</p>
          <div className="mission-mainline mission-mainline-stack">
            <div className="mission-title-row">
              <span className="mission-target-icon">{targetItem?.icon ?? "☢️"}</span>
              <h1 className="mission-title mission-title-strong">{user.currentGoal.title}</h1>
            </div>
            <div className="mission-reward-group">
              <p className="mission-reward-badge">Награда: +{user.currentGoal.reward.energy} энергии</p>
              {goalRewardExtras.length > 0 ? (
                <p className="mission-reward-line">{goalRewardExtras.join(" · ")}</p>
              ) : null}
            </div>
            <div className="target-core target-core-inline">
              <div className="target-core-icon-shell mission-target-core">
                <div className="target-core-icon">{targetItem?.icon ?? "☢️"}</div>
                <div className="target-core-ring mission-target-core-ring" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isHintDismissed ? (
        <div className="onboarding-grid">
          {!isHintDismissed ? (
            <div className="onboarding-card">
              <button type="button" className="onboarding-close" onClick={dismissHint}>
                ✕
              </button>
              <p className="eyebrow">Подсказка лаборатории</p>
              <p className="onboarding-title">{onboardingHintTitle}</p>
              <p className="onboarding-text">{onboardingHintText}</p>
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
        </div>
      ) : null}

      <div className="control-deck">
        <button
          type="button"
          className="action-button action-button-primary"
          onClick={spawnItemAction}
          disabled={isSpawning || (user.goalFreeSpawns <= 0 && user.gold < user.spawnCost)}
        >
          <span className="action-button-label">
            <span className="desktop-label">{isSpawning ? "Синтез..." : "Синтезировать ядро"}</span>
            <span className="mobile-label">{isSpawning ? "Синтез..." : "Синтезировать ядро"}</span>
          </span>
          <span className="action-button-meta">
            {user.goalFreeSpawns > 0
              ? `Бесплатно: ${user.goalFreeSpawns}`
              : canSpawn
                ? `Стоимость: ${user.spawnCost}`
                : `Нужно энергии: ${user.spawnCost}`}
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
          <span className="action-button-meta">К сбору: {liveClaimableIncome}</span>
        </button>
        <button
          type="button"
          className="action-button action-button-tertiary action-button-delete"
          onClick={deleteCellAction}
          disabled={isDeletingCell || !hasSelectedCellItem || (user.goalFreeDeletes <= 0 && !canDeleteSelectedCell)}
        >
          <span className="action-button-label">
            {isDeletingCell ? "Утилизация..." : hasSelectedCellItem ? "Утилизировать" : "Выбери образец"}
          </span>
          <span className="action-button-meta">
            {hasSelectedCellItem && user.goalFreeDeletes > 0
              ? `Бесплатно: ${user.goalFreeDeletes}`
              : selectedCellDeleteCost !== null
                ? `Стоимость: ${selectedCellDeleteCost}`
                : "Платная утилизация"}
          </span>
        </button>
      </div>
    </>
  );
};


