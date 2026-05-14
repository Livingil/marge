import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { User, type UserDocument } from "../models/user.model.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

const authJwtSecret = process.env.AUTH_JWT_SECRET ?? "dev-auth-secret";
const authAppUrl = (process.env.AUTH_APP_URL ?? "http://localhost:5173").replace(/\/+$/, "");
const vkClientId = process.env.VK_OAUTH_CLIENT_ID?.trim() ?? "";
const vkClientSecret = process.env.VK_OAUTH_CLIENT_SECRET?.trim() ?? "";
const vkRedirectUri = process.env.VK_OAUTH_REDIRECT_URI?.trim() ?? `${process.env.BACKEND_PUBLIC_URL ?? "http://localhost:4000"}/auth/vk/callback`;
const vkApiVersion = process.env.VK_OAUTH_API_VERSION?.trim() ?? "5.199";

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const assertEmail = (email: string): string => {
  const normalized = normalizeEmail(email);
  if (!EMAIL_PATTERN.test(normalized)) {
    throw new Error("Invalid email");
  }
  return normalized;
};

const assertPassword = (password: string): void => {
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    throw new Error(`Password must be at most ${PASSWORD_MAX_LENGTH} characters`);
  }
};

const sha256 = (value: string): string => crypto.createHash("sha256").update(value).digest("hex");
const generateToken = (): string => crypto.randomBytes(24).toString("hex");

const createMailTransport = () => {
  const host = (process.env.EMAIL_HOST ?? process.env.SMTP_HOST)?.trim();
  const port = Number(process.env.EMAIL_PORT ?? process.env.SMTP_PORT ?? 587);
  const user = (process.env.EMAIL_USER ?? process.env.SMTP_USER)?.trim();
  const pass = (process.env.EMAIL_PASSWORD ?? process.env.SMTP_PASS)?.trim();
  const secure = String(process.env.SMTP_SECURE ?? "false").toLowerCase() === "true";

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
};

const sendAuthEmail = async (to: string, subject: string, text: string): Promise<void> => {
  const from = process.env.EMAIL_FROM?.trim() || process.env.SMTP_FROM?.trim() || "noreply@marge.local";
  const transport = createMailTransport();
  if (!transport) {
    console.log("[mail:stub]", { to, subject, text });
    return;
  }

  await transport.sendMail({ from, to, subject, text });
};

const buildAccessToken = (playerId: string): string => {
  return jwt.sign({ playerId }, authJwtSecret, { expiresIn: "7d" });
};

const ensureAuthState = (user: UserDocument): UserDocument => {
  const mutableUser = user as UserDocument & {
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
  };

  if (!mutableUser.auth || typeof mutableUser.auth !== "object") {
    mutableUser.auth = {
      email: null,
      passwordHash: null,
      emailVerifiedAt: null,
      emailVerifyTokenHash: null,
      emailVerifyTokenExpiresAt: null,
      passwordResetTokenHash: null,
      passwordResetTokenExpiresAt: null,
      lastLoginAt: null
    };
  }

  return mutableUser as UserDocument;
};

const assertUserExists = (user: UserDocument | null): UserDocument => {
  if (!user) {
    throw new Error("Player not found");
  }
  return user;
};

export type AuthSessionDto = {
  accessToken: string;
  playerId: string;
  email: string;
  emailVerified: boolean;
};

export const registerEmailAccount = async (
  playerId: string,
  input: { email: string; password: string }
): Promise<{ email: string; verificationRequired: true }> => {
  const email = assertEmail(input.email);
  assertPassword(input.password);

  const existingByEmail = await User.findOne({ "auth.email": email, playerId: { $ne: playerId } });
  if (existingByEmail) {
    throw new Error("Email is already in use");
  }

  const user = ensureAuthState(assertUserExists(await User.findOne({ playerId })));

  const passwordHash = await bcrypt.hash(input.password, 10);
  const verifyToken = generateToken();
  const verifyTokenHash = sha256(verifyToken);
  const verifyExpiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);

  user.auth.email = email;
  user.auth.passwordHash = passwordHash;
  user.auth.emailVerifiedAt = null;
  user.auth.emailVerifyTokenHash = verifyTokenHash;
  user.auth.emailVerifyTokenExpiresAt = verifyExpiresAt;
  user.auth.passwordResetTokenHash = null;
  user.auth.passwordResetTokenExpiresAt = null;

  user.account.provider = "email";
  user.account.providerUserId = email;
  user.account.displayName = user.account.displayName ?? email.split("@")[0];
  user.account.linkedAt = new Date();

  await user.save();

  const backendPublicUrl = (process.env.BACKEND_PUBLIC_URL ?? "http://localhost:4000").replace(/\/+$/, "");
  const verifyUrl = `${backendPublicUrl}/auth/verify-email-link?token=${verifyToken}&email=${encodeURIComponent(email)}`;
  await sendAuthEmail(
    email,
    "РџРѕРґС‚РІРµСЂР¶РґРµРЅРёРµ РїРѕС‡С‚С‹",
    `РџРѕРґС‚РІРµСЂРґРёС‚Рµ РїРѕС‡С‚Сѓ РґР»СЏ РІС…РѕРґР° РІ Лаборатория Синтеза:\n${verifyUrl}\n\nРЎСЃС‹Р»РєР° РґРµР№СЃС‚РІСѓРµС‚ 24 С‡Р°СЃР°.`
  );

  return { email, verificationRequired: true };
};

