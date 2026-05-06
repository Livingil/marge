import type { GameBoardViewProps } from "./gameBoard.view.types";

export const GameBoardTopSection = ({
  goalCompletionToast,
  user,
  flashTone
}: Pick<GameBoardViewProps,
  | "goalCompletionToast"
  | "user"
  | "flashTone"
>) => {
  return (
    <>
      {goalCompletionToast ? (
        <div className="goal-toast" role="status" aria-live="polite">
          <p className="goal-toast-title">{goalCompletionToast.title}</p>
          <p className="goal-toast-line">{goalCompletionToast.discoveryLine}</p>
          {goalCompletionToast.rewardLine ? <p className="goal-toast-reward">{goalCompletionToast.rewardLine}</p> : null}
        </div>
      ) : null}

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
