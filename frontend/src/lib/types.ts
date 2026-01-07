export interface Stock {
  id: string;
  symbol: string;
  name: string | null;
  url: string | null;
}

export interface Alert {
  id: string;
  stock: Stock;
  targetPrice: number;
  lastCheckedPrice?: number;
  notified: boolean;
}

export interface MarketStatus {
  status: "Open" | "Closed";
  [key: string]: any;
}
