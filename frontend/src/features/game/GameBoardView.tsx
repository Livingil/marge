import { GameBoardOverlays } from "./GameBoardOverlays";
import { GameBoardPlaySection } from "./GameBoardPlaySection";
import { GameBoardSidePanel } from "./GameBoardSidePanel";
import { GameBoardTopSection } from "./GameBoardTopSection";
import type { GameBoardViewProps } from "./gameBoard.view.types";

export const GameBoardView = (props: GameBoardViewProps) => {
  return (
    <section className={`lab-screen flash-${props.flashTone}`}>
      <div className="lab-chrome" />

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

        <GameBoardSidePanel
          user={props.user}
          isCollectionOpen={props.isCollectionOpen}
          setIsCollectionOpen={props.setIsCollectionOpen}
        />
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
