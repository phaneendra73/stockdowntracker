# Stock Down Tracker - Implementation Plan

## 1. High-Level Architecture

The system uses a serverless architecture designed to remain within the Cloudflare Free Tier. The core philosophy is "Event-Driven & State-Persisted".

- **Frontend (Cloudflare Pages)**: A static Single Page Application (SPA) hosted on Cloudflare Pages. It fetches data directly from the Worker API. It performs no heavy calculations, only visualization.
- **Backend (Cloudflare Worker)**: Serves as the central brain.
  - **API Routes**: Handles requests from the Frontend (GET prices, POST config).
  - **Cron Trigger**: A scheduled event (e.g., every hour during market hours) that wakes up the Worker to fetch prices and check for drawdowns.
- **Shared Logic**: A single JavaScript module used by both the API (for manual checks/previews) and the Cron Job (for automated checks) to ensure consistency.
- **Storage**:
  - **Cloudflare D1 (SQLite)**: Stores time-series price data and a log of triggered alerts. This allows for historical analysis.
  - **Cloudflare KV**: Stores "hot" configuration (Active Indexes, Thresholds, Alert Settings). KV is chosen here for its low-latency read speed, as these configs are read on every single cron execution.

## 2. Data Model (Cloudflare D1 SQL)

### Table: `market_data`

Stores historical snapshots of price data.

```sql
CREATE TABLE IF NOT EXISTS market_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  price REAL NOT NULL,
  recorded_at INTEGER NOT NULL  -- Unix Timestamp
);
CREATE INDEX IF NOT EXISTS idx_symbol_time ON market_data(symbol, recorded_at DESC);
```

### Table: `alerts`

Stores a history of when drops were detected.

```sql
CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  trigger_threshold TEXT NOT NULL, -- e.g. "-10%"
  price_at_trigger REAL NOT NULL,
  peak_price REAL NOT NULL,
  drawdown_percent REAL NOT NULL,
  triggered_at INTEGER NOT NULL
);
```

### KV Structure (Namespace: `STOCK_CONFIG`)

Key: `settings`
Value (JSON):

```json
{
  "tracking": [
    { "symbol": "^GSPC", "name": "S&P 500" },
    { "symbol": "^IXIC", "name": "Nasdaq" }
  ],
  "thresholds": [0.1, 0.2], // 10%, 20% drops
  "notifications_enabled": true
}
```

## 3. Shared Logic Design

A module `src/core.js` will export:

1.  `fetchCurrentPrice(symbol)`: Fetches real-time data (e.g., from Yahoo Finance public query).
2.  `calculateDrawdown(currentPrice, historicalPeak)`: Pure math function.
3.  `processMarketCheck(env)`: The main orchestrator.
    - Reads Config from KV.
    - Fetches current prices for all tracked symbols.
    - Queries D1 for the `MAX(price)` of the last X days (52-week high logic) or a moving average.
    - Calculates drawdown.
    - If `drawdown > threshold`, records an alert in D1 and (optional) sends a notification (Discord/Email/Slack webhook).
    - Writes latest price to D1.

## 4. Worker + Cron Flow

### **Cron Job (Scheduled Event)**

1.  **Trigger**: Runs M-F, 9:30 AM - 4:00 PM EST (Market Hours).
2.  **Action**: Calls `shared.processMarketCheck(env)`.
3.  **Outcome**: D1 tables updated; Alerts sent if conditions met.

### **API Request (Fetch Event)**

- `GET /api/status`: Returns latest prices and recent alerts (for UI).
- `GET /api/history?symbol=X`: Returns charts data from D1.
- `POST /api/config`: Updates the KV store with new settings.

## 5. UI Interaction Flow

1.  **Load**: Frontend loads. Request `GET /api/status`.
2.  **Display**: Show cards for each Index with "Safe" (Green) or "Drawdown" (Red) status.
3.  **Chart**: Detailed chart shows Price vs Threshold lines.
4.  **Config**: User clicks "Settings". Modifies list of symbols. Clicks "Save".
    - Frontend POSTs to `/api/config`.
    - KV is updated immediately.
    - Next Cron job uses new settings.

## 6. Project Structure

```
/stockdowntracker
├── /frontend          # Cloudflare Pages (Dashboard)
│   ├── index.html
│   ├── style.css
│   └── app.js
├── /worker            # Cloudflare Worker (API + Cron)
│   ├── wrangler.toml  # Config
│   ├── schema.sql     # D1 Migration
│   └── src
│       ├── index.js   # Entry Point
│       └── core.js    # Shared Logic
└── README.md
```
