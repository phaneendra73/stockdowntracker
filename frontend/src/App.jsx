import React, { useEffect, useState } from "react";
import { Settings, TrendingDown, RefreshCw } from "lucide-react";
import MarketCard from "./components/MarketCard";
import ChartComponent from "./components/ChartComponent";
import AlertsList from "./components/AlertsList";
import ConfigModal from "./components/ConfigModal";

const API_BASE = "/api"; // Using Vite proxy

function App() {
  const [marketData, setMarketData] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [config, setConfig] = useState({ tracking: [], thresholds: [] });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(null);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/config`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        if (data.tracking.length > 0 && !selectedSymbol) {
          setSelectedSymbol(data.tracking[0].symbol);
        }
      }
    } catch (e) {
      console.error("Config fetch error", e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/status`);
      if (res.ok) {
        const data = await res.json();
        setMarketData(data.latestPrices || {});
        setAlerts(data.recentAlerts || []);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error("Status fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchData();
  }, []);

  const handleConfigSave = async (newConfig) => {
    try {
      const res = await fetch(`${API_BASE}/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
      if (res.ok) {
        setConfig(newConfig);
        setIsSettingsOpen(false);
        fetchData(); // Refresh to check against new settings/thresholds
      }
    } catch (e) {
      console.error("Save config error", e);
      alert("Failed to save configuration");
    }
  };

  return (
    <div
      className="app-container"
      style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "3rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <TrendingDown size={32} color="var(--accent-color)" />
          <h1 style={{ fontSize: "1.5rem", fontWeight: "700" }}>
            Market <span style={{ color: "var(--accent-color)" }}>Guard</span>
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            {loading
              ? "Syncing..."
              : lastUpdated
              ? `Updated: ${lastUpdated.toLocaleTimeString()}`
              : ""}
          </span>
          <button className="btn btn-tertiary" onClick={fetchData}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            className="btn btn-tertiary"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings size={16} /> Settings
          </button>
        </div>
      </header>

      <main>
        {/* Dashboard Grid */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem",
          }}
        >
          {config.tracking.map((item) => {
            const info = marketData[item.symbol];
            return (
              <MarketCard
                key={item.symbol}
                item={item}
                data={info}
                onClick={() => setSelectedSymbol(item.symbol)}
                isActive={selectedSymbol === item.symbol}
              />
            );
          })}
          {config.tracking.length === 0 && (
            <div className="helper-text">
              No assets tracked. Configure settings.
            </div>
          )}
        </section>

        {/* Charts & Alerts Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(600px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <section
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
              }}
            >
              <h2>Historical Performance</h2>
              {selectedSymbol && (
                <div style={{ fontWeight: 600 }}>{selectedSymbol}</div>
              )}
            </div>
            <div style={{ height: "400px" }}>
              {selectedSymbol && (
                <ChartComponent symbol={selectedSymbol} apiKey={API_BASE} />
              )}
            </div>
          </section>

          <section>
            <h2>Recent Alerts</h2>
            <AlertsList alerts={alerts} />
          </section>
        </div>
      </main>

      {isSettingsOpen && (
        <ConfigModal
          config={config}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleConfigSave}
        />
      )}
    </div>
  );
}

export default App;
