import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  telegramChatId: text("telegram_chat_id").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  alerts: many(alerts),
}));

export const stocks = sqliteTable("stocks", {
  id: text("id").primaryKey(),
  symbol: text("symbol").notNull().unique(), // Display name or symbol
  name: text("name"),
  url: text("url").notNull(),
});

export const stocksRelations = relations(stocks, ({ many }) => ({
  alerts: many(alerts),
}));

export const alerts = sqliteTable("alerts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  stockId: text("stock_id")
    .references(() => stocks.id)
    .notNull(),
  targetPrice: real("target_price").notNull(),
  lastCheckedPrice: real("last_checked_price"),
  lastCheckedAt: integer("last_checked_at", { mode: "timestamp" }),
  notified: integer("notified", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(users, {
    fields: [alerts.userId],
    references: [users.id],
  }),
  stock: one(stocks, {
    fields: [alerts.stockId],
    references: [stocks.id],
  }),
}));
