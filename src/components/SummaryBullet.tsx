import React from 'react';
import { 
  Database, 
  Share2, 
  Shield, 
  Clock, 
  Scale, 
  FileText, 
  Eye, 
  Baby, 
  Lock 
} from 'lucide-react';
import type { SummaryItem } from '../types/analysis';

interface SummaryBulletProps {
  item: SummaryItem;
}

const SummaryBullet: React.FC<SummaryBulletProps> = ({ item }) => {
  const getIcon = (id: string) => {
    if (id.includes('collection')) return Database;
    if (id.includes('sharing')) return Share2;
    if (id.includes('rights')) return Scale;
    if (id.includes('retention')) return Clock;
    if (id.includes('security')) return Lock;
    if (id.includes('tracking')) return Eye;
    if (id.includes('children')) return Baby;
    if (id.includes('license')) return FileText;
    return Shield;
  };

  const getIconColor = (id: string) => {
    if (id.includes('collection')) return 'text-blue-400';
    if (id.includes('sharing')) return 'text-orange-400';
    if (id.includes('rights')) return 'text-emerald-400';
    if (id.includes('retention')) return 'text-purple-400';
    if (id.includes('security')) return 'text-teal-400';
    if (id.includes('tracking')) return 'text-red-400';
    if (id.includes('children')) return 'text-pink-400';
    if (id.includes('license')) return 'text-amber-400';
    return 'text-slate-400';
  };

  const Icon = getIcon(item.id);
  const iconColor = getIconColor(item.id);

  return (
    <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/30 rounded-lg p-4 transition-all cursor-pointer group">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-500/20 transition-colors`}>
          <Icon className={`w-4 h-4 ${iconColor} group-hover:text-teal-400 transition-colors`} />
        </div>
        <div className="flex-1">
          <p className="text-slate-200 text-sm leading-relaxed group-hover:text-white transition-colors">
            {item.text}
          </p>
          {item.evidence && item.evidence.length > 0 && (
            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-teal-400">
                Evidence found in {item.evidence.length} location{item.evidence.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryBullet;