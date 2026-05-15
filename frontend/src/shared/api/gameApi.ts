import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { getOrCreatePlayerId, setPlayerId } from "./playerSession";
import {
  getMonetizationCapabilities,
  launchPurchaseFlow,
  launchRewardedAdFlow
} from "../monetization/monetizationBridge";

const apiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();

if (!apiBaseUrl) {
  throw new Error("VITE_API_URL is required for frontend runtime");
}

export type GridItem = {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;
};

export type GridCell = {
  itemId: string | null;
  item: GridItem | null;
};

export type DiscoveredRecipeDto = {
  key: string;
  left: GridItem;
  right: GridItem;
  result: GridItem;
};

export type UserState = {
  _id: string;
  player: {
    id: string;
    mode: "guest" | "linked";
  };
  character: {
    isRegistered: boolean;
    name: string | null;
    codename: string | null;
    archetype: "alchemist" | "engineer" | "scout" | "keeper" | null;
    avatarSeed: string | null;
    registeredAt: string | null;
    updatedAt: string | null;
  };
  account: {
    isLinked: boolean;
    provider: "vkid" | "telegram" | "email" | null;
    displayName: string | null;
    linkedAt: string | null;
    suggestedProviders: Array<"vkid" | "telegram" | "email">;
  };
  gold: number;
  baseLevel: number;
  incomePerMinute: number;
  claimableIncome: number;
  lastIncomeClaimAt: string;
  spawnCost: number;
  baseUpgradeCost: number;
  currentGoal: {
    title: string;
    targetItemId: string;
    rewardText: string;
    reward: {
      energy: number;
      freeSpawns: number;
      freeDeletes: number;
    };
  };
  discoveredItems: string[];
  discoveredRecipes: string[];
  discoveredRecipeDetails: DiscoveredRecipeDto[];
  itemCatalog: GridItem[];
  deleteCosts: Array<number | null>;
  latestDiscovery: GridItem | null;
  lastActionMessage: string | null;
  onboardingHintDismissed: boolean;
  onboardingGuideDismissed: boolean;
  goalFreeSpawns: number;
  goalFreeDeletes: number;
  dailyReward: {
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
    weekRewards: Array<{
      day: number;
      energy: number;
      freeSpawns: number;
      freeDeletes: number;
      isToday: boolean;
      claimed: boolean;
    }>;
  };
  adBoosts: {
    dateKey: string;
    supportedProviders: Array<"mock" | "vkads" | "rustore">;
    options: Array<{
      type: "rewarded_free_spawn" | "rewarded_free_delete" | "rewarded_flow_boost" | "rewarded_double_offline_income";
      title: string;
      description: string;
      rewardText: string;
      claimsUsed: number;
      dailyLimit: number;
      canClaim: boolean;
    }>;
    active: {
      flowMultiplier: number;
      flowMultiplierUntil: string | null;
    };
  };
  commerce: {
    supportedProviders: PurchaseProvider[];
    offers: Array<{
      productId: PurchaseProductId;
      title: string;
      description: string;
      priceLabel: string;
      kind: "consumable" | "non_consumable";
      isActive: boolean;
      purchaseLimit: 1 | null;
      rewards: {
        energy: number;
        freeSpawns: number;
        freeDeletes: number;
        removeAds: boolean;
      };
    }>;
    entitlements: {
      removeAds: boolean;
      starterPackPurchased: boolean;
    };
  };
  grid: {
    cells: GridCell[];
  };
};

export type MergePayload = {
  cellA: number;
  cellB: number;
};

export type DeleteCellPayload = {
  cellIndex: number;
};

export type UpdateOnboardingPayload = {
  hintDismissed?: boolean;
  guideDismissed?: boolean;
};

export type ClaimAdBoostPayload = {
  boostType: "rewarded_free_spawn" | "rewarded_free_delete" | "rewarded_flow_boost" | "rewarded_double_offline_income";
};

export type RewardedAdProvider = "mock" | "vkads" | "rustore";

export type RewardedAdSession = {
  sessionId: string;
  boostType: ClaimAdBoostPayload["boostType"];
  provider: RewardedAdProvider;
  placement: string;
  status: "started" | "completed" | "rewarded" | "expired";
  expiresAt: string;
};

export type PurchaseProductId = "starter_pack" | "energy_pack_small" | "premium_no_ads";

export type PurchaseProvider = "mock" | "rustore";

export type PurchaseSession = {
  sessionId: string;
  productId: PurchaseProductId;
  provider: PurchaseProvider;
  status: "started" | "completed" | "granted" | "expired";
  expiresAt: string;
};

export type PurchaseProductPayload = {
  productId: PurchaseProductId;
};

export type RegisterCharacterPayload = {
  name: string;
  codename?: string;
  archetype: "alchemist" | "engineer" | "scout" | "keeper";
  avatarSeed?: string;
};

export type UpdateCharacterProfilePayload = {
  name?: string;
  codename?: string;
  archetype?: "alchemist" | "engineer" | "scout" | "keeper";
  avatarSeed?: string;
};

export type AuthRegisterPayload = {
  email: string;
  password: string;
};

export type AuthVerifyEmailPayload = {
  email: string;
  token: string;
};

export type AuthLoginPayload = {
  email: string;
  password: string;
};

export type AuthRequestResetPayload = {
  email: string;
};

export type AuthResetPayload = {
  email: string;
  token: string;
  newPassword: string;
};

export type AuthLoginResult = {
  accessToken: string;
  playerId: string;
  email: string;
  emailVerified: boolean;
};

