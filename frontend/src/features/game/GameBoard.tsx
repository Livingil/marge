import { useEffect, useMemo, useState } from "react";
import {
  type GridCell,
  useClaimIncomeMutation,
  useGetUserQuery,
  useMergeCellsMutation,
  useSpawnItemMutation,
  useUpgradeBaseMutation
} from "../../shared/api/gameApi";
import {
  type CatalogTab,
  type ChainFilter,
  type FlashTone,
  type TierFilter,
  BASE_GRID_ROWS,
  FLASH_DURATION_MS,
  GRID_COLUMNS,
  getActiveGridCells,
  ONBOARDING_GUIDE_DISMISSED_KEY,
  ONBOARDING_HINT_DISMISSED_KEY,
  getActionTone,
  getContextHint,
  getActiveGridRows,
  getItemChain,
  readDismissedFlag
} from "./gameBoard.helpers";
import { GameBoardView } from "./GameBoardView";

export const GameBoard = () => {
  const { data: user, isLoading, isError } = useGetUserQuery();
  const [mergeCells, { isLoading: isMerging }] = useMergeCellsMutation();
  const [spawnItem, { isLoading: isSpawning }] = useSpawnItemMutation();
  const [claimIncome, { isLoading: isClaimingIncome }] = useClaimIncomeMutation();
  const [upgradeBase, { isLoading: isUpgradingBase }] = useUpgradeBaseMutation();

  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [flashTone, setFlashTone] = useState<FlashTone>("neutral");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isUtilityMenuOpen, setIsUtilityMenuOpen] = useState(false);
  const [catalogTab, setCatalogTab] = useState<CatalogTab>("items");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [chainFilter, setChainFilter] = useState<ChainFilter>("all");
  const [isHintDismissed, setIsHintDismissed] = useState(() => readDismissedFlag(ONBOARDING_HINT_DISMISSED_KEY));
  const [isGuideDismissed, setIsGuideDismissed] = useState(() => readDismissedFlag(ONBOARDING_GUIDE_DISMISSED_KEY));

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
    setIsHintDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_HINT_DISMISSED_KEY, "1");
    }
  };

  const dismissGuide = () => {
    setIsGuideDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_GUIDE_DISMISSED_KEY, "1");
    }
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
    if (isHelpOpen || isCatalogOpen) {
      setIsUtilityMenuOpen(false);
    }
  }, [isCatalogOpen, isHelpOpen]);

  const getCellTierClassName = (cell: GridCell): string => {
    if (!cell.item) {
      return "tier-empty";
    }

    return `tier-${cell.item.tier}`;
  };

  const onDropCell = async (toIndex: number) => {
    if (dragFrom === null || dragFrom === toIndex) {
      setDragFrom(null);
      return;
    }

    try {
      await mergeCells({ cellA: dragFrom, cellB: toIndex }).unwrap();
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
      await mergeCells({ cellA: selectedCell, cellB: index }).unwrap();
    } finally {
      setSelectedCell(null);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isError || !user) {
    return <p>Failed to load user.</p>;
  }

  return (
    <GameBoardView
      user={user}
      flashTone={flashTone}
      cells={cells}
      targetItem={targetItem}
      contextHint={contextHint}
      selectedCellItem={selectedCellItem}
      isHintDismissed={isHintDismissed}
      isGuideDismissed={isGuideDismissed}
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
      canSpawn={canSpawn}
      canUpgradeBase={canUpgradeBase}
      spawnItemAction={() => {
        void spawnItem();
      }}
      claimIncomeAction={() => {
        void claimIncome();
      }}
      upgradeBaseAction={() => {
        void upgradeBase();
      }}
      isCollectionOpen={isCollectionOpen}
      setIsCollectionOpen={setIsCollectionOpen}
      isHelpOpen={isHelpOpen}
      setIsHelpOpen={setIsHelpOpen}
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
