import { GRID_SIZE } from "../services/game.constants.js";
import { HydratedDocument, Model, Schema, model } from "mongoose";
import type {
  AdBoostType,
  PurchaseProductId,
  PurchaseProvider,
  PurchaseSessionStatus,
  RewardedAdProvider,
  RewardedAdSessionStatus
} from "../services/game.types.js";
import { AD_BOOST_INITIAL_DATE_KEY } from "../services/adBoosts.js";
import { IGrid, gridSchema } from "./grid.model.js";

export interface IUser {
  playerId: string;
  character: {
    isRegistered: boolean;
    name: string | null;
    codename: string | null;
    archetype: "alchemist" | "engineer" | "scout" | "keeper" | null;
    avatarSeed: string | null;
    registeredAt: Date | null;
    updatedAt: Date | null;
  };
  account: {
    provider: "vkid" | "telegram" | "email" | null;
    providerUserId: string | null;
    linkedAt: Date | null;
    displayName: string | null;
  };
  auth: {
    email: string | null;
    passwordHash: string | null;
    emailVerifiedAt: Date | null;
    emailVerifyTokenHash: string | null;
    emailVerifyTokenExpiresAt: Date | null;
    passwordResetTokenHash: string | null;
    passwordResetTokenExpiresAt: Date | null;
    lastLoginAt: Date | null;
  };
  gold: number;
  baseLevel: number;
  grid: IGrid;
  lastIncomeClaimAt: Date;
  discoveredItems: string[];
  discoveredRecipes: string[];
  rewardedGoals: string[];
  onboardingHintDismissed: boolean;
  onboardingGuideDismissed: boolean;
  freeSpawnsUsed: number;
  deleteActionsUsed: number;
  goalFreeSpawns: number;
  goalFreeDeletes: number;
  lastDailyRewardClaimAt: Date | null;
  dailyStreak: number;
  bestDailyStreak: number;
  totalDailyClaims: number;
  adBoostClaims: {
    dateKey: string;
    freeSpawnToday: number;
    freeDeleteToday: number;
    flowBoostToday: number;
    doubleOfflineToday: number;
  };
  activeBoosts: {
    flowMultiplierUntil: Date | null;
    flowMultiplier: number;
  };
  rewardedAdSessions: Array<{
    sessionId: string;
    boostType: AdBoostType;
    provider: RewardedAdProvider;
    placement: string;
    status: RewardedAdSessionStatus;
    createdAt: Date;
    expiresAt: Date;
    completedAt: Date | null;
    rewardedAt: Date | null;
  }>;
  commerceEntitlements: {
    removeAds: boolean;
    starterPackPurchasedAt: Date | null;
  };
  purchaseSessions: Array<{
    sessionId: string;
    productId: PurchaseProductId;
    provider: PurchaseProvider;
    status: PurchaseSessionStatus;
    createdAt: Date;
    expiresAt: Date;
    transactionId: string | null;
    completedAt: Date | null;
    grantedAt: Date | null;
  }>;
  purchaseHistory: Array<{
    productId: PurchaseProductId;
    provider: PurchaseProvider;
    transactionId: string;
    grantedAt: Date;
  }>;
}

type UserModel = Model<IUser>;

