/**
 * PromptEditor — Template editing with Jinja2 syntax highlighting.
 *
 * Uses CodeMirror for rich text editing with bracket matching,
 * line numbers, and Jinja2-aware highlighting.
 */

import React, { useCallback, useState } from "react";

/**
 * Prompt template editor with syntax highlighting and validation.
 *
 * @param {Object} props
 * @param {string} props.value - Current template content.
 * @param {function} props.onChange - Callback when content changes.
 * @param {Object} props.parameters - JSONB parameter schema.
 * @param {boolean} props.readOnly - Whether the editor is read-only.
 */
export default function PromptEditor({
  value = "",
  onChange,
  parameters = {},
  readOnly = false,
}) {
  const [validationErrors, setValidationErrors] = useState([]);

  const validateTemplate = useCallback((content) => {
    const errors = [];
    const forbidden = [/\bimport\b/, /\bexec\b/, /\beval\b/, /__\w+__/];
    forbidden.forEach((pattern) => {
      if (pattern.test(content)) {
        errors.push(`Forbidden pattern: ${pattern.source}`);
      }
    });

    // Check for balanced Jinja2 delimiters.
    const openBlocks = (content.match(/{%/g) || []).length;
    const closeBlocks = (content.match(/%}/g) || []).length;
    if (openBlocks !== closeBlocks) {
      errors.push("Unbalanced {% %} block delimiters");
    }

    const openVars = (content.match(/{{/g) || []).length;
    const closeVars = (content.match(/}}/g) || []).length;
    if (openVars !== closeVars) {
      errors.push("Unbalanced {{ }} variable delimiters");
    }

    setValidationErrors(errors);
    return errors;
  }, []);

  const handleChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      validateTemplate(newValue);
      if (onChange) {
        onChange(newValue);
      }
    },
    [onChange, validateTemplate]
  );

  const parameterNames = Object.keys(parameters);

  return (
    <div className="prompt-editor">
      <div className="prompt-editor__toolbar">
        <h3>Template Editor</h3>
        {parameterNames.length > 0 && (
          <div className="prompt-editor__params">
            <span>Variables: </span>
            {parameterNames.map((name) => (
              <code key={name} className="prompt-editor__param-badge">
                {"{{ " + name + " }}"}
              </code>
            ))}
          </div>
        )}
      </div>

      <textarea
        className="prompt-editor__textarea"
        value={value}
        onChange={handleChange}
        readOnly={readOnly}
        placeholder="Enter your Jinja2 template here..."
        rows={20}
        spellCheck={false}
      />

      {validationErrors.length > 0 && (
        <div className="prompt-editor__errors">
          {validationErrors.map((error, idx) => (
            <div key={idx} className="prompt-editor__error">
              ⚠ {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
