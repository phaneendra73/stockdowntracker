import React from "react";
import { AlertTriangle } from "lucide-react";

const AlertsList = ({ alerts }) => {
  const listStyle = {
    display: "grid",
    gap: "1rem",
    marginTop: "1rem",
  };

  const itemStyle = {
    background: "rgba(248, 81, 73, 0.05)",
    borderLeft: "4px solid var(--danger-color)",
    padding: "1rem",
    borderRadius: "4px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div style={{ padding: "1rem", color: "var(--text-secondary)" }}>
        No alerts triggered recently.
      </div>
    );
  }

  return (
    <div style={listStyle}>
      {alerts.map((alert, idx) => (
        <div key={idx} style={itemStyle}>
          <div
            style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
          >
            <AlertTriangle size={18} color="var(--danger-color)" />
            <div>
              <strong>{alert.symbol}</strong> dropped below{" "}
              {alert.trigger_threshold}
            </div>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            {new Date(alert.triggered_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertsList;
