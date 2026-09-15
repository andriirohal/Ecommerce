import jwt from "jsonwebtoken";

import { UserPayload, isUserPayload } from "../index";

const { ACCESS_SECRET } = process.env;

if(!ACCESS_SECRET) {
  throw new Error("ACCESS_SECRET must be set");
};

const accessSecret = ACCESS_SECRET;

export function verifyAccessToken(accessToken: string): UserPayload {
  const payload = jwt.verify(accessToken, accessSecret, { 
    algorithms: ["HS256"]
  });

  if(!isUserPayload(payload)) {
    throw new Error("Invalid access token");
  };

  return payload;
};