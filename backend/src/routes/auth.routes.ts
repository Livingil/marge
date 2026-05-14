import { Router } from "express";
import {
  authLoginController,
  authRegisterController,
  authRequestPasswordResetController,
  authResendVerificationController,
  authResetPasswordController,
  authVerifyEmailLinkController,
  authVerifyEmailController,
  authVkCallbackController,
  authVkStartController
} from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", authRegisterController);
authRouter.post("/verify-email", authVerifyEmailController);
authRouter.post("/resend-verification", authResendVerificationController);
authRouter.post("/login", authLoginController);
authRouter.post("/request-password-reset", authRequestPasswordResetController);
authRouter.post("/reset-password", authResetPasswordController);
authRouter.get("/verify-email-link", authVerifyEmailLinkController);
authRouter.get("/vk/start", authVkStartController);
authRouter.get("/vk/callback", authVkCallbackController);
