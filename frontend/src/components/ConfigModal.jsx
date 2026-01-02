import React, { useState } from "react";
import { X } from "lucide-react";

const ConfigModal = ({ config, onClose, onSave }) => {
  const [symbols, setSymbols] = useState(
    config.tracking.map((t) => t.symbol).join(", ")
  );
  const [thresholds, setThresholds] = useState(config.thresholds.join(", "));

  const handleSave = () => {
    const newSymbols = symbols
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    const newThresholds = thresholds
      .split(",")
      .map((t) => parseFloat(t.trim()))
      .filter((t) => !isNaN(t));

    if (newSymbols.length === 0 || newThresholds.length === 0) {
      alert("Please provide valid settings");
      return;
    }

    onSave({
      tracking: newSymbols.map((s) => ({ symbol: s, name: s })),
      thresholds: newThresholds,
      notifications_enabled: true,
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          width: "100%",
          maxWidth: "500px",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-md)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1.25rem",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>Configuration</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
            }}
          >
            <X />
          </button>
        </div>
        <div style={{ padding: "1.5rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              Tracked Symbols (Yahoo Tickers)
            </label>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                marginBottom: "0.5rem",
              }}
            >
              Comma separated, e.g., ^GSPC, ^IXIC
            </div>
            <input
              type="text"
              value={symbols}
              onChange={(e) => setSymbols(e.target.value)}
              placeholder="^GSPC, ^IXIC"
            />
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              Drop Thresholds (%)
            </label>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                marginBottom: "0.5rem",
              }}
            >
              Comma separated, e.g., 10, 20
            </div>
            <input
              type="text"
              value={thresholds}
              onChange={(e) => setThresholds(e.target.value)}
              placeholder="10, 20"
            />
          </div>
        </div>
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--border-color)",
            background: "rgba(0,0,0,0.2)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button className="btn btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;