const userSchema = new Schema<IUser, UserModel>(
  {
    playerId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    character: {
      type: {
        isRegistered: { type: Boolean, required: true, default: false },
        name: { type: String, default: null },
        codename: { type: String, default: null },
        archetype: {
          type: String,
          enum: ["alchemist", "engineer", "scout", "keeper", null],
          default: null
        },
        avatarSeed: { type: String, default: null },
        registeredAt: { type: Date, default: null },
        updatedAt: { type: Date, default: null }
      },
      required: true,
      default: {
        isRegistered: false,
        name: null,
        codename: null,
        archetype: null,
        avatarSeed: null,
        registeredAt: null,
        updatedAt: null
      }
    },
    account: {
      type: {
        provider: {
          type: String,
          enum: ["vkid", "telegram", "email", null],
          default: null
        },
        providerUserId: {
          type: String,
          default: null
        },
        linkedAt: {
          type: Date,
          default: null
        },
        displayName: {
          type: String,
          default: null
        }
      },
      required: true,
      default: {
        provider: null,
        providerUserId: null,
        linkedAt: null,
        displayName: null
      }
    },
    auth: {
      type: {
        email: { type: String, default: null, index: true },
        passwordHash: { type: String, default: null },
        emailVerifiedAt: { type: Date, default: null },
        emailVerifyTokenHash: { type: String, default: null },
        emailVerifyTokenExpiresAt: { type: Date, default: null },
        passwordResetTokenHash: { type: String, default: null },
        passwordResetTokenExpiresAt: { type: Date, default: null },
        lastLoginAt: { type: Date, default: null }
      },
      required: true,
      default: {
        email: null,
        passwordHash: null,
        emailVerifiedAt: null,
        emailVerifyTokenHash: null,
        emailVerifyTokenExpiresAt: null,
        passwordResetTokenHash: null,
        passwordResetTokenExpiresAt: null,
        lastLoginAt: null
      }
    },
    gold: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    baseLevel: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    grid: {
      type: gridSchema,
      required: true,
      default: {
        cells: Array.from({ length: GRID_SIZE }, () => ({ itemId: null }))
      }
    },
    lastIncomeClaimAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    discoveredItems: {
      type: [String],
      required: true,
      default: []
    },
    discoveredRecipes: {
      type: [String],
      required: true,
      default: []
    },
    rewardedGoals: {
      type: [String],
      required: true,
      default: []
    },
    onboardingHintDismissed: {
      type: Boolean,
      required: true,
      default: false
    },
    onboardingGuideDismissed: {
      type: Boolean,
      required: true,
      default: false
    },
    freeSpawnsUsed: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    deleteActionsUsed: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    goalFreeSpawns: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    goalFreeDeletes: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    lastDailyRewardClaimAt: {
      type: Date,
      default: null
    },
    dailyStreak: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    bestDailyStreak: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    totalDailyClaims: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    adBoostClaims: {
      type: {
        dateKey: { type: String, required: true, default: AD_BOOST_INITIAL_DATE_KEY },
        freeSpawnToday: { type: Number, required: true, min: 0, default: 0 },
        freeDeleteToday: { type: Number, required: true, min: 0, default: 0 },
        flowBoostToday: { type: Number, required: true, min: 0, default: 0 },
        doubleOfflineToday: { type: Number, required: true, min: 0, default: 0 }
      },
      required: true,
      default: {
        dateKey: AD_BOOST_INITIAL_DATE_KEY,
        freeSpawnToday: 0,
        freeDeleteToday: 0,
        flowBoostToday: 0,
        doubleOfflineToday: 0
      }
    },
    activeBoosts: {
      type: {
        flowMultiplierUntil: { type: Date, default: null },
        flowMultiplier: { type: Number, required: true, min: 1, default: 1 }
      },
      required: true,
      default: {
        flowMultiplierUntil: null,
        flowMultiplier: 1
      }
    },
    rewardedAdSessions: {
      type: [
        {
          sessionId: { type: String, required: true },
          boostType: {
            type: String,
            enum: [
              "rewarded_free_spawn",
              "rewarded_free_delete",
              "rewarded_flow_boost",
              "rewarded_double_offline_income"
            ],
            required: true
          },
          provider: {
            type: String,
            enum: ["mock", "vkads", "rustore"],
            required: true
          },
          placement: {
            type: String,
            required: true
          },
          status: {
            type: String,
            enum: ["started", "completed", "rewarded", "expired"],
            required: true
          },
          createdAt: { type: Date, required: true },
          expiresAt: { type: Date, required: true },
          completedAt: { type: Date, default: null },
          rewardedAt: { type: Date, default: null }
        }
      ],
      required: true,
      default: []
    },
    commerceEntitlements: {
      type: {
        removeAds: { type: Boolean, required: true, default: false },
        starterPackPurchasedAt: { type: Date, default: null }
      },
      required: true,
      default: {
        removeAds: false,
        starterPackPurchasedAt: null
      }
    },
    purchaseSessions: {
      type: [
        {
          sessionId: { type: String, required: true },
          productId: {
            type: String,
            enum: ["starter_pack", "energy_pack_small", "premium_no_ads"],
            required: true
          },
          provider: {
            type: String,
            enum: ["mock", "rustore"],
            required: true
          },
          status: {
            type: String,
            enum: ["started", "completed", "granted", "expired"],
            required: true
          },
          createdAt: { type: Date, required: true },
          expiresAt: { type: Date, required: true },
          transactionId: { type: String, default: null },
          completedAt: { type: Date, default: null },
          grantedAt: { type: Date, default: null }
        }
      ],
      required: true,
      default: []
    },
    purchaseHistory: {
      type: [
        {
          productId: {
            type: String,
            enum: ["starter_pack", "energy_pack_small", "premium_no_ads"],
            required: true
          },
          provider: {
            type: String,
            enum: ["mock", "rustore"],
            required: true
          },
          transactionId: { type: String, required: true },
          grantedAt: { type: Date, required: true }
        }
      ],
      required: true,
      default: []
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export type UserDocument = HydratedDocument<IUser>;
export const User = model<IUser, UserModel>("User", userSchema);
