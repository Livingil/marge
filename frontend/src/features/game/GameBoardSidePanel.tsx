import type { GameBoardViewProps } from "./gameBoard.view.types";

export const GameBoardSidePanel = ({
  user,
  isCollectionOpen,
  setIsCollectionOpen
}: Pick<GameBoardViewProps, "user" | "isCollectionOpen" | "setIsCollectionOpen">) => {
  const discoveredProgress =
    user.itemCatalog.length > 0
      ? Math.round((user.discoveredItems.length / user.itemCatalog.length) * 100)
      : 0;

  return (
    <aside className="lab-sidepanel">
      <div className="meta-card progress-card desktop-only">
        <div className="progress-head">
          <div>
            <p className="meta-kicker">Каталог образцов</p>
            <h3>
              {user.discoveredItems.length} / {user.itemCatalog.length}
            </h3>
          </div>
          <button
            type="button"
            className="collection-toggle"
            onClick={() => setIsCollectionOpen(!isCollectionOpen)}
          >
            {isCollectionOpen ? "Свернуть" : "Открыть"}
          </button>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${discoveredProgress}%` }} />
        </div>
        <p className="meta-text">Новые образцы дают прогресс каталога и открывают следующую ветку.</p>
      </div>

      <div className="meta-card reactions-card desktop-only">
        <p className="meta-kicker">Открытые реакции</p>
        {user.discoveredRecipeDetails.length === 0 ? (
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

      <div className={`collection-sheet ${isCollectionOpen ? "open" : ""}`}>
        <div className="collection-grid">
          {user.itemCatalog.map((item) => {
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
      </div>
    </aside>
  );
};
