/**
 * Shared Core Logic for Stock Down Tracker
 * Used by both API (Worker) and Scheduler (Cron)
 */

export const DEFAULT_CONFIG = {
  tracking: [
    { symbol: "^GSPC", name: "S&P 500" },
    { symbol: "^IXIC", name: "Nasdaq" },
  ],
  thresholds: [10, 20], // Percentage drops to alert on
  notifications_enabled: true,
};

/**
 * Fetch current price from a free public source.
 * Note: For production, consider a more robust API or a proxy.
 * We are using a Yahoo Finance query pattern often used in scrapers.
 */
export async function fetchCurrentPrice(symbol) {
  try {
    // This is a known unofficial endpoint. In a real production app with strict requirements,
    // you would use an API key from AlphaVantage or similar.
    // We use a CORS proxy or direct fetch if allowed.
    // Since this runs on Cloudflare Workers, we can fetch public URLs directly.
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${symbol}: ${response.status}`);
    }

    const data = await response.json();
    const result = data.chart.result[0];
    const price = result.meta.regularMarketPrice;

    return {
      symbol,
      price,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
}

/**
 * Main Logic: Check markets, record data, trigger alerts
 */
export async function processMarketCheck(env) {
  // 1. Get Config
  let config = await env.STOCK_CONFIG.get("settings", { type: "json" });
  if (!config) {
    config = DEFAULT_CONFIG;
    // Initialize if empty
    await env.STOCK_CONFIG.put("settings", JSON.stringify(config));
  }

  const results = [];

  // 2. Loop through symbols
  for (const item of config.tracking) {
    const quote = await fetchCurrentPrice(item.symbol);

    if (quote) {
      // 3. Save to History (D1)
      await env.DB.prepare(
        "INSERT INTO market_data (symbol, price, recorded_at) VALUES (?, ?, ?)"
      )
        .bind(quote.symbol, quote.price, quote.timestamp)
        .run();

      // 4. Calculate Drawdown
      // Get the 52-week high (or max from our DB for simplicity in this MVP)
      // In a real app, you'd store the 52w high in KV or query a longer range from Yahoo

      // Let's try to get a peak from DB history first, otherwise assume current is near peak if no history
      const history = await env.DB.prepare(
        "SELECT MAX(price) as peak FROM market_data WHERE symbol = ?"
      )
        .bind(quote.symbol)
        .first();

      let peak = history?.peak || quote.price;
      // If current price is higher than history, it's the new peak
      if (quote.price > peak) peak = quote.price;

      const drawdown = ((quote.price - peak) / peak) * 100; // e.g. -5.5
      const drawdownAbs = Math.abs(drawdown);

      // 5. Check Thresholds
      for (const threshold of config.thresholds) {
        if (drawdown <= -threshold) {
          // Check if we already alerted recently to avoid spam (simple dedup logic could go here)
          // For now, we just log it
          await env.DB.prepare(
            "INSERT INTO alerts (symbol, trigger_threshold, price_at_trigger, peak_price, drawdown_percent, triggered_at) VALUES (?, ?, ?, ?, ?, ?)"
          )
            .bind(
              quote.symbol,
              `-${threshold}%`,
              quote.price,
              peak,
              drawdown,
              Date.now()
            )
            .run();

          console.log(`ALERT: ${quote.symbol} is down ${drawdown.toFixed(2)}%`);
        }
      }

      results.push({ ...quote, peak, drawdown });
    }
  }

  return results;
}
