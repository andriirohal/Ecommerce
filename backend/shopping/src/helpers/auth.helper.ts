import { UserPayload } from "../index";

export function isUserPayload(payload: unknown): payload is UserPayload {
  if(typeof payload !== "object" || payload === null) {
    return false;
  };

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.userId === "string" &&
    typeof candidate.email === "string" 
  );
};