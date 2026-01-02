DROP TABLE IF EXISTS market_data;
CREATE TABLE market_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  price REAL NOT NULL,
  recorded_at INTEGER NOT NULL
);
CREATE INDEX idx_symbol_time ON market_data(symbol, recorded_at DESC);

DROP TABLE IF EXISTS alerts;
CREATE TABLE alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  trigger_threshold TEXT NOT NULL,
  price_at_trigger REAL NOT NULL,
  peak_price REAL NOT NULL,
  drawdown_percent REAL NOT NULL,
  triggered_at INTEGER NOT NULL
);
