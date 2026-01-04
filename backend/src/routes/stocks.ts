import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { getStockPrice } from "../services/market";

const stocks = new Hono<{ Bindings: any; Variables: any }>();

stocks.get("/", async (c) => {
  const db = c.get("db");
  const userAlerts = await db.query.alerts.findMany({
    with: {
      stock: true,
    },
  });
  return c.json(userAlerts);
});

stocks.post("/", async (c) => {
  const db = c.get("db");
  const { symbol, url, targetPrice, telegramChatId } = await c.req.json();

  if (!url) {
    return c.json({ error: "Scraping URL is required" }, 400);
  }

  if (!targetPrice) {
    return c.json({ error: "Target Price is required" }, 400);
  }

  let user = await db.query.users.findFirst({
    where: eq(schema.users.id, "admin"),
  });

  if (!user) {
    await db.insert(schema.users).values({
      id: "admin",
      telegramChatId: telegramChatId || "default",
    });
  } else if (telegramChatId && user.telegramChatId !== telegramChatId) {
    await db
      .update(schema.users)
      .set({ telegramChatId })
      .where(eq(schema.users.id, "admin"));
  }

  let stock = await db.query.stocks.findFirst({
    where: eq(schema.stocks.symbol, symbol),
  });

  if (!stock) {
    const stockId = crypto.randomUUID();
    await db.insert(schema.stocks).values({
      id: stockId,
      symbol,
      name: symbol,
      url: url,
    });
    stock = { id: stockId, symbol, name: symbol, url: url };
  } else if (url && stock.url !== url) {
    // Update URL if provided and different
    await db
      .update(schema.stocks)
      .set({ url })
      .where(eq(schema.stocks.id, stock.id));
    stock.url = url;
  }

  const alertId = crypto.randomUUID();
  await db.insert(schema.alerts).values({
    id: alertId,
    userId: "admin",
    stockId: stock.id,
    targetPrice: parseFloat(targetPrice),
    notified: false,
  });

  return c.json({ id: alertId, stock });
});

stocks.delete("/:id", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");
  await db.delete(schema.alerts).where(eq(schema.alerts.id, id));
  return c.json({ success: true });
});

export default stocks;
