import type { GameBoardViewProps } from "./gameBoard.view.types";

export const GameBoardSidePanel = ({
  user,
  setIsCatalogOpen,
  claimDailyRewardAction,
  claimAdBoostAction,
  purchaseProductAction,
  isClaimingDailyReward,
  claimingAdBoostType,
  purchasingProductId
}: Pick<
  GameBoardViewProps,
  | "user"
  | "setIsCatalogOpen"
  | "claimDailyRewardAction"
  | "claimAdBoostAction"
  | "purchaseProductAction"
  | "isClaimingDailyReward"
  | "claimingAdBoostType"
  | "purchasingProductId"
>) => {
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

      <div className="meta-card bonus-card desktop-only">
        <div className="bonus-head">
          <p className="meta-kicker">Бонусы</p>
          <span className="bonus-streak">Серия: {user.dailyReward.streak}</span>
        </div>
        <div className="daily-reward-row">
          <p className="meta-text">
            Сегодня: +{user.dailyReward.todayReward.energy} энергии
            {user.dailyReward.todayReward.freeSpawns > 0 ? `, +${user.dailyReward.todayReward.freeSpawns} синтез` : ""}
            {user.dailyReward.todayReward.freeDeletes > 0 ? `, +${user.dailyReward.todayReward.freeDeletes} утилизация` : ""}
          </p>
          <button
            type="button"
            className="collection-toggle"
            disabled={!user.dailyReward.canClaim || isClaimingDailyReward}
            onClick={claimDailyRewardAction}
          >
            {isClaimingDailyReward ? "Получение..." : user.dailyReward.canClaim ? "Забрать награду" : "Уже забрано"}
          </button>
        </div>
        <div className="daily-week-line">
          {user.dailyReward.weekRewards.map((entry) => (
            <span
              key={entry.day}
              className={`daily-dot ${entry.isToday ? "today" : ""} ${entry.claimed ? "claimed" : ""}`}
              title={`День ${entry.day}`}
            >
              {entry.day}
            </span>
          ))}
        </div>
        <div className="boost-options-list">
          {user.adBoosts.options.map((option) => (
            <div key={option.type} className="boost-option-row">
              <div className="boost-option-copy">
                <p className="boost-option-title">{option.title}</p>
                <p className="boost-option-meta">
                  {option.claimsUsed}/{option.dailyLimit} · {option.rewardText}
                </p>
              </div>
              <button
                type="button"
                className="collection-toggle boost-claim-button"
                disabled={!option.canClaim || claimingAdBoostType === option.type}
                onClick={() => claimAdBoostAction(option.type)}
              >
                {claimingAdBoostType === option.type ? "..." : option.canClaim ? "Получить бонус" : "Лимит"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="meta-card commerce-card desktop-only">
        <div className="bonus-head commerce-head">
          <div>
            <p className="meta-kicker">Магазин сектора</p>
            <p className="meta-text">
              {user.commerce.entitlements.removeAds ? "Реклама отключена" : "Гибридная монетизация активна"}
            </p>
          </div>
          <span className="bonus-streak">
            {user.commerce.entitlements.starterPackPurchased ? "Стартовый набор куплен" : "Стартовый набор доступен"}
          </span>
        </div>
        <div className="commerce-offers-list">
          {user.commerce.offers
            .filter((offer) => offer.isActive)
            .map((offer) => {
              const isOwned =
                (offer.productId === "starter_pack" && user.commerce.entitlements.starterPackPurchased) ||
                (offer.productId === "premium_no_ads" && user.commerce.entitlements.removeAds);

              return (
                <div key={offer.productId} className={`commerce-offer-row kind-${offer.kind}`}>
                  <div className="commerce-offer-copy">
                    <div className="commerce-offer-topline">
                      <p className="boost-option-title">{offer.title}</p>
                      <span className="commerce-price-tag">{offer.priceLabel}</span>
                    </div>
                    <p className="meta-text commerce-description">{offer.description}</p>
                    <p className="boost-option-meta">
                      {offer.rewards.energy > 0 ? `+${offer.rewards.energy} энергии` : "Без энергии"}
                      {offer.rewards.freeSpawns > 0 ? ` · +${offer.rewards.freeSpawns} синтез` : ""}
                      {offer.rewards.freeDeletes > 0 ? ` · +${offer.rewards.freeDeletes} утилизация` : ""}
                      {offer.rewards.removeAds ? " · Без рекламы" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="collection-toggle boost-claim-button commerce-buy-button"
                    disabled={isOwned || purchasingProductId === offer.productId}
                    onClick={() => purchaseProductAction(offer.productId)}
                  >
                    {purchasingProductId === offer.productId ? "Покупка..." : isOwned ? "Активно" : "Купить"}
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </aside>
  );
};
