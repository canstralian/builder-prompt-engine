/**
 * ExecutionPanel — Run prompts with dynamic parameter forms.
 *
 * Generates input fields from the prompt's JSONB parameter schema
 * and displays execution results including token usage and cost.
 */

import React, { useCallback, useState } from "react";
import api from "../services/api";

/**
 * Dynamic execution panel for running prompts with parameter forms.
 *
 * @param {Object} props
 * @param {Object} props.prompt - The prompt object with parameters schema.
 * @param {function} props.onExecutionComplete - Callback with execution result.
 */
export default function ExecutionPanel({ prompt, onExecutionComplete }) {
  const [inputData, setInputData] = useState({});
  const [provider, setProvider] = useState("anthropic");
  const [model, setModel] = useState("claude-sonnet-4-20250514");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const parameters = prompt?.parameters || {};

  const handleInputChange = useCallback((key, value) => {
    setInputData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleExecute = useCallback(async () => {
    if (!prompt?.id) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post(`/prompts/${prompt.id}/execute`, {
        input_data: inputData,
        llm_provider: provider,
        model_name: model,
      });
      setResult(response.data);
      if (onExecutionComplete) {
        onExecutionComplete(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Execution failed");
    } finally {
      setLoading(false);
    }
  }, [prompt, inputData, provider, model, onExecutionComplete]);

  return (
    <div className="execution-panel">
      <h3>Execute Prompt</h3>

      {/* Dynamic parameter inputs */}
      <div className="execution-panel__params">
        {Object.entries(parameters).map(([key, schema]) => (
          <div key={key} className="execution-panel__field">
            <label htmlFor={`param-${key}`}>{key}</label>
            <input
              id={`param-${key}`}
              type="text"
              placeholder={schema.description || key}
              value={inputData[key] || ""}
              onChange={(e) => handleInputChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Provider selection */}
      <div className="execution-panel__config">
        <div className="execution-panel__field">
          <label htmlFor="provider">Provider</label>
          <select
            id="provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="openai">OpenAI (GPT)</option>
          </select>
        </div>

        <div className="execution-panel__field">
          <label htmlFor="model">Model</label>
          <input
            id="model"
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </div>
      </div>

      <button
        className="execution-panel__run-btn"
        onClick={handleExecute}
        disabled={loading}
      >
        {loading ? "Running..." : "Execute"}
      </button>

      {/* Error display */}
      {error && <div className="execution-panel__error">{error}</div>}

      {/* Result display */}
      {result && (
        <div className="execution-panel__result">
          <h4>Result</h4>
          <div className="execution-panel__output">{result.output_text}</div>
          <div className="execution-panel__metrics">
            <span>Tokens: {result.tokens_used}</span>
            <span>Cost: ${result.cost_usd}</span>
            <span>Latency: {result.execution_time_ms}ms</span>
          </div>
        </div>
      )}
    </div>
  );
}
