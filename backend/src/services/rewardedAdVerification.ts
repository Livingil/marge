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
  switch (input.provider) {
    case "mock":
      return {
        provider: "mock",
        boostType: input.boostType,
        sessionId: input.sessionId,
        verifiedAt: new Date()
      };
    case "vkads":
      throw new Error("VK Ads rewarded verification еще не подключена");
    case "rustore":
      throw new Error("RuStore rewarded verification еще не подключена");
  }
};
