import { Hono } from "hono";
import {
  getMarketStatus,
  getAllSymbols,
  getStockPrice,
} from "../services/market";

const market = new Hono<{ Bindings: any }>();

market.get("/status", async (c) => {
  const status = await getMarketStatus();
  return c.json(status);
});

market.get("/symbols", async (c) => {
  const symbols = await getAllSymbols();
  // Transform to a clean list of names and symbols
  return c.json(symbols || []);
});

market.get("/nifty", async (c) => {
  console.log("[Market Route] Fetching Nifty 50 price via scraping...");
  const niftyUrl = "https://www.google.com/finance/quote/NIFTY_50:INDEXNSE";
  const price = await getStockPrice(niftyUrl);
  return c.json({ symbol: "NIFTY 50", price });
});

export default market;
