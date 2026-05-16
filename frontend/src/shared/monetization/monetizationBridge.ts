import { Capacitor, registerPlugin } from "@capacitor/core";

import type { ClaimAdBoostPayload, PurchaseProductId, PurchaseProvider, RewardedAdProvider } from "../api/gameApi";

type MonetizationCapabilities = {
  platform: string;
  nativeAvailable: boolean;
  billingReady: boolean;
  rewardedReady: boolean;
  environment: "mock" | "sandbox" | "production";
  rewardedProvider: RewardedAdProvider;
  purchaseProvider: PurchaseProvider;
  rewardedPlacement: string;
};

type RewardedAdLaunchResult = {
  provider: RewardedAdProvider;
  completed: boolean;
  placement: string;
};

type PurchaseLaunchResult = {
  provider: PurchaseProvider;
  completed: boolean;
  transactionId: string;
};

type MonetizationBridgePlugin = {
  getCapabilities(): Promise<MonetizationCapabilities>;
  launchRewardedAd(options: {
    sessionId: string;
    boostType: ClaimAdBoostPayload["boostType"];
    provider: RewardedAdProvider;
    placement: string;
  }): Promise<RewardedAdLaunchResult>;
  launchPurchase(options: {
    sessionId: string;
    productId: PurchaseProductId;
    provider: PurchaseProvider;
  }): Promise<PurchaseLaunchResult>;
};

const MonetizationBridge = registerPlugin<MonetizationBridgePlugin>("MonetizationBridge");
const REWARDED_FLOW_TIMEOUT_MS = 25000;

const WEB_CAPABILITIES: MonetizationCapabilities = {
  platform: Capacitor.getPlatform(),
  nativeAvailable: false,
  billingReady: false,
  rewardedReady: false,
  environment: "mock",
  rewardedProvider: "mock",
  purchaseProvider: "mock",
  rewardedPlacement: "gameboard_utility"
};

const getFallbackTransactionId = (sessionId: string): string => `mock-${sessionId}`;

export const getMonetizationCapabilities = async (): Promise<MonetizationCapabilities> => {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
    return WEB_CAPABILITIES;
  }

  try {
    return await MonetizationBridge.getCapabilities();
  } catch {
    return WEB_CAPABILITIES;
  }
};

export const launchRewardedAdFlow = async (options: {
  sessionId: string;
  boostType: ClaimAdBoostPayload["boostType"];
  provider: RewardedAdProvider;
  placement: string;
}): Promise<RewardedAdLaunchResult> => {
  const capabilities = await getMonetizationCapabilities();
  if (!capabilities.nativeAvailable || options.provider === "mock") {
    return {
      provider: "mock",
      completed: true,
      placement: options.placement
    };
  }

  const launchPromise = MonetizationBridge.launchRewardedAd(options);
  const timeoutPromise = new Promise<never>((_, reject) => {
    window.setTimeout(() => {
      reject(new Error("Rewarded ad timeout"));
    }, REWARDED_FLOW_TIMEOUT_MS);
  });

  return Promise.race([launchPromise, timeoutPromise]);
};

export const launchPurchaseFlow = async (options: {
  sessionId: string;
  productId: PurchaseProductId;
  provider: PurchaseProvider;
}): Promise<PurchaseLaunchResult> => {
  const capabilities = await getMonetizationCapabilities();
  if (!capabilities.nativeAvailable || options.provider === "mock") {
    return {
      provider: "mock",
      completed: true,
      transactionId: getFallbackTransactionId(options.sessionId)
    };
  }

  return MonetizationBridge.launchPurchase(options);
};
