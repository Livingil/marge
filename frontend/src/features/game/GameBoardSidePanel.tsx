import type { GameBoardViewProps } from "./gameBoard.view.types";

export const GameBoardSidePanel = ({
  user,
  setIsCatalogOpen
}: Pick<GameBoardViewProps, "user" | "setIsCatalogOpen">) => {
  const discoveredIds = new Set(user.discoveredItems);
  const discoveredCatalogItems = user.itemCatalog.filter((item) => discoveredIds.has(item.id));
  const undiscoveredCatalogItems = user.itemCatalog.filter((item) => !discoveredIds.has(item.id));
  const previewItems = [...discoveredCatalogItems, ...undiscoveredCatalogItems].slice(0, 9);
  const totalReactions = user.discoveredRecipeDetails.length;

  return (
    <aside className="lab-sidepanel">
      <div className="meta-card reactions-card desktop-only">
        <div className="reactions-head">
          <p className="meta-kicker">Открытые реакции</p>
          <span className="reactions-count">{totalReactions}</span>
        </div>
        {totalReactions === 0 ? (
          <div className="reaction-empty-state">
            <p className="reaction-empty-title">Реакции не найдены</p>
            <p className="reaction-empty">Проведи первые слияния на поле, чтобы журнал реакций заполнился.</p>
          </div>
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

      <div className="meta-card collection-preview-card desktop-only">
        <div className="progress-head">
          <div>
            <p className="meta-kicker">Образцы сектора</p>
            <p className="meta-text">Краткий обзор каталога</p>
          </div>
          <button
            type="button"
            className="collection-toggle"
            onClick={() => setIsCatalogOpen(true)}
          >
            Открыть каталог
          </button>
        </div>
        <div className="collection-preview-grid">
          {previewItems.map((item) => {
            const discovered = user.discoveredItems.includes(item.id);

            return (
              <div
                key={item.id}
                className={`collection-preview-tile ${discovered ? "open" : "closed"} tier-${item.tier}`}
              >
                <span className="collection-preview-icon">{discovered ? item.icon : "?"}</span>
                <span className="collection-preview-name">{discovered ? item.name : "Не открыто"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
