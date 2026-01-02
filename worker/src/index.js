import { processMarketCheck, DEFAULT_CONFIG } from "./core.js";

export default {
  // CRON Handler
  async scheduled(event, env, ctx) {
    console.log("Cron triggered");
    ctx.waitUntil(processMarketCheck(env));
  },

  // API Handler
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Routes
    if (url.pathname === "/api/status") {
      // Trigger a fresh check (or just read from DB if you prefer cached)
      // For responsiveness, we'll do a live check + DB read
      const latestInfo = await processMarketCheck(env);

      // Get recent alerts
      const alerts = await env.DB.prepare(
        "SELECT * FROM alerts ORDER BY triggered_at DESC LIMIT 10"
      ).all();

      const responseData = {
        latestPrices: latestInfo.reduce(
          (acc, curr) => ({ ...acc, [curr.symbol]: curr }),
          {}
        ),
        recentAlerts: alerts.results,
      };

      return new Response(JSON.stringify(responseData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/api/history") {
      const symbol = url.searchParams.get("symbol");
      if (!symbol)
        return new Response("Missing symbol", {
          status: 400,
          headers: corsHeaders,
        });

      const history = await env.DB.prepare(
        "SELECT * FROM market_data WHERE symbol = ? ORDER BY recorded_at ASC LIMIT 500" // Limit for performance
      )
        .bind(symbol)
        .all();

      return new Response(JSON.stringify(history.results), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/api/config") {
      if (request.method === "GET") {
        const config =
          (await env.STOCK_CONFIG.get("settings", { type: "json" })) ||
          DEFAULT_CONFIG;
        return new Response(JSON.stringify(config), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (request.method === "POST") {
        const body = await request.json();
        await env.STOCK_CONFIG.put("settings", JSON.stringify(body));
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};