export const verifyEmailAccount = async (input: {
  email: string;
  token: string;
}): Promise<{ verified: true }> => {
  const email = assertEmail(input.email);
  const tokenHash = sha256(input.token.trim());
  const existingUser = await User.findOne({ "auth.email": email });
  if (!existingUser) {
    throw new Error("Account not found");
  }
  const user = ensureAuthState(existingUser);

  if (!user.auth.emailVerifyTokenHash || !user.auth.emailVerifyTokenExpiresAt) {
    throw new Error("Verification token is missing");
  }

  if (user.auth.emailVerifyTokenHash !== tokenHash) {
    throw new Error("Invalid verification token");
  }

  if (user.auth.emailVerifyTokenExpiresAt.getTime() < Date.now()) {
    throw new Error("Verification token is expired");
  }

  user.auth.emailVerifiedAt = new Date();
  user.auth.emailVerifyTokenHash = null;
  user.auth.emailVerifyTokenExpiresAt = null;
  await user.save();

  return { verified: true };
};

export const loginWithEmail = async (input: {
  email: string;
  password: string;
}): Promise<AuthSessionDto> => {
  const email = assertEmail(input.email);
  const existingUser = await User.findOne({ "auth.email": email });
  if (!existingUser) {
    throw new Error("Invalid credentials");
  }
  const user = ensureAuthState(existingUser);
  if (!user.auth.passwordHash) {
    throw new Error("Invalid credentials");
  }

  const ok = await bcrypt.compare(input.password, user.auth.passwordHash);
  if (!ok) {
    throw new Error("Invalid credentials");
  }

  if (!user.auth.emailVerifiedAt) {
    throw new Error("Email is not verified");
  }

  user.auth.lastLoginAt = new Date();
  user.account.provider = "email";
  user.account.providerUserId = email;
  user.account.linkedAt = user.account.linkedAt ?? new Date();
  await user.save();

  return {
    accessToken: buildAccessToken(user.playerId),
    playerId: user.playerId,
    email,
    emailVerified: Boolean(user.auth.emailVerifiedAt)
  };
};

