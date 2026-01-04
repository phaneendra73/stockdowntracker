import { jwt } from "hono/jwt";
import { Context, Next } from "hono";

export const authMiddleware = async (c: Context, next: Next) => {
  if (c.req.path === "/api/login") return next();

  const middleware = jwt({
    secret: c.env.JWT_SECRET,
  });

  return middleware(c, next);
};
