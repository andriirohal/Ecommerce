import "express-serve-static-core";

export type UserPayload = {
  userId: string;
  email: string;
  role: string;
};

declare module "express-serve-static-core" {
  interface Request {
    user: UserPayload;
  };
};