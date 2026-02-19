/**
 * App — Root component for the Prompt Crafting frontend.
 *
 * Sets up routing and provides the React Query client context.
 */

import React from "react";
import AuditViewer from "./components/AuditViewer";
import ExecutionPanel from "./components/ExecutionPanel";
import MetricsDashboard from "./components/MetricsDashboard";
import PromptEditor from "./components/PromptEditor";

/**
 * Root application component.
 */
export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1>Prompt Crafting</h1>
        <p>Security-first prompt engineering platform</p>
      </header>

      <main className="app__main">
        <section className="app__section">
          <PromptEditor
            value=""
            onChange={(val) => console.log("Template changed:", val)}
            parameters={{ target: { description: "Target domain" } }}
          />
        </section>

        <section className="app__section">
          <ExecutionPanel prompt={null} onExecutionComplete={() => {}} />
        </section>

        <section className="app__section">
          <MetricsDashboard />
        </section>

        <section className="app__section">
          <AuditViewer />
        </section>
      </main>
    </div>
  );
}