export const gameApi = createApi({
  reducerPath: "gameApi",
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl.replace(/\/+$/, ""),
    prepareHeaders: (headers) => {
      headers.set("x-player-id", getOrCreatePlayerId());
      return headers;
    }
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUser: builder.query<UserState, void>({
      query: () => "/user",
      providesTags: ["User"]
    }),
    mergeCells: builder.mutation<UserState, MergePayload>({
      query: (body) => ({
        url: "/merge",
        method: "POST",
        body
      }),
      invalidatesTags: ["User"]
    }),
    spawnItem: builder.mutation<UserState, void>({
      query: () => ({
        url: "/spawn",
        method: "POST"
      }),
      invalidatesTags: ["User"]
    }),
    claimIncome: builder.mutation<UserState, void>({
      query: () => ({
        url: "/income/claim",
        method: "POST"
      }),
      invalidatesTags: ["User"]
    }),
    upgradeBase: builder.mutation<UserState, void>({
      query: () => ({
        url: "/upgrade/base",
        method: "POST"
      }),
      invalidatesTags: ["User"]
    }),
    deleteCell: builder.mutation<UserState, DeleteCellPayload>({
      query: (body) => ({
        url: "/cell/delete",
        method: "POST",
        body
      }),
      invalidatesTags: ["User"]
    }),
    claimDailyReward: builder.mutation<UserState, void>({
      query: () => ({
        url: "/daily-reward/claim",
        method: "POST"
      }),
      invalidatesTags: ["User"]
    }),
    claimAdBoost: builder.mutation<UserState, ClaimAdBoostPayload>({
      async queryFn(body, _api, _extraOptions, baseQuery) {
        const capabilities = await getMonetizationCapabilities();
        const sessionResult = await baseQuery({
          url: "/ad-boosts/session",
          method: "POST",
          body: {
            ...body,
            provider: capabilities.rewardedProvider,
            placement: capabilities.rewardedPlacement
          }
        });

        if (sessionResult.error) {
          return { error: sessionResult.error };
        }

        const session = sessionResult.data as RewardedAdSession;
        let rewardedResult;
        try {
          rewardedResult = await launchRewardedAdFlow({
            sessionId: session.sessionId,
            boostType: body.boostType,
            provider: session.provider,
            placement: session.placement
          });
        } catch (error) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: error instanceof Error ? error.message : "Rewarded ad launch failed"
            }
          };
        }

        if (!rewardedResult.completed) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: "Rewarded ad was not completed"
            }
          };
        }

        const rewardResult = await baseQuery({
          url: "/ad-boosts/session/complete",
          method: "POST",
          body: {
            boostType: body.boostType,
            sessionId: session.sessionId
          }
        });

        if (rewardResult.error) {
          return { error: rewardResult.error };
        }

        return { data: rewardResult.data as UserState };
      },
      invalidatesTags: ["User"]
    }),
    purchaseProduct: builder.mutation<UserState, PurchaseProductPayload>({
      async queryFn(body, _api, _extraOptions, baseQuery) {
        const capabilities = await getMonetizationCapabilities();
        const sessionResult = await baseQuery({
          url: "/purchases/session",
          method: "POST",
          body: {
            ...body,
            provider: capabilities.purchaseProvider
          }
        });

        if (sessionResult.error) {
          return { error: sessionResult.error };
        }

        const session = sessionResult.data as PurchaseSession;
        const purchaseResult = await launchPurchaseFlow({
          sessionId: session.sessionId,
          productId: body.productId,
          provider: session.provider
        });

        if (!purchaseResult.completed) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: "Purchase flow was not completed"
            }
          };
        }

        const rewardResult = await baseQuery({
          url: "/purchases/session/complete",
          method: "POST",
          body: {
            sessionId: session.sessionId,
            transactionId: purchaseResult.transactionId
          }
        });

        if (rewardResult.error) {
          return { error: rewardResult.error };
        }

        return { data: rewardResult.data as UserState };
      },
      invalidatesTags: ["User"]
    }),
    updateOnboarding: builder.mutation<UserState, UpdateOnboardingPayload>({
      query: (body) => ({
        url: "/user/onboarding",
        method: "PATCH",
        body
      }),
      invalidatesTags: ["User"]
    }),
    registerCharacter: builder.mutation<UserState, RegisterCharacterPayload>({
      query: (body) => ({
        url: "/character/register",
        method: "POST",
        body
      }),
      invalidatesTags: ["User"]
    }),
    updateCharacterProfile: builder.mutation<UserState, UpdateCharacterProfilePayload>({
      query: (body) => ({
        url: "/character/profile",
        method: "PATCH",
        body
      }),
      invalidatesTags: ["User"]
    }),
    authRegister: builder.mutation<{ email: string; verificationRequired: true }, AuthRegisterPayload>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body
      })
    }),
    authVerifyEmail: builder.mutation<{ verified: true }, AuthVerifyEmailPayload>({
      query: (body) => ({
        url: "/auth/verify-email",
        method: "POST",
        body
      })
    }),
    authResendVerification: builder.mutation<{ accepted: true }, AuthRequestResetPayload>({
      query: (body) => ({
        url: "/auth/resend-verification",
        method: "POST",
        body
      })
    }),
    authLogin: builder.mutation<AuthLoginResult, AuthLoginPayload>({
      async queryFn(body, _api, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: "/auth/login",
          method: "POST",
          body
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as AuthLoginResult;
        setPlayerId(data.playerId);
        return { data };
      },
      invalidatesTags: ["User"]
    }),
    authRequestPasswordReset: builder.mutation<{ accepted: true }, AuthRequestResetPayload>({
      query: (body) => ({
        url: "/auth/request-password-reset",
        method: "POST",
        body
      })
    }),
    authResetPassword: builder.mutation<{ reset: true }, AuthResetPayload>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body
      })
    })
  })
});

export const {
  useGetUserQuery,
  useMergeCellsMutation,
  useSpawnItemMutation,
  useClaimIncomeMutation,
  useClaimDailyRewardMutation,
  useClaimAdBoostMutation,
  usePurchaseProductMutation,
  useUpgradeBaseMutation,
  useDeleteCellMutation,
  useUpdateOnboardingMutation,
  useRegisterCharacterMutation,
  useUpdateCharacterProfileMutation,
  useAuthRegisterMutation,
  useAuthVerifyEmailMutation,
  useAuthResendVerificationMutation,
  useAuthLoginMutation,
  useAuthRequestPasswordResetMutation,
  useAuthResetPasswordMutation
} = gameApi;
