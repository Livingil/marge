import { useEffect, useMemo, useRef, useState } from "react";
import {
  type ClaimAdBoostPayload,
  type GridCell,
  type PurchaseProductId,
  useClaimAdBoostMutation,
  useClaimDailyRewardMutation,
  useClaimIncomeMutation,
  useDeleteCellMutation,
  useGetUserQuery,
  useMergeCellsMutation,
  usePurchaseProductMutation,
  useSpawnItemMutation,
  useUpdateOnboardingMutation,
  useUpgradeBaseMutation
} from "../../shared/api/gameApi";
import { getMonetizationCapabilities, launchRewardedAdFlow } from "../../shared/monetization/monetizationBridge";
import {
  type CatalogTab,
  type ChainFilter,
  type FlashTone,
  type TierFilter,
  BASE_GRID_ROWS,
  FLASH_DURATION_MS,
  GRID_COLUMNS,
  getActiveGridCells,
  getActionTone,
  getContextHint,
  getActiveGridRows,
  getItemChain
} from "./gameBoard.helpers";
import { GameBoardView } from "./GameBoardView";

const extractMutationErrorMessage = (error: unknown, fallbackMessage: string): string => {
  const formatMessage = (message: string): string => {
    if (message.includes("SSL handshake aborted") || message.includes("Connection reset by peer")) {
      return "Реклама VK Ads не загрузилась из-за сетевой/TLS ошибки. Попробуйте другую сеть или отключите VPN.";
    }

    if (message.includes("hasnt banners error")) {
      return "Реклама временно недоступна. Повторите запрос позже.";
    }

    if (message.startsWith("VK rewarded ad not available:")) {
      return "Реклама временно недоступна. Повторите запрос позже.";
    }

    if (message === "Rewarded ad timeout") {
      return "Реклама не ответила вовремя. Попробуйте ещё раз.";
    }

    return message;
  };

  if (error instanceof Error && error.message) {
    return formatMessage(error.message);
  }

  if (error && typeof error === "object") {
    const mutationError = error as {
      error?: string;
      data?: { error?: string; message?: string };
    };

    if (typeof mutationError.error === "string" && mutationError.error.length > 0) {
      return formatMessage(mutationError.error);
    }

    if (typeof mutationError.data?.error === "string" && mutationError.data.error.length > 0) {
      return formatMessage(mutationError.data.error);
    }

    if (typeof mutationError.data?.message === "string" && mutationError.data.message.length > 0) {
      return formatMessage(mutationError.data.message);
    }
  }

  return fallbackMessage;
};

