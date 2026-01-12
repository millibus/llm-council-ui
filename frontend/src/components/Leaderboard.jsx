import './Leaderboard.css';

export default function Leaderboard({ rankings }) {
  if (!rankings || rankings.length === 0) return null;

  // Rankings are already sorted by average_rank from backend
  const winner = rankings[0];

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h4>Council Leaderboard</h4>
      </div>
      <div className="leaderboard-list">
        {rankings.map((item, index) => {
          const isWinner = index === 0;
          const shortName = item.model.split('/')[1] || item.model;
          
          // Calculate bar width relative to the worst (highest) rank to show scale
          // Or just relative to max possible rank?
          // Let's use a simple inverse mapping for visual bar length:
          // Better rank (lower number) = Longer bar?
          // Actually, usually "Score" bars are longer is better.
          // But here "1.5" is better than "3.0".
          // Let's just list them nicely.
          
          return (
            <div key={item.model} className={`leaderboard-row ${isWinner ? 'winner' : ''}`}>
              <div className="rank-number">#{index + 1}</div>
              <div className="model-info">
                <div className="model-name">
                   {shortName}
                   {isWinner && <span className="trophy-icon">🏆</span>}
                </div>
                <div className="model-stats">
                   Avg Rank: <strong>{item.average_rank.toFixed(2)}</strong> • 1st Place Votes: {item.first_place_count || 0}
                </div>
              </div>
              <div className="rank-visual">
                {/* Visual indicator (optional simple bar) */}
                <div 
                   className="rank-bar" 
                   style={{ 
                     width: `${Math.max(10, (4 - item.average_rank) * 33)}%`,
                     opacity: isWinner ? 1 : 0.5
                   }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
