import React from 'react';
import type { Scores } from '../types/analysis';

interface ScoreBreakdownProps {
  scores: Scores;
  showDetails: boolean;
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ scores, showDetails }) => {
  const scoreCategories = [
    { key: 'collection', label: 'Data Collection', description: 'How much personal data is collected' },
    { key: 'sharingSelling', label: 'Data Sharing/Selling', description: 'Whether data is shared or sold to third parties' },
    { key: 'rights', label: 'User Rights', description: 'Your rights to access, delete, and control your data' },
    { key: 'retention', label: 'Data Retention', description: 'How long your data is kept' },
    { key: 'dispute', label: 'Dispute Resolution', description: 'How disputes are handled (arbitration vs courts)' },
    { key: 'license', label: 'Content License', description: 'Rights granted to your uploaded content' },
    { key: 'tracking', label: 'Tracking', description: 'Cross-site tracking and fingerprinting practices' },
    { key: 'children', label: 'Children\'s Data', description: 'Protection of children\'s personal information' },
    { key: 'security', label: 'Security', description: 'Data protection and security measures' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4">
      {/* Quick Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{scores.aggregate}</div>
          <div className="text-xs text-slate-400">Overall Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-teal-400">{Math.round(scores.confidence * 100)}%</div>
          <div className="text-xs text-slate-400">Confidence</div>
        </div>
        <div className="text-center col-span-2 md:col-span-1">
          <div className={`text-2xl font-bold ${getScoreTextColor(scores.aggregate)}`}>
            {scores.aggregate >= 75 ? 'Good' : scores.aggregate >= 50 ? 'Caution' : 'Poor'}
          </div>
          <div className="text-xs text-slate-400">Trust Level</div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="space-y-3 pt-4 border-t border-white/10">
          {scoreCategories.map((category) => {
            const score = scores[category.key as keyof Scores] as number;
            return (
              <div key={category.key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white">{category.label}</span>
                  <span className={`text-sm font-bold ${getScoreTextColor(score)}`}>
                    {score}/100
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${getScoreColor(score)}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {category.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScoreBreakdown;