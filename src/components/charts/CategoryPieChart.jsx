import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Sector,
} from "recharts";
import "./CategoryPieChart.css";

const CategoryPieChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  // Default data if none provided or empty
  const defaultData = [
    { name: "No Data", value: 1, color: "#94a3b8", icon: "📊" },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;
  const COLORS = chartData.map((item) => item.color);
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
      props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))" }}
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 4}
          outerRadius={innerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="pie-tooltip">
          <div
            className="pie-tooltip-header"
            style={{ borderLeftColor: data.color }}
          >
            <span className="pie-tooltip-icon">{data.icon || "💰"}</span>
            <span className="pie-tooltip-name">{data.name}</span>
          </div>
          <div className="pie-tooltip-body">
            <div className="pie-tooltip-amount">
              ₹{data.value.toLocaleString()}
            </div>
            <div className="pie-tooltip-percent">{percentage}% of total</div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container pie-chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Expense Breakdown</h3>
        <span className="chart-subtitle">By category</span>
      </div>

      <div className="pie-chart-wrapper">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total */}
        <div className="pie-center">
          <span className="pie-center-label">Total</span>
          <span className="pie-center-value">
            ₹{(total / 1000).toFixed(0)}k
          </span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="pie-legend">
        {chartData.map((entry, index) => {
          const percentage = ((entry.value / total) * 100).toFixed(0);
          return (
            <div
              key={index}
              className={`pie-legend-item ${
                activeIndex === index ? "active" : ""
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div
                className="pie-legend-color"
                style={{ background: entry.color }}
              ></div>
              <div className="pie-legend-info">
                <span className="pie-legend-name">{entry.name}</span>
                <span className="pie-legend-value">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryPieChart;
