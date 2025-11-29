import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./WeeklySpendingChart.css";

const WeeklySpendingChart = ({ data }) => {
  // Default data if none provided or empty
  const defaultData = [{ month: "No Data", income: 0, expenses: 0 }];

  const chartData = data && data.length > 0 ? data : defaultData;

  // Check if we have actual data
  const hasData = chartData.some(
    (item) => item.income > 0 || item.expenses > 0
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="tooltip-value"
              style={{ color: entry.color }}
            >
              <span
                className="tooltip-dot"
                style={{ background: entry.color }}
              ></span>
              {entry.name}: ₹{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="custom-legend">
        {payload.map((entry, index) => (
          <div key={index} className="legend-item">
            <span
              className="legend-dot"
              style={{ background: entry.color }}
            ></span>
            <span className="legend-text">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="chart-container line-chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Income vs Expenses</h3>
        <span className="chart-subtitle">Last 6 months overview</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            stroke="#94a3b8"
            style={{ fontSize: "0.75rem", fontWeight: "500" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: "0.75rem", fontWeight: "500" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#10b981"
            strokeWidth={2.5}
            fill="url(#incomeGradient)"
            dot={{ fill: "#10b981", r: 4, strokeWidth: 2, stroke: "#fff" }}
            activeDot={{
              r: 6,
              strokeWidth: 2,
              stroke: "#fff",
              fill: "#10b981",
            }}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#ef4444"
            strokeWidth={2.5}
            fill="url(#expenseGradient)"
            dot={{ fill: "#ef4444", r: 4, strokeWidth: 2, stroke: "#fff" }}
            activeDot={{
              r: 6,
              strokeWidth: 2,
              stroke: "#fff",
              fill: "#ef4444",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklySpendingChart;
