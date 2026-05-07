import type { TierFilter, ChainFilter } from "./gameBoard.helpers";
import type { GameBoardViewProps } from "./gameBoard.view.types";

export const GameBoardOverlays = ({
  isGuideDismissed,
  dismissGuide,
  isHelpOpen,
  setIsHelpOpen,
  contextHint,
  selectedCellItem,
  isCatalogOpen,
  setIsCatalogOpen,
  catalogTab,
  setCatalogTab,
  tierFilter,
  setTierFilter,
  chainFilter,
  setChainFilter,
  filteredCatalogItems,
  user
}: Pick<GameBoardViewProps,
  | "isGuideDismissed"
  | "dismissGuide"
  | "isHelpOpen"
  | "setIsHelpOpen"
  | "contextHint"
  | "selectedCellItem"
  | "isCatalogOpen"
  | "setIsCatalogOpen"
  | "catalogTab"
  | "setCatalogTab"
  | "tierFilter"
  | "setTierFilter"
  | "chainFilter"
  | "setChainFilter"
  | "filteredCatalogItems"
  | "user"
>) => {
  const discoveredCount = user.discoveredItems.length;
  const catalogCount = user.itemCatalog.length;
  const progressPercent = catalogCount > 0 ? Math.round((discoveredCount / catalogCount) * 100) : 0;

  return (
    <>
      {!isGuideDismissed ? (
        <div className="onboarding-guide-overlay" role="dialog" aria-modal="true">
          <div className="onboarding-guide-card">
            <div className="onboarding-guide-header">
              <h3>Как играть</h3>
              <button type="button" className="onboarding-guide-close" onClick={dismissGuide}>
                Понятно
              </button>
            </div>
            <div className="onboarding-guide-content">
              <ol className="onboarding-steps">
                <li>Синтезируй ядро</li>
                <li>Соедини два символа</li>
                <li>Открой новый образец</li>
                <li>Собери поток энергии</li>
              </ol>
            </div>
          </div>
        </div>
      ) : null}

      {isHelpOpen ? (
        <div className="fullscreen-overlay mobile-only" role="dialog" aria-modal="true">
          <div className="fullscreen-sheet">
            <div className="fullscreen-header">
              <h3>Помощь</h3>
              <button type="button" className="fullscreen-close" onClick={() => setIsHelpOpen(false)}>
                Закрыть
              </button>
            </div>
            <div className="fullscreen-content">
              <p className="eyebrow">Подсказка лаборатории</p>
              <p className="onboarding-title">{contextHint.title}</p>
              <p className="onboarding-text">{contextHint.text}</p>
              {selectedCellItem ? (
                <p className="onboarding-selected">
                  Выбран символ: {selectedCellItem.icon} {selectedCellItem.name}
                  <br />
                  Теперь выбери второй символ для реакции.
                </p>
              ) : null}
              <p className="eyebrow">Как играть</p>
              <ol className="onboarding-steps">
                <li>Синтезируй ядро</li>
                <li>Соедини два символа</li>
                <li>Открой новый образец</li>
                <li>Собери поток энергии</li>
              </ol>
            </div>
          </div>
        </div>
      ) : null}

      {isCatalogOpen ? (
        <div className="fullscreen-overlay mobile-only" role="dialog" aria-modal="true">
          <div className="fullscreen-sheet">
            <div className="fullscreen-header">
              <div className="catalog-header-copy">
                <h3>Каталог</h3>
                <p className="catalog-header-progress">Открыто {discoveredCount}/{catalogCount}</p>
                <div className="catalog-header-progress-track" role="presentation">
                  <span className="catalog-header-progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
              <button type="button" className="fullscreen-close" onClick={() => setIsCatalogOpen(false)}>
                Закрыть
              </button>
            </div>
            <div className="catalog-tabs">
              <button
                type="button"
                className={`catalog-tab ${catalogTab === "items" ? "active" : ""}`}
                onClick={() => setCatalogTab("items")}
              >
                Образцы
              </button>
              <button
                type="button"
                className={`catalog-tab ${catalogTab === "reactions" ? "active" : ""}`}
                onClick={() => setCatalogTab("reactions")}
              >
                Реакции
              </button>
            </div>
            <div className="catalog-filter-bar">
              {catalogTab === "items" ? (
                <div className="catalog-filter-chips catalog-filter-sort">
                  <label className="catalog-sort-label" htmlFor="catalog-sort-select">
                    Тир
                  </label>
                  <select
                    id="catalog-sort-select"
                    className="catalog-sort-select"
                    value={tierFilter}
                    onChange={(event) => setTierFilter(event.target.value as TierFilter)}
                  >
                    <option value="all">Все</option>
                    <option value="1">T1</option>
                    <option value="2">T2</option>
                    <option value="3">T3</option>
                    <option value="4">T4</option>
                    <option value="5">T5</option>
                  </select>
                  <label className="catalog-sort-label" htmlFor="catalog-chain-select">
                    Цепочка
                  </label>
                  <select
                    id="catalog-chain-select"
                    className="catalog-sort-select"
                    value={chainFilter}
                    onChange={(event) => setChainFilter(event.target.value as ChainFilter)}
                  >
                    <option value="all">Все</option>
                    <option value="Энергия">Энергия</option>
                    <option value="Жизнь">Жизнь</option>
                    <option value="Технологии">Технологии</option>
                    <option value="Магия">Магия</option>
                    <option value="Пространство">Пространство</option>
                    <option value="Техно-магия">Техно-магия</option>
                    <option value="Прочее">Прочее</option>
                  </select>
                </div>
              ) : (
                <p className="catalog-hint">Рецепты показывают только найденные реакции.</p>
              )}
            </div>
            <div className="fullscreen-content">
              {catalogTab === "items" ? (
                <div className="collection-grid">
                  {filteredCatalogItems.map((item) => {
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
              ) : user.discoveredRecipeDetails.length === 0 ? (
                <p className="reaction-empty">Первые реакции появятся здесь после успешных слияний.</p>
              ) : (
                <div className="reaction-list">
                  {user.discoveredRecipeDetails.map((reaction) => (
                    <div key={reaction.key} className="reaction-row">
                      <span className="reaction-part">
                        {reaction.left.icon} {reaction.left.name}
                      </span>
                      <span className="reaction-plus">+</span>
                      <span className="reaction-part">
                        {reaction.right.icon} {reaction.right.name}
                      </span>
                      <span className="reaction-arrow">→</span>
                      <span className="reaction-part reaction-result">
                        {reaction.result.icon} {reaction.result.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
