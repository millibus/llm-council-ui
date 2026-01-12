import { useEffect, useState } from 'react';
import './WinsTracker.css';
import { api } from '../api';

export default function WinsTracker({ refreshTrigger }) {
  const [wins, setWins] = useState({});

  useEffect(() => {
    loadWins();
  }, [refreshTrigger]);

  const loadWins = async () => {
    try {
      const data = await api.getWins();
      setWins(data);
    } catch (error) {
      console.error('Failed to load wins:', error);
    }
  };

  // Convert to array and sort by wins (descending)
  const sortedWins = Object.entries(wins)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Show top 5

  if (sortedWins.length === 0) return null;

  return (
    <div className="wins-tracker">
      <div className="wins-title">Council Wins</div>
      <div className="wins-list">
        {sortedWins.map(([model, count]) => {
            const shortName = model.split('/').pop().replace(/-/g, ' ');
            return (
              <div key={model} className="win-item">
                <span className="win-model" title={model}>{shortName}</span>
                <span className="win-count">{count}</span>
              </div>
            );
        })}
      </div>
    </div>
  );
}
