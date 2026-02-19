/**
 * AuditViewer — Filterable table of audit log entries.
 *
 * Displays security action logs with risk-level color coding
 * and filtering by action, target, and risk level.
 */

import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const RISK_COLORS = {
  low: "#4caf50",
  medium: "#ff9800",
  high: "#f44336",
  critical: "#9c27b0",
};

/**
 * Audit log viewer with filterable table and risk-level color coding.
 */
export default function AuditViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRisk, setFilterRisk] = useState("");
  const [filterAction, setFilterAction] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await api.get("/security/audit-logs");
        setLogs(response.data);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterRisk && log.risk_level !== filterRisk) return false;
      if (filterAction && !log.action?.includes(filterAction)) return false;
      return true;
    });
  }, [logs, filterRisk, filterAction]);

  if (loading) {
    return <div className="audit-viewer__loading">Loading audit logs...</div>;
  }

  return (
    <div className="audit-viewer">
      <h2>Audit Logs</h2>

      {/* Filters */}
      <div className="audit-viewer__filters">
        <div className="audit-viewer__filter">
          <label htmlFor="filter-risk">Risk Level</label>
          <select
            id="filter-risk"
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
          >
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="audit-viewer__filter">
          <label htmlFor="filter-action">Action</label>
          <input
            id="filter-action"
            type="text"
            placeholder="Filter by action..."
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <table className="audit-viewer__table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Timestamp</th>
            <th>Action</th>
            <th>Target</th>
            <th>Risk Level</th>
            <th>Summary</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log) => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>{new Date(log.created_at).toLocaleString()}</td>
              <td>{log.action}</td>
              <td>{log.target}</td>
              <td>
                <span
                  className="audit-viewer__risk-badge"
                  style={{
                    backgroundColor: RISK_COLORS[log.risk_level] || "#999",
                  }}
                >
                  {log.risk_level}
                </span>
              </td>
              <td>{log.result_summary}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredLogs.length === 0 && (
        <div className="audit-viewer__empty">No audit logs found.</div>
      )}
    </div>
  );
}
