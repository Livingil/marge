import type { GameBoardViewProps } from "./gameBoard.view.types";

export const GameBoardTopSection = ({
  user,
  flashTone
}: Pick<GameBoardViewProps,
  | "user"
  | "flashTone"
>) => {
  const goalRewardParts = [`Награда: +${user.currentGoal.reward.energy} энергии`];
  if (user.currentGoal.reward.freeSpawns > 0) {
    goalRewardParts.push(`+${user.currentGoal.reward.freeSpawns} синтез`);
  }
  if (user.currentGoal.reward.freeDeletes > 0) {
    goalRewardParts.push(`+${user.currentGoal.reward.freeDeletes} утилизация`);
  }

  return (
    <>
      <div className="action-banner action-neutral">
        <span className="action-banner-label">Цель</span>
        <span>{goalRewardParts.join(", ")}</span>
      </div>

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