export const requestPasswordReset = async (input: {
  email: string;
}): Promise<{ accepted: true }> => {
  const email = assertEmail(input.email);
  const existingUser = await User.findOne({ "auth.email": email });
  if (!existingUser) {
    return { accepted: true };
  }
  const user = ensureAuthState(existingUser);

  const resetToken = generateToken();
  user.auth.passwordResetTokenHash = sha256(resetToken);
  user.auth.passwordResetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save();

  const resetUrl = `${authAppUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  await sendAuthEmail(
    email,
    "РЎР±СЂРѕСЃ РїР°СЂРѕР»СЏ",
    `Р—Р°РїСЂРѕСЃ РЅР° СЃР±СЂРѕСЃ РїР°СЂРѕР»СЏ РґР»СЏ Лаборатория Синтеза:\n${resetUrl}\n\nРЎСЃС‹Р»РєР° РґРµР№СЃС‚РІСѓРµС‚ 30 РјРёРЅСѓС‚.`
  );

  return { accepted: true };
};

export const resetPassword = async (input: {
  email: string;
  token: string;
  newPassword: string;
}): Promise<{ reset: true }> => {
  const email = assertEmail(input.email);
  assertPassword(input.newPassword);

  const existingUser = await User.findOne({ "auth.email": email });
  if (!existingUser) {
    throw new Error("Reset request is invalid");
  }
  const user = ensureAuthState(existingUser);
  if (!user.auth.passwordResetTokenHash || !user.auth.passwordResetTokenExpiresAt) {
    throw new Error("Reset request is invalid");
  }

  if (user.auth.passwordResetTokenHash !== sha256(input.token.trim())) {
    throw new Error("Reset request is invalid");
  }

  if (user.auth.passwordResetTokenExpiresAt.getTime() < Date.now()) {
    throw new Error("Reset token is expired");
  }

  user.auth.passwordHash = await bcrypt.hash(input.newPassword, 10);
  user.auth.passwordResetTokenHash = null;
  user.auth.passwordResetTokenExpiresAt = null;
  await user.save();

  return { reset: true };
};

export const resendVerificationEmail = async (input: { email: string }): Promise<{ accepted: true }> => {
  const email = assertEmail(input.email);
  const existingUser = await User.findOne({ "auth.email": email });
  if (!existingUser) {
    return { accepted: true };
  }
  const user = ensureAuthState(existingUser);

  if (user.auth.emailVerifiedAt) {
    return { accepted: true };
  }

  const verifyToken = generateToken();
  user.auth.emailVerifyTokenHash = sha256(verifyToken);
  user.auth.emailVerifyTokenExpiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);
  await user.save();

  const backendPublicUrl = (process.env.BACKEND_PUBLIC_URL ?? "http://localhost:4000").replace(/\/+$/, "");
  const verifyUrl = `${backendPublicUrl}/auth/verify-email-link?token=${verifyToken}&email=${encodeURIComponent(email)}`;
  await sendAuthEmail(
    email,
    "РџРѕРІС‚РѕСЂРЅРѕРµ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёРµ РїРѕС‡С‚С‹",
    `РџРѕРґС‚РІРµСЂРґРёС‚Рµ РїРѕС‡С‚Сѓ РґР»СЏ РІС…РѕРґР° РІ Лаборатория Синтеза:\n${verifyUrl}\n\nРЎСЃС‹Р»РєР° РґРµР№СЃС‚РІСѓРµС‚ 24 С‡Р°СЃР°.`
  );

  return { accepted: true };
};

export const verifyEmailAccountFromLink = async (input: { email: string; token: string }): Promise<{ email: string }> => {
  await verifyEmailAccount(input);
  return { email: assertEmail(input.email) };
};

const createVkState = (playerId: string): string => {
  const payload = JSON.stringify({
    playerId,
    nonce: crypto.randomBytes(8).toString("hex"),
    ts: Date.now()
  });
  const payloadBase64 = Buffer.from(payload, "utf8").toString("base64url");
  const signature = crypto.createHmac("sha256", authJwtSecret).update(payloadBase64).digest("base64url");
  return `${payloadBase64}.${signature}`;
};

const parseVkState = (state: string): { playerId: string } => {
  const [payloadBase64, signature] = state.split(".");
  if (!payloadBase64 || !signature) {
    throw new Error("Invalid VK state");
  }

  const expected = crypto.createHmac("sha256", authJwtSecret).update(payloadBase64).digest("base64url");
  if (expected !== signature) {
    throw new Error("Invalid VK state signature");
  }

  const parsed = JSON.parse(Buffer.from(payloadBase64, "base64url").toString("utf8")) as {
    playerId?: string;
    ts?: number;
  };

  if (!parsed.playerId || typeof parsed.playerId !== "string") {
    throw new Error("Invalid VK state payload");
  }

  const ageMs = Date.now() - (parsed.ts ?? 0);
  if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > 10 * 60 * 1000) {
    throw new Error("VK state is expired");
  }

  return { playerId: parsed.playerId };
};

export const buildVkAuthUrl = (playerId: string): string => {
  if (!vkClientId || !vkRedirectUri) {
    throw new Error("VK ID is not configured");
  }

  const url = new URL("https://oauth.vk.com/authorize");
  url.searchParams.set("client_id", vkClientId);
  url.searchParams.set("redirect_uri", vkRedirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "email");
  url.searchParams.set("v", vkApiVersion);
  url.searchParams.set("state", createVkState(playerId));
  return url.toString();
};

type VkTokenResponse = {
  access_token?: string;
  user_id?: number;
  email?: string;
  error?: string;
  error_description?: string;
};

export const completeVkAuth = async (input: {
  code: string;
  state: string;
}): Promise<AuthSessionDto> => {
  if (!vkClientId || !vkClientSecret || !vkRedirectUri) {
    throw new Error("VK ID is not configured");
  }

  const { playerId } = parseVkState(input.state);
  const tokenUrl = new URL("https://oauth.vk.com/access_token");
  tokenUrl.searchParams.set("client_id", vkClientId);
  tokenUrl.searchParams.set("client_secret", vkClientSecret);
  tokenUrl.searchParams.set("redirect_uri", vkRedirectUri);
  tokenUrl.searchParams.set("code", input.code.trim());

  const response = await fetch(tokenUrl.toString(), { method: "GET" });
  if (!response.ok) {
    throw new Error("VK token exchange failed");
  }

  const tokenData = (await response.json()) as VkTokenResponse;
  if (!tokenData.access_token || !tokenData.user_id) {
    throw new Error(tokenData.error_description || tokenData.error || "VK auth failed");
  }

  const vkUserId = String(tokenData.user_id);
  const vkEmail = typeof tokenData.email === "string" ? normalizeEmail(tokenData.email) : "";

  const linkedUser = await User.findOne({
    "account.provider": "vkid",
    "account.providerUserId": vkUserId
  });

  const user = linkedUser ?? (await User.findOne({ playerId }));
  const targetUser = ensureAuthState(assertUserExists(user));

  targetUser.account.provider = "vkid";
  targetUser.account.providerUserId = vkUserId;
  targetUser.account.linkedAt = targetUser.account.linkedAt ?? new Date();
  targetUser.account.displayName = targetUser.account.displayName ?? `vk_${vkUserId}`;

  if (vkEmail) {
    targetUser.auth.email = vkEmail;
    targetUser.auth.emailVerifiedAt = targetUser.auth.emailVerifiedAt ?? new Date();
  }

  targetUser.auth.lastLoginAt = new Date();
  await targetUser.save();

  return {
    accessToken: buildAccessToken(targetUser.playerId),
    playerId: targetUser.playerId,
    email: targetUser.auth.email ?? "",
    emailVerified: Boolean(targetUser.auth.emailVerifiedAt)
  };
};


