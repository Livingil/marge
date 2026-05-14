import { Request, Response } from "express";
import { getPlayerIdHeaderName, resolvePlayerId } from "../services/player.service.js";
import {
  buildVkAuthUrl,
  completeVkAuth,
  loginWithEmail,
  registerEmailAccount,
  requestPasswordReset,
  resendVerificationEmail,
  resetPassword,
  verifyEmailAccount,
  verifyEmailAccountFromLink
} from "../services/auth.service.js";

const getPlayerId = (req: Request): string => resolvePlayerId(req.headers[getPlayerIdHeaderName()]);

export const authRegisterController = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await registerEmailAccount(getPlayerId(req), { email, password });
  res.status(200).json(result);
};

export const authVerifyEmailController = async (req: Request, res: Response): Promise<void> => {
  const { email, token } = req.body as { email: string; token: string };
  const result = await verifyEmailAccount({ email, token });
  res.status(200).json(result);
};

export const authResendVerificationController = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email: string };
  const result = await resendVerificationEmail({ email });
  res.status(200).json(result);
};

export const authLoginController = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await loginWithEmail({ email, password });
  res.status(200).json(result);
};

export const authRequestPasswordResetController = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email: string };
  const result = await requestPasswordReset({ email });
  res.status(200).json(result);
};

export const authResetPasswordController = async (req: Request, res: Response): Promise<void> => {
  const { email, token, newPassword } = req.body as { email: string; token: string; newPassword: string };
  const result = await resetPassword({ email, token, newPassword });
  res.status(200).json(result);
};

export const authVkStartController = async (_req: Request, res: Response): Promise<void> => {
  const playerIdRaw = typeof _req.query.playerId === "string" ? _req.query.playerId : "";
  const playerId = resolvePlayerId(playerIdRaw);
  const redirectUrl = buildVkAuthUrl(playerId);
  res.redirect(redirectUrl);
};

export const authVkCallbackController = async (req: Request, res: Response): Promise<void> => {
  const code = typeof req.query.code === "string" ? req.query.code.trim() : "";
  const state = typeof req.query.state === "string" ? req.query.state.trim() : "";
  if (!code || !state) {
    throw new Error("Missing VK callback parameters");
  }

  const result = await completeVkAuth({ code, state });
  const appUrl = new URL(process.env.AUTH_APP_URL ?? "http://localhost:5173");
  appUrl.searchParams.set("vkAuthStatus", "success");
  appUrl.searchParams.set("vkPlayerId", result.playerId);
  appUrl.searchParams.set("vkEmailVerified", String(result.emailVerified));
  res.redirect(appUrl.toString());
};

export const authVerifyEmailLinkController = async (req: Request, res: Response): Promise<void> => {
  const token = typeof req.query.token === "string" ? req.query.token.trim() : "";
  const email = typeof req.query.email === "string" ? req.query.email.trim() : "";
  const appUrl = new URL(process.env.AUTH_APP_URL ?? "http://localhost:5173");

  if (!token || !email) {
    appUrl.searchParams.set("emailVerificationStatus", "failed");
    res.redirect(appUrl.toString());
    return;
  }

  try {
    const result = await verifyEmailAccountFromLink({ email, token });
    appUrl.searchParams.set("emailVerificationStatus", "success");
    appUrl.searchParams.set("emailVerificationEmail", result.email);
    res.redirect(appUrl.toString());
  } catch {
    appUrl.searchParams.set("emailVerificationStatus", "failed");
    appUrl.searchParams.set("emailVerificationEmail", email);
    res.redirect(appUrl.toString());
  }
};
