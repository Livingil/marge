import { useEffect, useState } from "react";
import {
  useAuthLoginMutation,
  useAuthRegisterMutation,
  useAuthResendVerificationMutation
} from "../../shared/api/gameApi";
import { yookassaReadinessConfig } from "../../shared/monetization/yookassaReadiness";
import type { TierFilter, ChainFilter } from "./gameBoard.helpers";
import type { GameBoardViewProps } from "./gameBoard.view.types";

export const GameBoardOverlays = ({
  isGuideDismissed,
  dismissGuide,
  isHelpOpen,
  setIsHelpOpen,
  isBonusesOpen,
  setIsBonusesOpen,
  isPaymentsInfoOpen,
  setIsPaymentsInfoOpen,
  isAuthOpen,
  setIsAuthOpen,
  isProfileOpen,
  setIsProfileOpen,
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
  user,
  claimDailyRewardAction,
  claimAdBoostAction,
  isClaimingDailyReward,
  claimingAdBoostType,
  adBoostNotice,
  purchaseNotice
}: Pick<GameBoardViewProps,
  | "isGuideDismissed"
  | "dismissGuide"
  | "isHelpOpen"
  | "setIsHelpOpen"
  | "isBonusesOpen"
  | "setIsBonusesOpen"
  | "isPaymentsInfoOpen"
  | "setIsPaymentsInfoOpen"
  | "isAuthOpen"
  | "setIsAuthOpen"
  | "isProfileOpen"
  | "setIsProfileOpen"
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
  | "claimDailyRewardAction"
  | "claimAdBoostAction"
  | "isClaimingDailyReward"
  | "claimingAdBoostType"
  | "adBoostNotice"
  | "purchaseNotice"
>) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [registerEmail, { isLoading: isRegistering }] = useAuthRegisterMutation();
  const [resendVerify, { isLoading: isResending }] = useAuthResendVerificationMutation();
  const [loginEmail, { isLoading: isLoggingIn }] = useAuthLoginMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verificationStatus = params.get("emailVerificationStatus");
    const verificationEmail = params.get("emailVerificationEmail");
    if (!verificationStatus) {
      return;
    }

    if (verificationStatus === "success") {
      setAuthNotice("Почта подтверждена. Теперь можно войти в аккаунт.");
      setPendingVerificationEmail(null);
      setIsVerificationModalOpen(false);
    } else {
      setAuthNotice("Не удалось подтвердить почту. Запросите письмо повторно.");
      if (verificationEmail) {
        setPendingVerificationEmail(verificationEmail);
        setEmail(verificationEmail);
        setIsVerificationModalOpen(true);
      }
    }

    params.delete("emailVerificationStatus");
    params.delete("emailVerificationEmail");
    const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", next);
  }, []);

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

      {isBonusesOpen ? (
        <div className="fullscreen-overlay mobile-only" role="dialog" aria-modal="true">
          <div className="fullscreen-sheet">
            <div className="fullscreen-header">
              <h3>Бонусы</h3>
              <button type="button" className="fullscreen-close" onClick={() => setIsBonusesOpen(false)}>
                Закрыть
              </button>
            </div>
            <div className="fullscreen-content">
              <div className="bonus-card">
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
                  {user.adBoosts.options
                    .filter((option) => option.type !== "rewarded_double_offline_income")
                    .map((option) => (
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
                {adBoostNotice ? <p className="meta-text">{adBoostNotice}</p> : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isAuthOpen ? (
        <div className="fullscreen-overlay mobile-only" role="dialog" aria-modal="true">
          <div className="fullscreen-sheet">
            <div className="fullscreen-header">
              <h3>Вход / регистрация</h3>
              <button type="button" className="fullscreen-close" onClick={() => setIsAuthOpen(false)}>
                Закрыть
              </button>
            </div>
            <div className="fullscreen-content">
              <div className="payment-meta-block">
                <p className="meta-kicker">Гостевой режим</p>
                <p className="meta-text">Игра работает как сейчас: можно играть без регистрации.</p>
                <p className="meta-text">После входа можно переносить прогресс между устройствами и использовать покупки.</p>
              </div>

              <div className="payment-meta-block">
                <p className="meta-kicker">Email</p>
                <input
                  className="catalog-search"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <input
                  className="catalog-search"
                  placeholder="Пароль (минимум 8 символов)"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <div className="boost-options-list">
                  <button
                    type="button"
                    className="collection-toggle"
                    disabled={isRegistering}
                    onClick={() => {
                      setAuthNotice(null);
                      void registerEmail({ email, password })
                        .unwrap()
                        .then((result) => {
                          setPendingVerificationEmail(result.email);
                          setIsVerificationModalOpen(true);
                          setAuthNotice("Проверьте почту и подтвердите адрес.");
                        })
                        .catch((error: { data?: { message?: string } }) =>
                          setAuthNotice(error?.data?.message ?? "Ошибка регистрации")
                        );
                    }}
                  >
                    {isRegistering ? "Регистрация..." : "Зарегистрироваться"}
                  </button>
                  <button
                    type="button"
                    className="collection-toggle"
                    disabled={isLoggingIn}
                    onClick={() => {
                      setAuthNotice(null);
                      void loginEmail({ email, password })
                        .unwrap()
                        .then(() => setAuthNotice("Вход выполнен. Прогресс синхронизирован."))
                        .catch((error: { data?: { message?: string } }) => {
                          const message = error?.data?.message ?? "Ошибка входа";
                          if (message === "Email is not verified") {
                            const targetEmail = email.trim().toLowerCase();
                            setPendingVerificationEmail(targetEmail || null);
                            setIsVerificationModalOpen(true);
                            setAuthNotice("Подтвердите почту для входа.");
                            return;
                          }
                          setAuthNotice(message);
                        });
                    }}
                  >
                    {isLoggingIn ? "Вход..." : "Войти"}
                  </button>
                </div>
              </div>
              {authNotice ? <p className="meta-text">{authNotice}</p> : null}
            </div>
          </div>
        </div>
      ) : null}

      {isProfileOpen ? (
        <div className="fullscreen-overlay mobile-only" role="dialog" aria-modal="true">
          <div className="fullscreen-sheet">
            <div className="fullscreen-header">
              <h3>Профиль</h3>
              <button type="button" className="fullscreen-close" onClick={() => setIsProfileOpen(false)}>
                Закрыть
              </button>
            </div>
            <div className="fullscreen-content">
              <div className="meta-card payment-info-card">
                <div className="payment-meta-block">
                  <p className="meta-kicker">Статус</p>
                  <p className="meta-text">Статус: {user.account.isLinked ? "Авторизован" : "Гостевой"}</p>
                </div>

                <div className="payment-meta-block">
                  <p className="meta-kicker">Почта</p>
                  <p className="meta-text">
                    {user.account.provider === "email" && user.account.displayName
                      ? user.account.displayName
                      : user.account.provider === "email"
                        ? "Привязана"
                        : "Не привязана"}
                  </p>
                </div>

                <div className="payment-meta-block">
                  <p className="meta-kicker">Прогресс</p>
                  <p className="meta-text">Лаборатория: ур. {user.baseLevel}</p>
                  <p className="meta-text">Энергия: {user.gold}</p>
                  <p className="meta-text">Открытий: {user.discoveredItems.length}/{user.itemCatalog.length}</p>
                  <p className="meta-text">Реакций: {user.discoveredRecipeDetails.length}</p>
                  <p className="meta-text">Серия Daily: {user.dailyReward.streak}</p>
                </div>
                {adBoostNotice ? <p className="meta-text">{adBoostNotice}</p> : null}
                {purchaseNotice ? <p className="meta-text">{purchaseNotice}</p> : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isVerificationModalOpen ? (
        <div className="onboarding-guide-overlay" role="dialog" aria-modal="true">
          <div className="onboarding-guide-card">
            <div className="onboarding-guide-header">
              <h3>Подтверждение почты</h3>
              <button type="button" className="onboarding-guide-close" onClick={() => setIsVerificationModalOpen(false)}>
                Закрыть
              </button>
            </div>
            <div className="onboarding-guide-content">
              <p className="onboarding-text">Ожидаем подтверждения вашей почты.</p>
              <p className="onboarding-text">
                {pendingVerificationEmail ? `Почта: ${pendingVerificationEmail}` : "Укажите почту и запросите письмо повторно."}
              </p>
              <button
                type="button"
                className="collection-toggle"
                disabled={isResending || !(pendingVerificationEmail ?? email.trim())}
                onClick={() => {
                  const targetEmail = (pendingVerificationEmail ?? email.trim()).toLowerCase();
                  if (!targetEmail) {
                    return;
                  }
                  setAuthNotice(null);
                  void resendVerify({ email: targetEmail })
                    .unwrap()
                    .then(() => setAuthNotice("Письмо подтверждения отправлено повторно"))
                    .catch((error: { data?: { message?: string } }) =>
                      setAuthNotice(error?.data?.message ?? "Ошибка отправки")
                    );
                }}
              >
                {isResending ? "Отправка..." : "Отправить письмо повторно"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isPaymentsInfoOpen ? (
        <div className="fullscreen-overlay mobile-only" role="dialog" aria-modal="true">
          <div className="fullscreen-sheet payment-info-sheet">
            <div className="fullscreen-header">
              <h3>Оплата и документы</h3>
              <button type="button" className="fullscreen-close" onClick={() => setIsPaymentsInfoOpen(false)}>
                Закрыть
              </button>
            </div>
            <div className="fullscreen-content payment-info-content">
              <div className="payment-info-card">
                {yookassaReadinessConfig.sections.map((section) => (
                  <div key={section.id} className="payment-section">
                    <p className="payment-section-title">{section.title}</p>
                    <ul className="payment-section-list">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isCatalogOpen ? (
        <div className="fullscreen-overlay fullscreen-overlay-catalog" role="dialog" aria-modal="true">
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
