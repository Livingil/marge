import type { GameBoardViewProps } from "./gameBoard.view.types";

export const GameBoardTopSection = ({
  user,
  targetItem,
  isHintDismissed,
  isGuideDismissed,
  dismissHint,
  dismissGuide,
  contextHint,
  selectedCellItem,
  flashTone
}: Pick<GameBoardViewProps,
  | "user"
  | "targetItem"
  | "isHintDismissed"
  | "isGuideDismissed"
  | "dismissHint"
  | "dismissGuide"
  | "contextHint"
  | "selectedCellItem"
  | "flashTone"
>) => {
  return (
    <>
      <div className="mission-panel">
        <div className="mission-copy">
          <div className="mission-topline">
            <p className="eyebrow">Сектор синтеза</p>
          </div>
          <h1 className="mission-title">{user.currentGoal.title}</h1>
          <p className="mission-subtitle">
            Соединяй символы, открывай новые образцы и усиливай лабораторию.
          </p>
        </div>
        <div className="target-core">
          <div className="target-core-icon">{targetItem?.icon ?? "☢️"}</div>
          <div className="target-core-ring" />
        </div>
      </div>

      {!isHintDismissed || !isGuideDismissed ? (
        <div className="onboarding-grid">
          {!isHintDismissed ? (
            <div className="onboarding-card">
              <button type="button" className="onboarding-close" onClick={dismissHint}>
                ✕
              </button>
              <p className="eyebrow">Подсказка лаборатории</p>
              <p className="onboarding-title">{contextHint.title}</p>
              <p className="onboarding-text">{contextHint.text}</p>
              <p className={`onboarding-selected ${selectedCellItem ? "" : "empty"}`}>
                {selectedCellItem ? (
                  <>
                    Выбран символ: {selectedCellItem.icon} {selectedCellItem.name}
                    <br />
                    Теперь выбери второй символ для реакции.
                  </>
                ) : (
                  " "
                )}
              </p>
            </div>
          ) : null}

          {!isGuideDismissed ? (
            <div className="onboarding-card how-to-play">
              <button type="button" className="onboarding-close" onClick={dismissGuide}>
                ✕
              </button>
              <p className="eyebrow">Как играть</p>
              <ol className="onboarding-steps">
                <li>Синтезируй ядро</li>
                <li>Соедини два символа</li>
                <li>Открой новый образец</li>
                <li>Собери поток энергии</li>
              </ol>
            </div>
          ) : null}
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
