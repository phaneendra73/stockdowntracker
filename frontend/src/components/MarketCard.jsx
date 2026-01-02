import React from "react";

const MarketCard = ({ item, data, onClick, isActive }) => {
  // Basic formatting
  const price = data ? data.price : null;
  const peak = data && data.peak ? data.peak : price ? price * 1.05 : 0; // fallback peak

  let drawdown = 0;
  if (price && peak) {
    drawdown = ((price - peak) / peak) * 100;
  }

  const isDanger = drawdown < -10;

  // Inline styles for the card
  const cardStyle = {
    background: "var(--bg-card)",
    border: `1px solid ${
      isActive ? "var(--accent-color)" : "var(--border-color)"
    }`,
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: isActive ? "var(--shadow-md)" : "var(--shadow-sm)",
    transition: "all 0.2s",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <div style={cardStyle} onClick={onClick}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: "600",
              color: "var(--text-primary)",
            }}
          >
            {item.name || item.symbol}
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            {item.symbol}
          </div>
        </div>
        {data && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.25rem 0.75rem",
              borderRadius: "999px",
              fontSize: "0.85rem",
              fontWeight: "600",
              background: isDanger
                ? "rgba(248, 81, 73, 0.15)"
                : "rgba(35, 134, 54, 0.15)",
              color: isDanger ? "#ff7b72" : "#3fb950",
              border: isDanger
                ? "1px solid rgba(248, 81, 73, 0.3)"
                : "1px solid rgba(35, 134, 54, 0.3)",
            }}
          >
            {drawdown.toFixed(2)}%
          </div>
        )}
      </div>

      {price ? (
        <>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              marginBottom: "0.5rem",
            }}
          >
            ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Peak: $
            {peak.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </>
      ) : (
        <div style={{ color: "var(--text-secondary)" }}>Loading...</div>
      )}
    </div>
  );
};

export default MarketCard;
