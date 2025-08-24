import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Quote } from 'lucide-react';
import type { RedFlag } from '../types/analysis';

interface RedFlagCardProps {
  flag: RedFlag;
}

const RedFlagCard: React.FC<RedFlagCardProps> = ({ flag }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityColor = (severity: number) => {
    if (severity >= 4) return 'bg-red-500 text-white';
    if (severity >= 3) return 'bg-amber-500 text-white';
    return 'bg-blue-500 text-white';
  };

  const getSeverityEmoji = (severity: number) => {
    if (severity >= 4) return '🔥';
    if (severity >= 3) return '⚠️';
    return 'ℹ️';
  };

  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-red-500/15 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="text-lg">{getSeverityEmoji(flag.severity)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-red-400">{flag.title}</h4>
                <span className={`px-2 py-1 rounded text-xs font-bold ${getSeverityColor(flag.severity)}`}>
                  {flag.severity}/5
                </span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {flag.whatItMeans}
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-red-400 transition-colors ml-2">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-red-500/20">
          <div className="bg-black/20 rounded-lg p-4 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Quote className="w-4 h-4 text-red-400" />
              <span className="text-red-400 font-medium text-sm">Evidence from policy:</span>
            </div>
            <blockquote className="text-slate-300 text-sm font-mono leading-relaxed italic">
              "{flag.evidence}"
            </blockquote>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedFlagCard;