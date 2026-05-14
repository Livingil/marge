import type { PurchaseProductId, PurchaseProvider } from "./game.types.js";

export type VerifiedPurchaseProof = {
  provider: PurchaseProvider;
  productId: PurchaseProductId;
  transactionId: string;
  providerPurchaseToken: string;
  verifiedAt: Date;
};

export const verifyPurchaseCompletion = async (input: {
  provider: PurchaseProvider;
  productId: PurchaseProductId;
  transactionId: string;
  sessionId: string;
}): Promise<VerifiedPurchaseProof> => {
  const trimmedTransactionId = input.transactionId.trim();
  if (trimmedTransactionId.length < 6) {
    throw new Error("Некорректный идентификатор транзакции");
  }

  switch (input.provider) {
    case "mock":
      return {
        provider: "mock",
        productId: input.productId,
        transactionId: trimmedTransactionId,
        providerPurchaseToken: `mock-proof:${input.sessionId}:${trimmedTransactionId}`,
        verifiedAt: new Date()
      };
    case "rustore":
      throw new Error("RuStore Billing verification еще не подключен");
  }
};