export const GameBoard = () => {
  const AUTO_AD_INTERVAL_MS = 10 * 60 * 1000;
  const { data: user, isLoading, isError } = useGetUserQuery();
  const [mergeCells, { isLoading: isMerging }] = useMergeCellsMutation();
  const [spawnItem, { isLoading: isSpawning }] = useSpawnItemMutation();
  const [claimIncome, { isLoading: isClaimingIncome }] = useClaimIncomeMutation();
  const [claimDailyReward, { isLoading: isClaimingDailyReward }] = useClaimDailyRewardMutation();
  const [claimAdBoost, { isLoading: isClaimingAdBoost }] = useClaimAdBoostMutation();
  const [purchaseProduct] = usePurchaseProductMutation();
  const [upgradeBase, { isLoading: isUpgradingBase }] = useUpgradeBaseMutation();
  const [deleteCell, { isLoading: isDeletingCell }] = useDeleteCellMutation();
  const [updateOnboarding] = useUpdateOnboardingMutation();

  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [flashTone, setFlashTone] = useState<FlashTone>("neutral");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isBonusesOpen, setIsBonusesOpen] = useState(false);
  const [isPaymentsInfoOpen, setIsPaymentsInfoOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isUtilityMenuOpen, setIsUtilityMenuOpen] = useState(false);
  const [catalogTab, setCatalogTab] = useState<CatalogTab>("items");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [chainFilter, setChainFilter] = useState<ChainFilter>("all");
  const [goalCompletionToast, setGoalCompletionToast] = useState<{
    title: string;
    discoveryLine: string;
    rewardLine: string | null;
  } | null>(null);
  const [mergeFeedback, setMergeFeedback] = useState<{
    cellIndex: number;
    message: string;
    tone: "success" | "new" | "spawn";
    nonce: number;
  } | null>(null);
  const [isSpawnCelebrating, setIsSpawnCelebrating] = useState(false);
  const [claimingAdBoostType, setClaimingAdBoostType] = useState<ClaimAdBoostPayload["boostType"] | null>(null);
  const [adBoostNotice, setAdBoostNotice] = useState<string | null>(null);
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);
  const [purchasingProductId, setPurchasingProductId] = useState<PurchaseProductId | null>(null);
  const mergeFeedbackTimeoutRef = useRef<number | null>(null);
  const spawnCelebrationTimeoutRef = useRef<number | null>(null);
  const previousGoalTargetIdRef = useRef<string | null>(null);
  const hasSeenFirstUserRef = useRef(false);
  const isAutoAdInFlightRef = useRef(false);

  const activeRows = useMemo(() => (user ? getActiveGridRows(user.baseLevel) : BASE_GRID_ROWS), [user]);
  const activeCellsCount = useMemo(
    () => (user ? getActiveGridCells(user.baseLevel) : BASE_GRID_ROWS * GRID_COLUMNS),
    [user]
  );
  const cells = useMemo(() => (user?.grid.cells ?? []).slice(0, activeCellsCount), [activeCellsCount, user]);
  const targetItem = useMemo(() => {
    if (!user) {
      return null;
    }

    return user.itemCatalog.find((item) => item.id === user.currentGoal.targetItemId) ?? null;
  }, [user]);

  const filledCellsCount = useMemo(() => cells.filter((cell) => Boolean(cell.itemId)).length, [cells]);
  const emptyCellsCount = activeCellsCount - filledCellsCount;
  const hasSelectedCell = selectedCell !== null;
  const discoveredCount = user?.discoveredItems.length ?? 0;
  const hasAnyDiscoveredItems = discoveredCount > 0;
  const canSpawn = user ? user.gold >= user.spawnCost : false;
  const canUpgradeBase = user ? user.gold >= user.baseUpgradeCost : false;
  const selectedCellDeleteCost = useMemo(() => {
    if (selectedCell === null) {
      return null;
    }

    return user?.deleteCosts?.[selectedCell] ?? null;
  }, [selectedCell, user]);
  const canDeleteSelectedCell = Boolean(
    selectedCell !== null &&
    cells[selectedCell]?.itemId &&
    selectedCellDeleteCost !== null &&
    user &&
    user.gold >= selectedCellDeleteCost
  );
  const hasSelectedCellItem = Boolean(selectedCell !== null && cells[selectedCell]?.itemId);

  const selectedCellItem = useMemo(() => {
    if (selectedCell === null) {
      return null;
    }

    return cells[selectedCell]?.item ?? null;
  }, [cells, selectedCell]);

  const filteredCatalogItems = useMemo(() => {
    const filtered = user?.itemCatalog.filter((item) => {
      if (tierFilter !== "all" && String(item.tier) !== tierFilter) {
        return false;
      }

      const itemChain = getItemChain(item.id);
      if (chainFilter !== "all" && itemChain !== chainFilter) {
        return false;
      }

      return true;
    }) ?? [];

    return [...filtered].sort((a, b) => {
      if (a.tier !== b.tier) {
        return a.tier - b.tier;
      }

      return a.name.localeCompare(b.name, "ru");
    });
  }, [chainFilter, tierFilter, user]);

  const contextHint = getContextHint(
    filledCellsCount,
    emptyCellsCount,
    hasSelectedCell,
    canSpawn,
    discoveredCount,
    hasAnyDiscoveredItems
  );

  const dismissHint = () => {
    void updateOnboarding({ hintDismissed: true });
  };

  const dismissGuide = () => {
    void updateOnboarding({ guideDismissed: true });
  };

  useEffect(() => {
    if (!user?.lastActionMessage && !user?.latestDiscovery) {
      return;
    }

    setFlashTone(getActionTone(user.lastActionMessage, user.latestDiscovery));

    const timeoutId = window.setTimeout(() => {
      setFlashTone("neutral");
    }, FLASH_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [user?.lastActionMessage, user?.latestDiscovery]);

  useEffect(() => {
    if (isHelpOpen || isBonusesOpen || isPaymentsInfoOpen || isAuthOpen || isProfileOpen || isCatalogOpen) {
      setIsUtilityMenuOpen(false);
    }
  }, [isAuthOpen, isBonusesOpen, isCatalogOpen, isHelpOpen, isPaymentsInfoOpen, isProfileOpen]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const currentGoalTargetId = user.currentGoal.targetItemId;
    if (!hasSeenFirstUserRef.current) {
      hasSeenFirstUserRef.current = true;
      previousGoalTargetIdRef.current = currentGoalTargetId;
      return;
    }

    const previousGoalTargetId = previousGoalTargetIdRef.current;
    const goalChanged =
      typeof previousGoalTargetId === "string" &&
      previousGoalTargetId.length > 0 &&
      previousGoalTargetId !== currentGoalTargetId;
    const hasGoalMessage = user.lastActionMessage?.includes("Цель выполнена");

    if (goalChanged || hasGoalMessage) {
      const previousGoalItem = user.itemCatalog.find((item) => item.id === previousGoalTargetId) ?? null;
      const discoveryLine = previousGoalItem
        ? `${previousGoalItem.icon} ${previousGoalItem.name} открыта`
        : user.latestDiscovery
          ? `${user.latestDiscovery.icon} ${user.latestDiscovery.name} открыта`
          : "Цель открыта";

      setGoalCompletionToast({
        title: "Цель выполнена!",
        discoveryLine,
        rewardLine: user.lastActionMessage ?? null
      });

      const timeoutId = window.setTimeout(() => {
        setGoalCompletionToast(null);
      }, 3000);

      previousGoalTargetIdRef.current = currentGoalTargetId;
      return () => window.clearTimeout(timeoutId);
    }

    previousGoalTargetIdRef.current = currentGoalTargetId;
  }, [user]);

  useEffect(() => {
    return () => {
      if (mergeFeedbackTimeoutRef.current !== null) {
        window.clearTimeout(mergeFeedbackTimeoutRef.current);
      }
      if (spawnCelebrationTimeoutRef.current !== null) {
        window.clearTimeout(spawnCelebrationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let isDisposed = false;
    let timerId: number | null = null;

    const schedule = () => {
      timerId = window.setTimeout(async () => {
        if (isDisposed) {
          return;
        }
        if (document.visibilityState !== "visible" || isAutoAdInFlightRef.current) {
          schedule();
          return;
        }

        try {
          const capabilities = await getMonetizationCapabilities();
          if (capabilities.rewardedProvider !== "mock") {
            isAutoAdInFlightRef.current = true;
            await launchRewardedAdFlow({
              sessionId: `auto-${Date.now()}`,
              boostType: "rewarded_flow_boost",
              provider: capabilities.rewardedProvider,
              placement: "auto_10m"
            });
          }
        } catch {
          // Ignore auto-ad errors to keep gameplay uninterrupted.
        } finally {
          isAutoAdInFlightRef.current = false;
          schedule();
        }
      }, AUTO_AD_INTERVAL_MS);
    };

    schedule();

    return () => {
      isDisposed = true;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    };
  }, []);

  const getCellTierClassName = (cell: GridCell): string => {
    if (!cell.item) {
      return "tier-empty";
    }

    return `tier-${cell.item.tier}`;
  };

  const resolveMergeResultCellIndex = (
    updatedUserCells: Array<{ itemId: string | null }>,
    firstIndex: number,
    secondIndex: number
  ): number | null => {
    const beforeFirst = cells[firstIndex]?.itemId ?? null;
    const beforeSecond = cells[secondIndex]?.itemId ?? null;
    const afterFirst = updatedUserCells[firstIndex]?.itemId ?? null;
    const afterSecond = updatedUserCells[secondIndex]?.itemId ?? null;

    if (afterFirst !== null && afterFirst !== beforeFirst) {
      return firstIndex;
    }

    if (afterSecond !== null && afterSecond !== beforeSecond) {
      return secondIndex;
    }

    return null;
  };

  const triggerMergeFeedback = (resultCellIndex: number, isNewDiscovery: boolean): void => {
    if (mergeFeedbackTimeoutRef.current !== null) {
      window.clearTimeout(mergeFeedbackTimeoutRef.current);
    }

    setMergeFeedback({
      cellIndex: resultCellIndex,
      message: isNewDiscovery ? "Новое открытие!" : "Слияние!",
      tone: isNewDiscovery ? "new" : "success",
      nonce: Date.now()
    });

    mergeFeedbackTimeoutRef.current = window.setTimeout(() => {
      setMergeFeedback(null);
      mergeFeedbackTimeoutRef.current = null;
    }, 800);
  };

  const triggerSpawnCelebration = (): void => {
    if (spawnCelebrationTimeoutRef.current !== null) {
      window.clearTimeout(spawnCelebrationTimeoutRef.current);
    }

    setIsSpawnCelebrating(true);
    spawnCelebrationTimeoutRef.current = window.setTimeout(() => {
      setIsSpawnCelebrating(false);
      spawnCelebrationTimeoutRef.current = null;
    }, 720);
  };

  const resolveSpawnResultCellIndex = (updatedUserCells: Array<{ itemId: string | null }>): number | null => {
    for (let i = 0; i < cells.length; i += 1) {
      const before = cells[i]?.itemId ?? null;
      const after = updatedUserCells[i]?.itemId ?? null;

      if (before === null && after !== null) {
        return i;
      }
    }

    return null;
  };

  const onDropCell = async (toIndex: number) => {
    if (dragFrom === null || dragFrom === toIndex) {
      setDragFrom(null);
      return;
    }

    try {
      const updatedUser = await mergeCells({ cellA: dragFrom, cellB: toIndex }).unwrap();
      const resultCellIndex = resolveMergeResultCellIndex(updatedUser.grid.cells, dragFrom, toIndex);
      if (resultCellIndex !== null) {
        triggerMergeFeedback(resultCellIndex, Boolean(updatedUser.latestDiscovery));
      }
    } finally {
      setDragFrom(null);
      setSelectedCell(null);
    }
  };

  const handleCellClick = async (index: number) => {
    const cell = cells[index];

    if (!cell || !cell.itemId || isMerging) {
      return;
    }

    if (selectedCell === null) {
      setSelectedCell(index);
      return;
    }

    if (selectedCell === index) {
      setSelectedCell(null);
      return;
    }

    try {
      const updatedUser = await mergeCells({ cellA: selectedCell, cellB: index }).unwrap();
      const resultCellIndex = resolveMergeResultCellIndex(updatedUser.grid.cells, selectedCell, index);
      if (resultCellIndex !== null) {
        triggerMergeFeedback(resultCellIndex, Boolean(updatedUser.latestDiscovery));
      }
    } finally {
      setSelectedCell(null);
    }
  };

  if (isLoading) {
    return (
      <div className="screen-loading" role="status" aria-live="polite">
        <div className="screen-loading-core" aria-hidden="true">
          <span className="screen-loading-ring" />
          <span className="screen-loading-dot" />
        </div>
        <p className="screen-loading-text">
          Загрузка<span className="screen-loading-ellipsis">...</span>
        </p>
      </div>
    );
  }

  if (isError || !user) {
    return <p>Failed to load user.</p>;
  }

  return (
    <GameBoardView
      mergeFeedback={mergeFeedback}
      isSpawnCelebrating={isSpawnCelebrating}
      goalCompletionToast={goalCompletionToast}
      user={user}
      flashTone={flashTone}
      cells={cells}
      targetItem={targetItem}
      contextHint={contextHint}
      selectedCellItem={selectedCellItem}
      isHintDismissed={user.onboardingHintDismissed}
      isGuideDismissed={user.onboardingGuideDismissed}
      dismissHint={dismissHint}
      dismissGuide={dismissGuide}
      filledCellsCount={filledCellsCount}
      selectedCell={selectedCell}
      dragFrom={dragFrom}
      isMerging={isMerging}
      onDropCell={onDropCell}
      setDragFrom={setDragFrom}
      handleCellClick={handleCellClick}
      getCellTierClassName={getCellTierClassName}
      isSpawning={isSpawning}
      isClaimingIncome={isClaimingIncome}
      isUpgradingBase={isUpgradingBase}
      isDeletingCell={isDeletingCell}
      canSpawn={canSpawn}
      canUpgradeBase={canUpgradeBase}
      hasSelectedCellItem={hasSelectedCellItem}
      canDeleteSelectedCell={canDeleteSelectedCell}
      selectedCellDeleteCost={selectedCellDeleteCost}
      spawnItemAction={() => {
        void spawnItem()
          .unwrap()
          .then((updatedUser) => {
            triggerSpawnCelebration();
            const spawnedCellIndex = resolveSpawnResultCellIndex(updatedUser.grid.cells);
            if (spawnedCellIndex === null) {
              return;
            }

            if (mergeFeedbackTimeoutRef.current !== null) {
              window.clearTimeout(mergeFeedbackTimeoutRef.current);
            }

            setMergeFeedback({
              cellIndex: spawnedCellIndex,
              message: "Синтез!",
              tone: "spawn",
              nonce: Date.now()
            });

            mergeFeedbackTimeoutRef.current = window.setTimeout(() => {
              setMergeFeedback(null);
              mergeFeedbackTimeoutRef.current = null;
            }, 680);
          });
      }}
      claimIncomeAction={() => {
        void claimIncome();
      }}
      upgradeBaseAction={() => {
        void upgradeBase();
      }}
      deleteCellAction={() => {
        if (selectedCell === null || !cells[selectedCell]?.itemId) {
          return;
        }

        void deleteCell({ cellIndex: selectedCell })
          .unwrap()
          .then(() => {
            setSelectedCell(null);
          });
      }}
      claimDailyRewardAction={() => {
        void claimDailyReward();
      }}
      claimAdBoostAction={(boostType) => {
        if (boostType === "rewarded_double_offline_income") {
          setAdBoostNotice("Офлайн-буст ещё не подключён");
          return;
        }

        setClaimingAdBoostType(boostType);
        setAdBoostNotice("Запуск рекламы...");
        void claimAdBoost({ boostType })
          .unwrap()
          .then(() => {
            setAdBoostNotice("Награда получена");
          })
          .catch((error: unknown) => {
            setAdBoostNotice(extractMutationErrorMessage(error, "Не удалось показать рекламу"));
          })
          .finally(() => {
            setClaimingAdBoostType(null);
          });
      }}
      purchaseProductAction={(productId) => {
        setPurchasingProductId(productId);
        setPurchaseNotice("Запуск покупки...");
        void purchaseProduct({ productId })
          .unwrap()
          .then(() => {
            setPurchaseNotice("Покупка применена");
          })
          .catch((error: unknown) => {
            setPurchaseNotice(extractMutationErrorMessage(error, "Не удалось выполнить покупку"));
          })
          .finally(() => {
            setPurchasingProductId(null);
          });
      }}
      isClaimingDailyReward={isClaimingDailyReward}
      claimingAdBoostType={isClaimingAdBoost ? claimingAdBoostType : null}
      adBoostNotice={adBoostNotice}
      purchaseNotice={purchaseNotice}
      purchasingProductId={purchasingProductId}
      isCollectionOpen={isCollectionOpen}
      setIsCollectionOpen={setIsCollectionOpen}
      isHelpOpen={isHelpOpen}
      setIsHelpOpen={setIsHelpOpen}
      isBonusesOpen={isBonusesOpen}
      setIsBonusesOpen={setIsBonusesOpen}
      isPaymentsInfoOpen={isPaymentsInfoOpen}
      setIsPaymentsInfoOpen={setIsPaymentsInfoOpen}
      isAuthOpen={isAuthOpen}
      setIsAuthOpen={setIsAuthOpen}
      isProfileOpen={isProfileOpen}
      setIsProfileOpen={setIsProfileOpen}
      isCatalogOpen={isCatalogOpen}
      setIsCatalogOpen={setIsCatalogOpen}
      isUtilityMenuOpen={isUtilityMenuOpen}
      setIsUtilityMenuOpen={setIsUtilityMenuOpen}
      catalogTab={catalogTab}
      setCatalogTab={setCatalogTab}
      tierFilter={tierFilter}
      setTierFilter={setTierFilter}
      chainFilter={chainFilter}
      setChainFilter={setChainFilter}
      filteredCatalogItems={filteredCatalogItems}
      activeRows={activeRows}
    />
  );
};
