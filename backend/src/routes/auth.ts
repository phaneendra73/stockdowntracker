import { Hono } from "hono";
import { sign } from "hono/jwt";

const auth = new Hono<{ Bindings: any }>();

auth.post("/login", async (c) => {
  const { pin } = await c.req.json();

  if (pin === c.env.ADMIN_PIN) {
    const payload = {
      id: "admin",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    };
    const token = await sign(payload, c.env.JWT_SECRET);
    return c.json({ token });
  }

  return c.json({ error: "Invalid PIN" }, 401);
});

export default auth;
