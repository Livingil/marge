import type { GameBoardViewProps } from "./gameBoard.view.types";

export const GameBoardTopSection = ({
  user,
  flashTone
}: Pick<GameBoardViewProps,
  | "user"
  | "flashTone"
>) => {
  return (
    <>
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
