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

export type CharacterArchetype = "alchemist" | "engineer" | "scout" | "keeper";

export interface RegisterCharacterInput {
  name: string;
  codename?: string;
  archetype: CharacterArchetype;
  avatarSeed?: string;
}

export interface UpdateCharacterProfileInput {
  name?: string;
  codename?: string;
  archetype?: CharacterArchetype;
  avatarSeed?: string;
}

export interface StartAdBoostSessionInput {
  boostType: AdBoostType;
  provider?: RewardedAdProvider;
  placement?: string;
}

export interface CompleteAdBoostSessionInput {
  sessionId: string;
}

export interface StartPurchaseSessionInput {
  productId: PurchaseProductId;
  provider?: PurchaseProvider;
}

export interface CompletePurchaseSessionInput {
  sessionId: string;
  transactionId: string;
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
  reward: GoalRewardDto;
}

export interface GoalRewardDto {
  energy: number;
  freeSpawns: number;
  freeDeletes: number;
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
  player: PlayerDto;
  character: CharacterDto;
  account: AccountDto;
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
  goalFreeSpawns: number;
  goalFreeDeletes: number;
  dailyReward: DailyRewardDto;
  adBoosts: AdBoostsDto;
  commerce: CommerceDto;
}

export type PlayerDto = {
  id: string;
  mode: "guest" | "linked";
};

export type AccountProvider = "vkid" | "telegram" | "email";

export type AccountDto = {
  isLinked: boolean;
  provider: AccountProvider | null;
  displayName: string | null;
  linkedAt: string | null;
  suggestedProviders: AccountProvider[];
};

export type CharacterDto = {
  isRegistered: boolean;
  name: string | null;
  codename: string | null;
  archetype: CharacterArchetype | null;
  avatarSeed: string | null;
  registeredAt: string | null;
  updatedAt: string | null;
};

export type DailyRewardEntryDto = {
  day: number;
  energy: number;
  freeSpawns: number;
  freeDeletes: number;
  isToday: boolean;
  claimed: boolean;
};

export type DailyRewardDto = {
  canClaim: boolean;
  streak: number;
  bestStreak: number;
  totalClaims: number;
  nextClaimAt: string | null;
  todayReward: {
    energy: number;
    freeSpawns: number;
    freeDeletes: number;
  };
  weekRewards: DailyRewardEntryDto[];
};

export type AdBoostType =
  | "rewarded_free_spawn"
  | "rewarded_free_delete"
  | "rewarded_flow_boost"
  | "rewarded_double_offline_income";

export type RewardedAdProvider = "mock" | "vkads" | "rustore";

export type RewardedAdSessionStatus = "started" | "completed" | "rewarded" | "expired";

export type AdBoostOptionDto = {
  type: AdBoostType;
  title: string;
  description: string;
  rewardText: string;
  claimsUsed: number;
  dailyLimit: number;
  canClaim: boolean;
};

export type AdBoostsDto = {
  dateKey: string;
  supportedProviders: RewardedAdProvider[];
  options: AdBoostOptionDto[];
  active: {
    flowMultiplier: number;
    flowMultiplierUntil: string | null;
  };
};

export type RewardedAdSessionDto = {
  sessionId: string;
  boostType: AdBoostType;
  provider: RewardedAdProvider;
  placement: string;
  status: RewardedAdSessionStatus;
  expiresAt: string;
};

export type PurchaseProductId = "starter_pack" | "energy_pack_small" | "premium_no_ads";

export type PurchaseProvider = "mock" | "rustore";

export type PurchaseSessionStatus = "started" | "completed" | "granted" | "expired";

export type PurchaseOfferKind = "consumable" | "non_consumable";

export type PurchaseOfferDto = {
  productId: PurchaseProductId;
  title: string;
  description: string;
  priceLabel: string;
  kind: PurchaseOfferKind;
  isActive: boolean;
  purchaseLimit: 1 | null;
  rewards: {
    energy: number;
    freeSpawns: number;
    freeDeletes: number;
    removeAds: boolean;
  };
};

export type CommerceDto = {
  supportedProviders: PurchaseProvider[];
  offers: PurchaseOfferDto[];
  entitlements: {
    removeAds: boolean;
    starterPackPurchased: boolean;
  };
};

export type PurchaseSessionDto = {
  sessionId: string;
  productId: PurchaseProductId;
  provider: PurchaseProvider;
  status: PurchaseSessionStatus;
  expiresAt: string;
};
