/**
 * MetricsDashboard — Charts for cost, token usage, and performance.
 *
 * Uses Recharts for data visualization with responsive charts
 * and date range filtering.
 */

import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../services/api";

/**
 * Dashboard displaying cost, performance, and usage analytics.
 */
export default function MetricsDashboard() {
  const [costData, setCostData] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [costRes, usageRes, perfRes] = await Promise.all([
          api.get("/analytics/cost"),
          api.get("/analytics/usage"),
          api.get("/analytics/performance"),
        ]);
        setCostData(costRes.data);
        setUsageData(usageRes.data);
        setPerformanceData(perfRes.data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="metrics-dashboard__loading">Loading analytics...</div>;
  }

  const costByModel = costData?.by_model
    ? Object.entries(costData.by_model).map(([model, cost]) => ({
        model,
        cost: Number(cost.toFixed(4)),
      }))
    : [];

  const dailyUsage = usageData?.daily_usage || [];

  const performanceByPrompt = performanceData?.by_prompt || [];

  return (
    <div className="metrics-dashboard">
      <h2>Analytics Dashboard</h2>

      {/* Cost summary */}
      <div className="metrics-dashboard__summary">
        <div className="metrics-dashboard__stat">
          <span className="metrics-dashboard__stat-label">Total Cost</span>
          <span className="metrics-dashboard__stat-value">
            ${costData?.total_cost_usd?.toFixed(4) || "0.00"}
          </span>
        </div>
        <div className="metrics-dashboard__stat">
          <span className="metrics-dashboard__stat-label">Executions</span>
          <span className="metrics-dashboard__stat-value">
            {costData?.execution_count || 0}
          </span>
        </div>
      </div>

      {/* Cost by model chart */}
      <div className="metrics-dashboard__chart">
        <h3>Cost by Model</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={costByModel}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="model" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="cost" fill="#8884d8" name="Cost (USD)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Token usage trends */}
      <div className="metrics-dashboard__chart">
        <h3>Daily Token Usage</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyUsage}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="total_tokens"
              stroke="#82ca9d"
              name="Tokens"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Performance latency */}
      <div className="metrics-dashboard__chart">
        <h3>Latency by Prompt (ms)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceByPrompt}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="prompt_name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="p50_ms" fill="#8884d8" name="p50" />
            <Bar dataKey="p95_ms" fill="#ffc658" name="p95" />
            <Bar dataKey="p99_ms" fill="#ff7300" name="p99" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
