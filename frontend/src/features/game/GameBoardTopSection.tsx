import type { GameBoardViewProps } from "./gameBoard.view.types";

export const GameBoardTopSection = ({
  user,
  flashTone
}: Pick<GameBoardViewProps,
  | "user"
  | "flashTone"
>) => {
  const discoveredCount = Array.isArray(user.discoveredItems) ? user.discoveredItems.length : 0;
  const catalogCount = Array.isArray(user.itemCatalog) ? user.itemCatalog.length : 0;
  const progressPercent = catalogCount > 0 ? Math.round((discoveredCount / catalogCount) * 100) : 0;
  const remaining = Math.max(0, catalogCount - discoveredCount);

  return (
    <>
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

      {user.lastActionMessage ? (
        <div className={`action-banner action-${flashTone}`}>
          <span className="action-banner-label">Журнал</span>
          <span>{user.lastActionMessage}</span>
        </div>
      ) : null}

      {user.latestDiscovery ? (
        <div className="discovery-banner">
          <span className="discovery-kicker">Новое открытие</span>
          <strong>
            {user.latestDiscovery.icon} {user.latestDiscovery.name}
          </strong>
        </div>
      ) : null}
    </>
  );
};
