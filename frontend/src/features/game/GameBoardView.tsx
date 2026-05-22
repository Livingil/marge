import { useEffect, useState } from "react";
import { GameBoardOverlays } from "./GameBoardOverlays";
import { GameBoardControlDeck, GameBoardPlaySection } from "./GameBoardPlaySection";
import { GameBoardTopSection } from "./GameBoardTopSection";
import type { GameBoardViewProps } from "./gameBoard.view.types";

const getLayoutMode = (): "portrait" | "landscape" => {
  if (typeof window === "undefined") {
    return "portrait";
  }

  return window.innerHeight >= window.innerWidth ? "portrait" : "landscape";
};

export const GameBoardView = (props: GameBoardViewProps) => {
  const isShopMenuEnabled = false;
  const isPaymentsInfoMenuEnabled = false;
  const [layoutMode, setLayoutMode] = useState<"portrait" | "landscape">(() => getLayoutMode());

  useEffect(() => {
    const handleResize = () => {
      setLayoutMode(getLayoutMode());
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return (
    <section className={`lab-screen lab-screen--${layoutMode} flash-${props.flashTone}`}>
      <div className="lab-chrome" />
      {props.goalCompletionToast ? (
        <div className="goal-completion-toast" role="status" aria-live="polite">
          <p className="goal-completion-toast-kicker">{props.goalCompletionToast.title}</p>
          <p className="goal-completion-toast-title">{props.goalCompletionToast.discoveryLine}</p>
          {props.goalCompletionToast.rewardLine ? (
            <p className="goal-completion-toast-reward">{props.goalCompletionToast.rewardLine}</p>
          ) : null}
        </div>
      ) : null}

      <header className="resource-bar">
        <div className="resource-pill resource-pill-energy">
          <span className="resource-icon">⚡</span>
          <span className="resource-copy">
            <span className="resource-label">Энергия</span>
            <span className="resource-value">{props.user.gold}</span>
          </span>
        </div>
        <div className="resource-pill resource-pill-base">
          <span className="resource-icon">🏛️</span>
          <span className="resource-copy">
            <span className="resource-label">Лаборатория</span>
            <span className="resource-value">Ур. {props.user.baseLevel}</span>
          </span>
        </div>
        <div className="resource-pill resource-pill-income">
          <span className="resource-icon">⚙️</span>
          <span className="resource-copy">
            <span className="resource-label">Поток</span>
            <span className="resource-value">{props.user.incomePerMinute}/мин</span>
          </span>
        </div>
        <div className="resource-menu-shell">
          <button
            type="button"
            className="utility-menu-button"
            aria-label="Открыть меню"
            onClick={() => props.setIsUtilityMenuOpen(!props.isUtilityMenuOpen)}
          >
            ⋯
          </button>
          {props.isUtilityMenuOpen ? (
            <div className="utility-menu-panel">
              <button
                type="button"
                className="utility-menu-item"
                onClick={() => {
                  props.setIsAuthOpen(true);
                  props.setIsUtilityMenuOpen(false);
                }}
              >
                Вход / регистрация
              </button>
              {props.user.account.isLinked ? (
                <button
                  type="button"
                  className="utility-menu-item"
                  onClick={() => {
                    props.setIsProfileOpen(true);
                    props.setIsUtilityMenuOpen(false);
                  }}
                >
                  Профиль
                </button>
              ) : null}
              <button
                type="button"
                className="utility-menu-item"
                onClick={() => {
                  props.setIsBonusesOpen(true);
                  props.setIsUtilityMenuOpen(false);
                }}
              >
                Бонусы
              </button>
              {isShopMenuEnabled ? (
                <button
                  type="button"
                  className="utility-menu-item"
                  disabled
                >
                  Магазин (в разработке)
                </button>
              ) : null}
              {isPaymentsInfoMenuEnabled ? (
                <button
                  type="button"
                  className="utility-menu-item"
                  onClick={() => {
                    props.setIsPaymentsInfoOpen(true);
                    props.setIsUtilityMenuOpen(false);
                  }}
                >
                  Оплата и документы
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      <div className="lab-layout">
        <div className="lab-main">
          <GameBoardTopSection {...props} />
          <GameBoardPlaySection {...props} />
        </div>
      </div>

      <GameBoardControlDeck
        cells={props.cells}
        filledCellsCount={props.filledCellsCount}
        user={props.user}
        isSpawning={props.isSpawning}
        isClaimingIncome={props.isClaimingIncome}
        isUpgradingBase={props.isUpgradingBase}
        isDeletingCell={props.isDeletingCell}
        canSpawn={props.canSpawn}
        canUpgradeBase={props.canUpgradeBase}
        hasSelectedCellItem={props.hasSelectedCellItem}
        canDeleteSelectedCell={props.canDeleteSelectedCell}
        selectedCellDeleteCost={props.selectedCellDeleteCost}
        claimAdBoostAction={props.claimAdBoostAction}
        claimingAdBoostType={props.claimingAdBoostType}
        spawnItemAction={props.spawnItemAction}
        claimIncomeAction={props.claimIncomeAction}
        upgradeBaseAction={props.upgradeBaseAction}
        deleteCellAction={props.deleteCellAction}
      />

      <GameBoardOverlays
        isGuideDismissed={props.isGuideDismissed}
        dismissGuide={props.dismissGuide}
        isBonusesOpen={props.isBonusesOpen}
        setIsBonusesOpen={props.setIsBonusesOpen}
        isPaymentsInfoOpen={props.isPaymentsInfoOpen}
        setIsPaymentsInfoOpen={props.setIsPaymentsInfoOpen}
        isAuthOpen={props.isAuthOpen}
        setIsAuthOpen={props.setIsAuthOpen}
        isProfileOpen={props.isProfileOpen}
        setIsProfileOpen={props.setIsProfileOpen}
        isCatalogOpen={props.isCatalogOpen}
        setIsCatalogOpen={props.setIsCatalogOpen}
        catalogTab={props.catalogTab}
        setCatalogTab={props.setCatalogTab}
        tierFilter={props.tierFilter}
        setTierFilter={props.setTierFilter}
        chainFilter={props.chainFilter}
        setChainFilter={props.setChainFilter}
        filteredCatalogItems={props.filteredCatalogItems}
        user={props.user}
        claimDailyRewardAction={props.claimDailyRewardAction}
        claimAdBoostAction={props.claimAdBoostAction}
        isClaimingDailyReward={props.isClaimingDailyReward}
        claimingAdBoostType={props.claimingAdBoostType}
        adBoostNotice={props.adBoostNotice}
        purchaseNotice={props.purchaseNotice}
      />
    </section>
  );
};
