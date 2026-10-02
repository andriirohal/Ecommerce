import type { Request, Response, NextFunction } from "express";

import { verifyAccessToken } from "../jwt";
import { fail } from "../result";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    const result = fail("Invalid access token", 401);
    return res.status(result.status).json(result);
  };

  const parts = authorization.split(" ", 2);

  if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
    const result = fail("Invalid access token", 401);
    return res.status(result.status).json(result);
  };

  const accessToken = parts[1];
  const payload = verifyAccessToken(accessToken);

  if (!payload) {
    const result = fail("Invalid access token", 401);
    return res.status(result.status).json(result);
  };

  req.user = payload;
  next();
};

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user.role !== "admin") {
    const result = fail("Admin access is required", 403);
    return res.status(result.status).json(result);
  };

  next();
};