import type { AdBoostType, RewardedAdProvider } from "./game.types.js";

export type VerifiedRewardedAdProof = {
  provider: RewardedAdProvider;
  boostType: AdBoostType;
  sessionId: string;
  verifiedAt: Date;
};

export const verifyRewardedAdCompletion = async (input: {
  provider: RewardedAdProvider;
  boostType: AdBoostType;
  sessionId: string;
}): Promise<VerifiedRewardedAdProof> => {
  const allowUnverifiedVkAds = (process.env.REWARDED_VKADS_TRUST_CLIENT ?? "false").toLowerCase() === "true";

  switch (input.provider) {
    case "mock":
      return {
        provider: "mock",
        boostType: input.boostType,
        sessionId: input.sessionId,
        verifiedAt: new Date()
      };
    case "vkads":
      if (!allowUnverifiedVkAds) {
        throw new Error("VK Ads rewarded verification is not connected yet");
      }
      return {
        provider: "vkads",
        boostType: input.boostType,
        sessionId: input.sessionId,
        verifiedAt: new Date()
      };
    case "rustore":
      throw new Error("RuStore rewarded verification is not connected yet");
  }
};
