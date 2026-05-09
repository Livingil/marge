import { GameBoardOverlays } from "./GameBoardOverlays";
import { GameBoardPlaySection } from "./GameBoardPlaySection";
import { GameBoardSidePanel } from "./GameBoardSidePanel";
import { GameBoardTopSection } from "./GameBoardTopSection";
import { getGoalRewardInlineText, getOnboardingHintCopy } from "./gameBoard.helpers";
import type { GameBoardViewProps } from "./gameBoard.view.types";

export const GameBoardView = (props: GameBoardViewProps) => {
  const goalRewardInlineText = getGoalRewardInlineText(props.user.currentGoal.reward);
  const onboardingHint = getOnboardingHintCopy(props.user.currentGoal.targetItemId, props.contextHint);

  return (
    <section className={`lab-screen flash-${props.flashTone}`}>
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
          <span className="resource-icon">✨</span>
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
                  props.setCatalogTab("items");
                  props.setIsCatalogOpen(true);
                  props.setIsUtilityMenuOpen(false);
                }}
              >
                Каталог {props.user.discoveredItems.length}/{props.user.itemCatalog.length}
              </button>
              <button
                type="button"
                className="utility-menu-item"
                onClick={() => {
                  props.setIsHelpOpen(true);
                  props.setIsUtilityMenuOpen(false);
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
          <GameBoardTopSection {...props} />
          <GameBoardPlaySection {...props} />
        </div>

        <div className="lab-right-column">
          <GameBoardSidePanel
            user={props.user}
            setIsCatalogOpen={props.setIsCatalogOpen}
          />
          <div className="mission-panel desktop-only right-mission-panel">
            <div className="mission-copy">
              <p className="eyebrow mission-kicker">Текущая цель</p>
              <div className="mission-mainline mission-mainline-stack">
                <div className="mission-title-row">
                  <span className="mission-target-icon" aria-hidden="true">
                    {props.targetItem?.icon ?? "🎯"}
                  </span>
                  <h1 className="mission-title mission-title-strong">
                    {props.user.currentGoal.title}
                  </h1>
                </div>
                <div className="mission-reward-group">
                  <p className="mission-reward-badge">{goalRewardInlineText}</p>
                </div>
              </div>
            </div>
          </div>
          {!props.isHintDismissed ? (
            <div className="onboarding-grid desktop-only right-onboarding-grid">
              <div className="onboarding-card">
                <button
                  type="button"
                  className="onboarding-close"
                  onClick={props.dismissHint}
                >
                  ✕
                </button>
                <p className="eyebrow">Подсказка лаборатории</p>
                <p className="onboarding-title">
                  {onboardingHint.title}
                </p>
                <p className="onboarding-text">{onboardingHint.text}</p>
                <p
                  className={`onboarding-selected ${props.selectedCellItem ? "" : "empty"}`}
                >
                  {props.selectedCellItem ? (
                    <>
                      Выбран символ: {props.selectedCellItem.icon} {props.selectedCellItem.name}
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
      </div>

      <GameBoardOverlays
        isGuideDismissed={props.isGuideDismissed}
        dismissGuide={props.dismissGuide}
        isHelpOpen={props.isHelpOpen}
        setIsHelpOpen={props.setIsHelpOpen}
        contextHint={props.contextHint}
        selectedCellItem={props.selectedCellItem}
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
      />
    </section>
  );
};
