import jwt from "jsonwebtoken";

import { isUserPayload, type UserPayload } from "../index";

const { ACCESS_SECRET } = process.env;

export function verifyAccessToken(accessToken: string): UserPayload {
  const payload = jwt.verify(accessToken, ACCESS_SECRET!, { 
    algorithms: ["HS256"]
  });

  if (!isUserPayload(payload)) {
    throw new Error("Invalid access token");
  };

  return payload;
};