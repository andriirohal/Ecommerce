import jwt from "jsonwebtoken";

import { isUserPayload, type UserPayload } from "../index";
import { getSecret } from "../config";

const ACCESS_SECRET = getSecret("ACCESS_SECRET");

export function verifyAccessToken(accessToken: string): UserPayload | null {  
  try {
    const payload = jwt.verify(accessToken, ACCESS_SECRET, { 
      algorithms: ["HS256"]
    });
    
    if (!isUserPayload(payload)) {
      throw new Error("Invalid access token");
    };
    
    return payload;

  } catch {
    return null;
  };
};