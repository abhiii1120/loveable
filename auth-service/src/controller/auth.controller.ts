import bcrypt from "bcryptjs";
import type { NextFunction, Request, Response } from "express";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

import { env } from "../config/env.js";
import type {
  AuthTokenPayload,
  LoginRequestBody,
  RegisterRequestBody,
} from "../types/user.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/error.util.js";
import { getRefreshTokenCookieOptions } from "../utils/token.util.js";
import { BuildSuccessResponse } from "../utils/BuildSuccessReponse.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  setRefreshTokenHash,
} from "../dao/user.dao.js";
import { UserModel } from "../models/user.model.js";

const SALT_ROUNDS = 10;

/**
 * Signs a JWT with a typed secret and expiry value.
 *
 * @param payload - JWT payload to sign.
 * @param secret - Secret used to sign the token.
 * @param expiresIn - Time-to-live string value.
 * @returns Signed JWT string.
 */
function signToken(
  payload: AuthTokenPayload,
  secret: Secret,
  expiresIn: string,
): string {
  return jwt.sign(payload, secret, {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  });
}

/**
 * Validate a trimmed email string with a simple format check.
 *
 * @param value - Raw value to validate.
 * @returns True when the value is a valid email address.
 */
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Validates a required string fields.
 *
 * @param value -Input value to validate.
 * @param fieldName - Field name used for errors.
 * @returns A trimmed string or throws an error.
 */
function validateRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw new BadRequestError(`${fieldName} is Required`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new BadRequestError(`${fieldName} is Required`);
  }

  return trimmed;
}

/**
 * generates accessToken and refreshtoken for given user details.
 *
 * @param user - Authenticated user payload.
 * @returns accessToken and refreshToken.
 */
function signTokens(user: { id: string; email: string; name: string }): {
  accessToken: string;
  refreshToken: string;
} {
  let tokenVal = {
    sub: user.id,
    email: user.email,
    name: user.name,
  };
  let accessToken = signToken(
    tokenVal,
    env.ACCESS_TOKEN_SECRET,
    env.ACCESS_TOKEN_EXPIRY,
  );

  let refreshToken = signToken(
    tokenVal,
    env.REFRESH_TOKEN_SECRET,
    env.REFRESH_TOKEN_EXPIRY,
  );

  return { accessToken, refreshToken };
}

/**
 * Builds a response payload with access and refresh tokens for auth responses.
 *
 * @param res - Express response instance.
 * @param user - Authenticated user payload.
 */
async function issueTokens(
  res: Response,
  user: { id: string; email: string; name: string },
): Promise<{ accessToken: string; refreshToken: string }> {
  const { accessToken, refreshToken } = signTokens(user);

  const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
  await setRefreshTokenHash(user.id, refreshTokenHash);
  res.setHeader("Authorization", `Bearer ${accessToken}`);
  res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

  return { accessToken, refreshToken };
}

/**
 * Register a new user and issues both tokens.
 *
 * @route POST /api/auth/register
 * @param req - Incoming request containing name, email, and password.
 * @param res - Express response.
 */
export async function register(
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response,
): Promise<void> {
  const name = validateRequiredString(req.body?.name, "name");
  const email = validateRequiredString(req.body?.email, "email");
  const password = validateRequiredString(req.body?.password, "password");

  if (name.length < 2) {
    throw new BadRequestError("name must be at least 2 character long.");
  }

  if (!isValidEmail(email)) {
    throw new BadRequestError("Invalid email format.");
  }

  if (password.length < 8) {
    throw new BadRequestError("password must be at least 8 characters long.");
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new ConflictError("Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser({
    name,
    email: email,
    passwordHash,
  });

  const safeUser = {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
  };

  let { accessToken, refreshToken } = await issueTokens(res, safeUser);

  BuildSuccessResponse(res, "User registered successfully", {
    UserData: safeUser,
    accessToken: accessToken,
  });
}

/**
 * Authenticates an existing user and issues both tokens.
 *
 * @route POST /api/auth/login
 * @param req - Incoming request containing email and password.
 * @param res - Express response.
 */
export async function login(
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
): Promise<void> {
  const email = validateRequiredString(req.body?.email, "email");
  const password = validateRequiredString(req.body?.password, "password");

  if (!isValidEmail(email)) {
    throw new BadRequestError("Invalid email format");
  }

  if (password.length < 8) {
    throw new BadRequestError("Password must be at least 8 characters long.");
  }

  const user = await findUserByEmail(email);
  if (!user) {
    throw new BadRequestError("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new BadRequestError("Invalid email or password");
  }

  const safeUser = {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
  };

  let { accessToken, refreshToken } = await issueTokens(res, safeUser);

  BuildSuccessResponse(res, "User login successfully", {
    UserData: safeUser,
    accessToken: accessToken,
  });
}

/**
 * Refreshes the access token using an HTTP-only refresh cookie.
 *
 * @route POST /api/auth/refresh
 * @param req - Incoming request containing the refresh token cookie.
 * @param res - Express response.
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  let refreshToken = req.cookies?.refreshToken as string | undefined;
  if (!refreshToken) {
    throw new BadRequestError("Refresh token missing");
  }

  let decoded: {
    sub?: string;
    email?: string;
    name?: string;
  };
  try {
    decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as {
      sub?: string;
      email?: string;
      name?: string;
    };
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token.");
  }

  if (!decoded.sub) {
    throw new UnauthorizedError("Invalid refresh token.");
  }

  const user = await findUserById(decoded.sub);
  if (!user) {
    throw new UnauthorizedError("Invalid refresh token.");
  }

  const isRefreshTokenValid = user.refreshTokenHash
    ? await bcrypt.compare(refreshToken, user.refreshTokenHash)
    : false;

  if (!isRefreshTokenValid) {
    throw new UnauthorizedError("Refresh token invalid or revoked");
  }

  const safeUser = { id: user.id, email: user.email, name: user.name };
  const { accessToken } = await issueTokens(res, safeUser);
  BuildSuccessResponse(res, "Token refreshed", {
    UserData: safeUser,
    accessToken,
  });
}

/**
 * Logs the user out and clears the refresh token state.
 *
 * @route POST /api/auth/logout
 * @param req - Incoming request containing the refresh token cookie.
 * @param res - Express response.
 */
export async function logout(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies?.refreshToken as string | undefined;

  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as {
        sub?: string;
      };
      if (decoded.sub) {
        await setRefreshTokenHash(decoded.sub, null);
      }
    } catch {}
  }

  res.clearCookie("refreshToken");
  BuildSuccessResponse(res, "Logged out successfully");
}

/**
 * Returns the current authenticated user profile.
 *
 * @route GET /api/auth/me
 * @param req - Incoming request with authenticated user attached.
 * @param res - Express response.
 */
export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError("Unauthenticated user");
  }

  const user = await findUserById(req.user.id);
  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  BuildSuccessResponse(res, "UserInfo fetched successfully", {
    UserData: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  });
}
