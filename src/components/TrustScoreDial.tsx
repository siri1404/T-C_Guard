import React, { useEffect, useState } from 'react';

interface TrustScoreDialProps {
  score: number;
  confidence: number;
}

const TrustScoreDial: React.FC<TrustScoreDialProps> = ({ score, confidence }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 500);

    return () => clearTimeout(timer);
  }, [score]);

  const getScoreColor = (score: number) => {
    if (score >= 75) return '#22C55E'; // emerald-500
    if (score >= 50) return '#F59E0B'; // amber-500
    return '#EF4444'; // red-500
  };

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="relative">
      <svg width="120" height="120" className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
        />
        
        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke={getScoreColor(score)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${getScoreColor(score)}40)`
          }}
        />
      </svg>
      
      {/* Score display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold text-white">{animatedScore}</div>
        <div className="text-xs text-slate-400 font-medium">Trust Score</div>
      </div>
      
      {/* Confidence indicator */}
      <div className="mt-3 text-center">
        <span className="text-xs text-slate-400">
          Confidence: <span className="text-teal-400 font-semibold">{Math.round(confidence * 100)}%</span>
        </span>
      </div>
    </div>
  );
};

export default TrustScoreDial;