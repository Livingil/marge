import { useEffect, useMemo, useState } from "react";
import {
  GRID_COLUMNS,
  expansionModules,
  getGoalRewardInlineText,
  getOnboardingHintCopy,
} from "./gameBoard.helpers";
import type { GameBoardViewProps } from "./gameBoard.view.types";

export const GameBoardPlaySection = ({
  contextHint,
  selectedCellItem,
  isHintDismissed,
  dismissHint,
  cells,
  activeRows,
  selectedCell,
  mergeFeedback,
  dragFrom,
  isMerging,
  onDropCell,
  setDragFrom,
  handleCellClick,
  getCellTierClassName,
  user,
  targetItem,
  setIsCatalogOpen,
}: Pick<
  GameBoardViewProps,
  | "contextHint"
  | "selectedCellItem"
  | "isHintDismissed"
  | "dismissHint"
  | "cells"
  | "activeRows"
  | "selectedCell"
  | "mergeFeedback"
  | "dragFrom"
  | "isMerging"
  | "onDropCell"
  | "setDragFrom"
  | "handleCellClick"
  | "getCellTierClassName"
  | "user"
  | "targetItem"
  | "setIsCatalogOpen"
>) => {
  const availableExpansionModules = expansionModules.filter(
    (module) =>
      !(module.hideWhenReached && user.baseLevel >= module.unlockLevel),
  );
  const nextExpansionModule =
    availableExpansionModules.find(
      (module) => user.baseLevel < module.unlockLevel,
    ) ??
    availableExpansionModules[0] ??
    null;
  const discoveredCount = Array.isArray(user.discoveredItems) ? user.discoveredItems.length : 0;
  const catalogCount = Array.isArray(user.itemCatalog) ? user.itemCatalog.length : 0;
  const progressPercent = catalogCount > 0 ? Math.round((discoveredCount / catalogCount) * 100) : 0;
  const remaining = Math.max(0, catalogCount - discoveredCount);
  const goalRewardInlineText = getGoalRewardInlineText(user.currentGoal.reward);
  const onboardingHint = getOnboardingHintCopy(user.currentGoal.targetItemId, contextHint);

  return (
    <>
      <div className="play-scroll-content">
        <section className="lab-expansion-preview lab-expansion-preview-flat">
          <div className="expansion-header">
            <span className="expansion-mobile-summary">
              Следующая модернизация лаборатории:{" "}
              {nextExpansionModule
                ? `${nextExpansionModule.title} · Ур. ${nextExpansionModule.unlockLevel}`
                : "все модули открыты"}
            </span>
          </div>
        </section>
        <section className="sector-progress-card" aria-label="Прогресс сектора">
          <div className="sector-progress-head">
            <p className="sector-progress-title">Сектор 1 · Открытия</p>
            <p className="sector-progress-count">
              {discoveredCount}/{catalogCount || "—"}
            </p>
          </div>
          <div className="sector-progress-track" role="presentation">
            <span className="sector-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="sector-progress-foot">
            До стабилизации: {catalogCount > 0 ? remaining : "—"}
          </p>
        </section>

        <div className="board-shell">
          <div className="board-header">
            <div className="board-header-copy">
              <p className="board-kicker">Реакторное поле</p>
              <h2>{`Камера слияния 5x${activeRows}`}</h2>
            </div>

            <div className="board-header-actions">
              <button
                type="button"
                className="board-catalog-button"
                onClick={() => setIsCatalogOpen(true)}
                aria-label="Открыть каталог элементов"
              >
                <span className="board-catalog-button-title">📚 Каталог</span>
                <span className="board-catalog-button-progress">
                  Открыто: {user.discoveredItems.length}/{user.itemCatalog.length}
                </span>
                <span className="board-catalog-button-progress-mobile">
                  📚 {user.discoveredItems.length}/{user.itemCatalog.length}
                </span>
              </button>
            </div>
          </div>
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)` }}
          >
            {cells.map((cell, index) => (
              <div
                key={index}
                className={[
                  "cell",
                  cell.itemId ? "filled" : "empty",
                  mergeFeedback?.cellIndex === index ? "merge-feedback" : "",
                  mergeFeedback?.cellIndex === index
                    ? `merge-feedback-${mergeFeedback.tone}`
                    : "",
                  selectedCell === index ? "selected" : "",
                  dragFrom === index ? "dragging" : "",
                  getCellTierClassName(cell),
                ]
                  .filter(Boolean)
                  .join(" ")}
                data-feedback-nonce={
                  mergeFeedback?.cellIndex === index
                    ? mergeFeedback.nonce
                    : undefined
                }
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
                    {mergeFeedback?.cellIndex === index ? (
                      <span
                        className={`merge-floating-text merge-floating-text-${mergeFeedback.tone}`}
                      >
                        {mergeFeedback.message}
                      </span>
                    ) : null}
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

        <div className="mission-panel play-main-mission">
          <div className="mission-copy">
            <p className="eyebrow mission-kicker">Текущая цель</p>
            <div className="mission-mainline mission-mainline-stack">
              <div className="mission-title-row">
                <span className="mission-target-icon" aria-hidden="true">
                  {targetItem?.icon ?? "🎯"}
                </span>
                <h1 className="mission-title mission-title-strong">
                  {user.currentGoal.title}
                </h1>
              </div>
              <div className="mission-reward-group">
                <p className="mission-reward-badge">{goalRewardInlineText}</p>
              </div>
            </div>
          </div>
        </div>

        {!isHintDismissed ? (
          <div className="onboarding-grid play-main-onboarding">
            <div className="onboarding-card">
              <button
                type="button"
                className="onboarding-close"
                onClick={dismissHint}
              >
                ✕
              </button>
              <p className="eyebrow">Подсказка лаборатории</p>
              <p className="onboarding-title">{onboardingHint.title}</p>
              <p className="onboarding-text">{onboardingHint.text}</p>
              <p
                className={`onboarding-selected ${selectedCellItem ? "" : "empty"}`}
              >
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
          </div>
        ) : null}
      </div>

    </>
  );
};

export const GameBoardControlDeck = ({
  cells,
  filledCellsCount,
  user,
  isSpawning,
  isClaimingIncome,
  isUpgradingBase,
  isDeletingCell,
  canSpawn,
  canUpgradeBase,
  hasSelectedCellItem,
  canDeleteSelectedCell,
  selectedCellDeleteCost,
  claimAdBoostAction,
  claimingAdBoostType,
  spawnItemAction,
  claimIncomeAction,
  upgradeBaseAction,
  deleteCellAction,
}: Pick<
  GameBoardViewProps,
  | "cells"
  | "filledCellsCount"
  | "user"
  | "isSpawning"
  | "isClaimingIncome"
  | "isUpgradingBase"
  | "isDeletingCell"
  | "canSpawn"
  | "canUpgradeBase"
  | "hasSelectedCellItem"
  | "canDeleteSelectedCell"
  | "selectedCellDeleteCost"
  | "claimAdBoostAction"
  | "claimingAdBoostType"
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

  const isBoardFull = filledCellsCount >= cells.length;
  const spawnBoostOption = user.adBoosts.options.find(
    (option) => option.type === "rewarded_free_spawn",
  );
  const upgradeBoostOption = user.adBoosts.options.find(
    (option) => option.type === "rewarded_flow_boost",
  );
  const deleteBoostOption = user.adBoosts.options.find(
    (option) => option.type === "rewarded_free_delete",
  );
  const needsSpawnAd =
    !isBoardFull && user.goalFreeSpawns <= 0 && user.gold < user.spawnCost;
  const canUseSpawnAd = needsSpawnAd && Boolean(spawnBoostOption?.canClaim);
  const needsUpgradeAd = user.gold < user.baseUpgradeCost;
  const canUseUpgradeAd = needsUpgradeAd && Boolean(upgradeBoostOption?.canClaim);
  const needsDeleteAd =
    hasSelectedCellItem && user.goalFreeDeletes <= 0 && !canDeleteSelectedCell;
  const canUseDeleteAd = needsDeleteAd && Boolean(deleteBoostOption?.canClaim);

  return (
    <div className="control-deck">
      <button
        type="button"
        className="action-button action-button-primary"
        onClick={
          canUseSpawnAd
            ? () => claimAdBoostAction("rewarded_free_spawn")
            : spawnItemAction
        }
        disabled={canUseSpawnAd ? claimingAdBoostType === "rewarded_free_spawn" : isSpawning || isBoardFull || needsSpawnAd}
      >
        <span className="action-button-label">
          <span className="desktop-label">
            {canUseSpawnAd
              ? (claimingAdBoostType === "rewarded_free_spawn" ? "Реклама..." : "За рекламу")
              : (isSpawning ? "Синтез..." : "Синтезировать ядро")}
          </span>
          <span className="mobile-label">
            {canUseSpawnAd
              ? (claimingAdBoostType === "rewarded_free_spawn" ? "Реклама..." : "За рекламу")
              : (isSpawning ? "Синтез..." : "Синтезировать ядро")}
          </span>
        </span>
        <span className="action-button-meta">
          {canUseSpawnAd
            ? "Не хватает энергии"
            : isBoardFull
            ? "Нет свободных ячеек"
            : user.goalFreeSpawns > 0
              ? `Бесплатно: ${user.goalFreeSpawns}`
              : canSpawn
                ? `Стоимость: ${user.spawnCost}`
                : `Нужно энергии: ${user.spawnCost}`}
        </span>
      </button>
      <button
        type="button"
        className="action-button action-button-secondary"
        onClick={
          canUseUpgradeAd
            ? () => claimAdBoostAction("rewarded_flow_boost")
            : upgradeBaseAction
        }
        disabled={canUseUpgradeAd ? claimingAdBoostType === "rewarded_flow_boost" : isUpgradingBase || needsUpgradeAd}
      >
        <span className="action-button-label">
          <span className="desktop-label">
            {canUseUpgradeAd
              ? (claimingAdBoostType === "rewarded_flow_boost" ? "Реклама..." : "За рекламу")
              : (isUpgradingBase ? "Усиление..." : "Усилить лабораторию")}
          </span>
          <span className="mobile-label">
            {canUseUpgradeAd
              ? (claimingAdBoostType === "rewarded_flow_boost" ? "Реклама..." : "За рекламу")
              : (isUpgradingBase ? "Усиление..." : "Усилить")}
          </span>
        </span>
        <span className="action-button-meta">
          {canUseUpgradeAd
            ? "Не хватает энергии"
            : canUpgradeBase
            ? `Стоимость: ${user.baseUpgradeCost}`
            : `Нужно энергии: ${user.baseUpgradeCost}`}
        </span>
      </button>
      <button
        type="button"
        className="action-button action-button-secondary action-button-income"
        onClick={claimIncomeAction}
        disabled={isClaimingIncome}
      >
        <span className="action-button-label">
          <span className="desktop-label">
            {isClaimingIncome ? "Сбор..." : "Собрать поток"}
          </span>
          <span className="mobile-label">
            {isClaimingIncome ? "Сбор..." : "Собрать"}
          </span>
        </span>
        <span className="action-button-meta">
          К сбору: {liveClaimableIncome}
        </span>
      </button>
      <button
        type="button"
        className="action-button action-button-tertiary action-button-delete"
        onClick={
          canUseDeleteAd
            ? () => claimAdBoostAction("rewarded_free_delete")
            : deleteCellAction
        }
        disabled={
          canUseDeleteAd
            ? claimingAdBoostType === "rewarded_free_delete"
            : isDeletingCell ||
              !hasSelectedCellItem ||
              (user.goalFreeDeletes <= 0 && !canDeleteSelectedCell)
        }
      >
        <span className="action-button-label">
          {canUseDeleteAd
            ? (claimingAdBoostType === "rewarded_free_delete" ? "Реклама..." : "За рекламу")
            : isDeletingCell
              ? "Утилизация..."
              : hasSelectedCellItem
                ? "Утилизировать"
                : "Выбери образец"}
        </span>
        <span className="action-button-meta">
          {canUseDeleteAd
            ? "Не хватает энергии"
            : hasSelectedCellItem && user.goalFreeDeletes > 0
            ? `Бесплатно: ${user.goalFreeDeletes}`
            : selectedCellDeleteCost !== null
              ? `Стоимость: ${selectedCellDeleteCost}`
              : "Платная утилизация"}
        </span>
      </button>
    </div>
  );
};
