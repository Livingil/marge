import { useEffect, useState } from "react";
import type { GameBoardViewProps } from "./gameBoard.view.types";

export const GameBoardTopSection = ({
  user,
  flashTone
}: Pick<GameBoardViewProps,
  | "user"
  | "flashTone"
>) => {
  const [goalToast, setGoalToast] = useState<{
    discoveryLine: string;
    rewardLine: string;
    extraLine: string | null;
  } | null>(null);

  useEffect(() => {
    if (!user.lastActionMessage?.includes("Цель выполнена")) {
      return;
    }

    const rewardSummary = user.lastActionMessage.split(":").slice(1).join(":").trim();
    const rewardParts = rewardSummary.length > 0
      ? rewardSummary.split(",").map((part) => part.trim()).filter(Boolean)
      : [];
    const discoveryLine = user.latestDiscovery
      ? `${user.latestDiscovery.icon} ${user.latestDiscovery.name} открыта`
      : "Цель открыта";

    setGoalToast({
      discoveryLine,
      rewardLine: rewardParts[0] ?? rewardSummary ?? "",
      extraLine: rewardParts.length > 1 ? rewardParts.slice(1).join(" · ") : null
    });

    const toastId = window.setTimeout(() => {
      setGoalToast(null);
    }, 3000);

    return () => window.clearTimeout(toastId);
  }, [user.lastActionMessage, user.latestDiscovery]);

  return (
    <>
      {goalToast ? (
        <div className="goal-toast" role="status" aria-live="polite">
          <p className="goal-toast-title">Цель выполнена!</p>
          <p className="goal-toast-line">{goalToast.discoveryLine}</p>
          <p className="goal-toast-reward">{goalToast.rewardLine}</p>
          {goalToast.extraLine ? <p className="goal-toast-extra">{goalToast.extraLine}</p> : null}
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
