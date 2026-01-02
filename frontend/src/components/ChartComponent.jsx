import React, { useEffect, useState, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartComponent = ({ symbol, apiKey }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `${apiKey}/history?symbol=${encodeURIComponent(symbol)}`
        );
        if (res.ok) {
          const data = await res.json();

          const prices = data.map((d) => d.price);
          const labels = data.map((d) =>
            new Date(d.recorded_at).toLocaleDateString()
          );

          setChartData({
            labels,
            datasets: [
              {
                label: "Price",
                data: prices,
                borderColor: "#2f81f7",
                backgroundColor: (context) => {
                  const ctx = context.chart.ctx;
                  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                  gradient.addColorStop(0, "rgba(47, 129, 247, 0.5)");
                  gradient.addColorStop(1, "rgba(47, 129, 247, 0.0)");
                  return gradient;
                },
                fill: true,
                tension: 0.4,
                pointRadius: 2,
              },
            ],
          });
        }
      } catch (e) {
        console.error("History fetch error", e);
      }
    };

    if (symbol) fetchHistory();
  }, [symbol, apiKey]);

  if (!chartData)
    return (
      <div
        style={{
          display: "flex",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading Chart...
      </div>
    );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { display: false },
      y: {
        grid: { color: "#30363d" },
        ticks: { color: "#7d8590" },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  return <Line data={chartData} options={options} />;
};

export default ChartComponent;
