import { randomUUID } from "node:crypto";
import type {
  PurchaseOfferDto,
  PurchaseProductId,
  PurchaseProvider,
  PurchaseSessionStatus
} from "./game.types.js";

export type PurchaseSessionState = {
  sessionId: string;
  productId: PurchaseProductId;
  provider: PurchaseProvider;
  status: PurchaseSessionStatus;
  createdAt: Date;
  expiresAt: Date;
  transactionId: string | null;
  completedAt: Date | null;
  grantedAt: Date | null;
};

export type PurchaseHistoryEntryState = {
  productId: PurchaseProductId;
  provider: PurchaseProvider;
  transactionId: string;
  grantedAt: Date;
};

export const PURCHASE_SUPPORTED_PROVIDERS: PurchaseProvider[] = ["mock", "rustore"];
export const PURCHASE_DEFAULT_PROVIDER: PurchaseProvider = "mock";
export const PURCHASE_SESSION_TTL_MS = 30 * 60 * 1000;
export const PURCHASE_SESSION_HISTORY_LIMIT = 20;
export const PURCHASE_HISTORY_LIMIT = 50;

export const PURCHASE_OFFERS: PurchaseOfferDto[] = [
  {
    productId: "starter_pack",
    title: "Стартовый набор",
    description: "Разовый буст для мягкого старта: энергия и утилиты.",
    priceLabel: "149 ₽",
    kind: "non_consumable",
    isActive: true,
    purchaseLimit: 1,
    rewards: {
      energy: 600,
      freeSpawns: 5,
      freeDeletes: 2,
      removeAds: false
    }
  },
  {
    productId: "energy_pack_small",
    title: "Малый набор энергии",
    description: "Быстрое пополнение энергии для продолжения сессии.",
    priceLabel: "99 ₽",
    kind: "consumable",
    isActive: true,
    purchaseLimit: null,
    rewards: {
      energy: 900,
      freeSpawns: 0,
      freeDeletes: 0,
      removeAds: false
    }
  },
  {
    productId: "premium_no_ads",
    title: "Без рекламы",
    description: "Отключает межсессионную рекламу и оставляет только добровольные бонусы.",
    priceLabel: "229 ₽",
    kind: "non_consumable",
    isActive: true,
    purchaseLimit: 1,
    rewards: {
      energy: 0,
      freeSpawns: 0,
      freeDeletes: 0,
      removeAds: true
    }
  }
];

export const getPurchaseOffer = (productId: PurchaseProductId): PurchaseOfferDto => {
  const offer = PURCHASE_OFFERS.find((entry) => entry.productId === productId);
  if (!offer) {
    throw new Error("Неизвестный продукт покупки");
  }

  return offer;
};

export const assertPurchaseProviderSupported = (provider: PurchaseProvider): void => {
  if (!PURCHASE_SUPPORTED_PROVIDERS.includes(provider)) {
    throw new Error("Неизвестный провайдер покупки");
  }
};

export const createPurchaseSession = (
  productId: PurchaseProductId,
  now: Date,
  provider: PurchaseProvider = PURCHASE_DEFAULT_PROVIDER
): PurchaseSessionState => ({
  sessionId: randomUUID(),
  productId,
  provider,
  status: "started",
  createdAt: now,
  expiresAt: new Date(now.getTime() + PURCHASE_SESSION_TTL_MS),
  transactionId: null,
  completedAt: null,
  grantedAt: null
});

export const expirePurchaseSessions = (sessions: PurchaseSessionState[], now: Date): PurchaseSessionState[] => {
  return sessions.map((session) => {
    if (session.status !== "started" || session.expiresAt.getTime() > now.getTime()) {
      return session;
    }

    return {
      ...session,
      status: "expired" as const
    };
  });
};

export const trimPurchaseSessions = (sessions: PurchaseSessionState[]): PurchaseSessionState[] => {
  return [...sessions]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .slice(0, PURCHASE_SESSION_HISTORY_LIMIT);
};

export const trimPurchaseHistory = (history: PurchaseHistoryEntryState[]): PurchaseHistoryEntryState[] => {
  return [...history]
    .sort((left, right) => right.grantedAt.getTime() - left.grantedAt.getTime())
    .slice(0, PURCHASE_HISTORY_LIMIT);
};

export const hasProcessedTransaction = (
  history: PurchaseHistoryEntryState[],
  transactionId: string
): boolean => history.some((entry) => entry.transactionId === transactionId);

export const assertPurchaseAllowed = (
  productId: PurchaseProductId,
  entitlements: { removeAds: boolean; starterPackPurchasedAt: Date | null }
): void => {
  switch (productId) {
    case "starter_pack":
      if (entitlements.starterPackPurchasedAt) {
        throw new Error("Стартовый набор уже куплен");
      }
      return;
    case "premium_no_ads":
      if (entitlements.removeAds) {
        throw new Error("Отключение рекламы уже куплено");
      }
      return;
    case "energy_pack_small":
      return;
  }
};

export const completePurchaseSession = (
  sessions: PurchaseSessionState[],
  sessionId: string,
  transactionId: string,
  now: Date
): PurchaseSessionState[] => {
  let matched = false;

  const updatedSessions = sessions.map((session) => {
    if (session.sessionId !== sessionId) {
      return session;
    }

    matched = true;

    if (session.status === "expired") {
      throw new Error("Сессия покупки уже истекла");
    }

    if (session.status === "granted") {
      throw new Error("Покупка по этой сессии уже выдана");
    }

    if (session.expiresAt.getTime() <= now.getTime()) {
      return {
        ...session,
        status: "expired" as const
      };
    }

    if (session.status !== "started") {
      throw new Error("Сессия покупки уже завершена");
    }

    return {
      ...session,
      status: "completed" as const,
      transactionId,
      completedAt: now
    };
  });

  if (!matched) {
    throw new Error("Сессия покупки не найдена");
  }

  return updatedSessions;
};

export const grantPurchaseSession = (
  sessions: PurchaseSessionState[],
  sessionId: string,
  now: Date
): PurchaseSessionState[] => {
  let matched = false;

  const updatedSessions = sessions.map((session) => {
    if (session.sessionId !== sessionId) {
      return session;
    }

    matched = true;

    if (session.status !== "completed") {
      throw new Error("Сессия покупки не готова к выдаче");
    }

    return {
      ...session,
      status: "granted" as const,
      grantedAt: now
    };
  });

  if (!matched) {
    throw new Error("Сессия покупки не найдена");
  }

  return updatedSessions;
};
