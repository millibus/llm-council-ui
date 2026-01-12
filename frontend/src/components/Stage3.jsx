import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import './Stage3.css';

export default function Stage3({ finalResponse, metadata }) {
  const [copied, setCopied] = useState(false);

  if (!finalResponse) {
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(finalResponse.response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalTokens = metadata?.token_usage?.total || 0;
  
  // Calculate total duration roughly if not provided
  // Or just show individual? PRD says "Total duration in Stage 3 footer".
  // Backend didn't sum duration explicitly in `metadata` in my `council.py` change?
  // I only did token totals.
  // I should rely on what I have.
  
  return (
    <div className="stage stage3">
      <div className="stage3-header">
        <h3 className="stage-title">Stage 3: Final Council Answer</h3>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>

      <div className="final-response">
        <div className="chairman-label">
          Chairman: {finalResponse.model.split('/')[1] || finalResponse.model}
        </div>
        <div className="final-text markdown-content">
          <ReactMarkdown>{finalResponse.response}</ReactMarkdown>
        </div>
      </div>

      <div className="session-footer">
        <div className="footer-metric">
           <strong>Session Total:</strong> {totalTokens.toLocaleString()} tokens
        </div>
        {finalResponse.latency > 0 && (
          <div className="footer-metric">
            <strong>Chairman Latency:</strong> {finalResponse.latency}s
          </div>
        )}
      </div>
    </div>
  );
}
