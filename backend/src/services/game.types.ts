export interface MergeCellsInput {
  cellA: number;
  cellB: number;
}

export interface DeleteCellInput {
  cellIndex: number;
}

export interface UpdateOnboardingInput {
  hintDismissed?: boolean;
  guideDismissed?: boolean;
}

export interface ItemDetails {
  id: string;
  icon: string;
  name: string;
  description: string;
  tier: number;
}

export interface CurrentGoalDto {
  title: string;
  targetItemId: string;
  rewardText: string;
}

export interface UserGridCellDto {
  itemId: string | null;
  item: ItemDetails | null;
}

export interface UserGridDto {
  cells: UserGridCellDto[];
}

export interface DiscoveredRecipeDetailsDto {
  key: string;
  left: ItemDetails;
  right: ItemDetails;
  result: ItemDetails;
}

export interface UserStateDto {
  _id: string;
  gold: number;
  baseLevel: number;
  grid: UserGridDto;
  incomePerMinute: number;
  claimableIncome: number;
  lastIncomeClaimAt: Date;
  spawnCost: number;
  baseUpgradeCost: number;
  currentGoal: CurrentGoalDto;
  discoveredItems: string[];
  discoveredRecipes: string[];
  discoveredRecipeDetails: DiscoveredRecipeDetailsDto[];
  itemCatalog: ItemDetails[];
  deleteCosts: Array<number | null>;
  latestDiscovery: ItemDetails | null;
  lastActionMessage: string | null;
  onboardingHintDismissed: boolean;
  onboardingGuideDismissed: boolean;
}
