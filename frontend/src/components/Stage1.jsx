import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './Stage1.css';

export default function Stage1({ responses }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!responses || responses.length === 0) {
    return null;
  }

  const activeResponse = responses[activeTab];
  const shortName = activeResponse.model.split('/')[1] || activeResponse.model;

  return (
    <div className="stage stage1">
      <h3 className="stage-title">Stage 1: Individual Responses</h3>

      <div className="tabs">
        {responses.map((resp, index) => {
          const name = resp.model.split('/')[1] || resp.model;
          return (
            <button
              key={index}
              className={`tab ${activeTab === index ? 'active' : ''}`}
              onClick={() => setActiveTab(index)}
            >
              {name}
              {resp.latency > 0 && <span className="tab-latency">{resp.latency}s</span>}
            </button>
          );
        })}
      </div>

      <div className="tab-content">
        <div className="response-header">
          <div className="model-name">{activeResponse.model}</div>
          <div className="model-metrics">
            <span className="metric">
              ⏱️ {activeResponse.latency || 0}s
            </span>
            <span className="metric">
              🪙 {activeResponse.usage?.total_tokens || 0} tokens
              <span className="metric-detail">
                ({activeResponse.usage?.prompt_tokens || 0} in / {activeResponse.usage?.completion_tokens || 0} out)
              </span>
            </span>
          </div>
        </div>
        <div className="response-text markdown-content">
          <ReactMarkdown>{activeResponse.response}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
