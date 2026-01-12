import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Leaderboard from './Leaderboard';
import './Stage2.css';

function deAnonymizeText(text, labelToModel) {
  if (!labelToModel) return text;

  let result = text;
  // Replace each "Response X" with the actual model name
  Object.entries(labelToModel).forEach(([label, model]) => {
    const modelShortName = model.split('/')[1] || model;
    // Replace with bolded name
    result = result.replace(new RegExp(label, 'g'), `**${modelShortName}**`);
  });
  return result;
}

export default function Stage2({ rankings, labelToModel, aggregateRankings }) {
  const [activeTab, setActiveTab] = useState(0);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  if (!rankings || rankings.length === 0) {
    return null;
  }

  // Calculate total tokens for Stage 2
  const totalTokens = rankings.reduce((acc, curr) => 
    acc + (curr.usage?.total_tokens || 0), 0
  );

  return (
    <div className="stage stage2">
      <h3 className="stage-title">
        Stage 2: Peer Rankings
        {totalTokens > 0 && <span className="stage-metrics">({totalTokens} tokens)</span>}
      </h3>

      {/* Visual Leaderboard */}
      <Leaderboard rankings={aggregateRankings} />

      {/* Collapsible Details */}
      <div className="details-section">
        <button 
          className="toggle-details-btn"
          onClick={() => setDetailsExpanded(!detailsExpanded)}
        >
          {detailsExpanded ? 'Hide Detailed Reviews ▲' : 'Show Detailed Reviews ▼'}
        </button>

        {detailsExpanded && (
          <div className="reviews-container">
            <h4>Raw Peer Evaluations</h4>
            <div className="tabs">
              {rankings.map((rank, index) => (
                <button
                  key={index}
                  className={`tab ${activeTab === index ? 'active' : ''}`}
                  onClick={() => setActiveTab(index)}
                >
                  {rank.model.split('/')[1] || rank.model}
                </button>
              ))}
            </div>

            <div className="tab-content">
              <div className="response-header">
                <div className="ranking-model">
                  Reviewer: <strong>{rankings[activeTab].model}</strong>
                </div>
              </div>
              
              <div className="ranking-content markdown-content">
                <ReactMarkdown>
                  {deAnonymizeText(rankings[activeTab].ranking, labelToModel)}
                </ReactMarkdown>
              </div>

              {rankings[activeTab].parsed_ranking &&
               rankings[activeTab].parsed_ranking.length > 0 && (
                <div className="parsed-ranking">
                  <strong>Extracted Ranking:</strong>
                  <ol>
                    {rankings[activeTab].parsed_ranking.map((label, i) => (
                      <li key={i}>
                        {labelToModel && labelToModel[label]
                          ? labelToModel[label].split('/')[1] || labelToModel[label]
                          : label}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
