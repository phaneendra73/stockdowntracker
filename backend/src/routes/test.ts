import { Hono } from "hono";
import { getStockPrice } from "../services/market";
import { sendTelegramMessage } from "../services/telegram";

const test = new Hono<{ Bindings: any }>();

test.post("/market", async (c) => {
  const { symbol, url } = await c.req.json();
  if (!url) {
    return c.json({ error: "URL is required for scraping test" }, 400);
  }
  console.log("Testing market fetch for URL:", url);
  const price = await getStockPrice(url);
  if (price === null) {
    console.log(`Failed to fetch price using URL: ${url}`);
    return c.json(
      { error: "Failed to fetch price. Check API key or symbol." },
      400
    );
  }
  return c.json({ symbol, price, timestamp: new Date().toISOString() });
});

test.post("/telegram", async (c) => {
  const { chatId, message } = await c.req.json();
  try {
    const result = await sendTelegramMessage(
      c.env.TELEGRAM_BOT_TOKEN,
      chatId,
      message || "Test message from StockDrop Alert System!"
    );
    return c.json({ success: true, result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default test;
