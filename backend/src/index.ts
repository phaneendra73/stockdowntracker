import { Hono } from "hono";
import { cors } from "hono/cors";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "./db/schema";

// Import Routes
import auth from "./routes/auth";
import stocks from "./routes/stocks";
import test from "./routes/test";
import market from "./routes/market";

// Import Services
import { getStockPrice } from "./services/market";
import { sendTelegramMessage } from "./services/telegram";
import { authMiddleware } from "./middleware/auth";

type Bindings = {
  DB: D1Database;
  TELEGRAM_BOT_TOKEN: string;
  ALPHA_VANTAGE_API_KEY: string;
  ADMIN_PIN: string;
  JWT_SECRET: string;
};

type Variables = {
  db: ReturnType<typeof drizzle<typeof schema>>;
  user: { id: string };
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use("*", cors());

// Middleware to initialize Drizzle
app.use("*", async (c, next) => {
  const db = drizzle(c.env.DB, { schema });
  c.set("db", db);
  await next();
});

// Protect all /api routes except login
app.use("/api/*", authMiddleware);

// Mount Routes
app.route("/api", auth);
app.route("/api/stocks", stocks);
app.route("/api/test", test);
app.route("/api/market", market);

// Scheduled Task (Cron)
export default {
  async fetch(request: Request, env: Bindings, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  },
  async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    const db = drizzle(env.DB, { schema });

    const activeAlerts = await db.query.alerts.findMany({
      where: eq(schema.alerts.notified, false),
      with: {
        stock: true,
        user: true,
      },
    });

    console.log(
      `[Scheduled Task] Found ${activeAlerts.length} active alerts to check.`
    );
    activeAlerts.forEach((a) => {
      console.log(
        `[Scheduled Task] Checking ${a.stock.symbol}. Saved URL: ${
          a.stock.url || "None"
        }`
      );
    });

    for (const alert of activeAlerts) {
      try {
        if (!alert.stock.url) {
          console.error(
            `[Scheduled Task] Skipping ${alert.stock.symbol} - No URL found.`
          );
          continue;
        }

        const price = await getStockPrice(alert.stock.url);

        if (price === null) continue;

        if (price <= alert.targetPrice) {
          const message =
            `🎯 Target Hit: ${alert.stock.symbol}\n` +
            `Current Price: ${price.toFixed(2)}\n` +
            `Target Price: ${alert.targetPrice.toFixed(2)}\n` +
            `URL: ${alert.stock.url}`;

          await sendTelegramMessage(
            env.TELEGRAM_BOT_TOKEN,
            alert.user.telegramChatId,
            message
          );

          await db
            .update(schema.alerts)
            .set({
              notified: true,
              lastCheckedPrice: price,
              lastCheckedAt: new Date(),
            })
            .where(eq(schema.alerts.id, alert.id));
        } else {
          await db
            .update(schema.alerts)
            .set({
              lastCheckedPrice: price,
              lastCheckedAt: new Date(),
            })
            .where(eq(schema.alerts.id, alert.id));
        }
      } catch (error) {
        console.error(`Error processing alert ${alert.id}:`, error);
      }
    }
  },
};
