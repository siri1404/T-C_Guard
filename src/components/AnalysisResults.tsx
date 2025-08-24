import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Download, 
  Copy, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BarChart3,
  FileText,
  Clock,
  Globe
} from 'lucide-react';
import TrustScoreDial from './TrustScoreDial';
import RedFlagCard from './RedFlagCard';
import SummaryBullet from './SummaryBullet';
import ScoreBreakdown from './ScoreBreakdown';
import type { AnalysisResult } from '../types/analysis';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onAnalyzeNew: () => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onAnalyzeNew }) => {
  const [showFullBreakdown, setShowFullBreakdown] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  const domain = React.useMemo(() => {
    try {
      return new URL(result.url).hostname;
    } catch {
      return result.url;
    }
  }, [result.url]);

  const getTrustLevel = (score: number) => {
    if (score >= 75) return { level: 'Good', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' };
    if (score >= 50) return { level: 'Caution', color: 'text-amber-400', bgColor: 'bg-amber-500/20' };
    return { level: 'Concerning', color: 'text-red-400', bgColor: 'bg-red-500/20' };
  };

  const trustLevel = getTrustLevel(result.scores.aggregate);

  const handleCopyReport = async () => {
    const report = generateReportText(result);
    try {
      await navigator.clipboard.writeText(report);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2000);
    } catch (error) {
      console.error('Failed to copy report:', error);
    }
  };

  const handleDownloadReport = () => {
    const report = generateReportText(result);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tc-guard-report-${domain}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500/20 to-teal-600/20 rounded-xl flex items-center justify-center border border-teal-500/30">
              <Globe className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{domain}</h2>
              <p className="text-slate-400 text-sm">
                Analyzed {new Date(result.retrievedAt).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onAnalyzeNew}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors text-sm"
          >
            Analyze New URL
          </button>
        </div>

        {/* Trust Score */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center">
            <TrustScoreDial 
              score={result.scores.aggregate} 
              confidence={result.scores.confidence}
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-4 ${trustLevel.bgColor} ${trustLevel.color} w-fit`}>
              {result.scores.aggregate >= 75 ? <CheckCircle className="w-4 h-4" /> : 
               result.scores.aggregate >= 50 ? <AlertTriangle className="w-4 h-4" /> : 
               <XCircle className="w-4 h-4" />}
              {trustLevel.level}
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {result.scores.aggregate >= 75 
                ? "This policy shows good privacy practices with clear user rights and reasonable data handling."
                : result.scores.aggregate >= 50
                ? "This policy has some concerning aspects but includes basic privacy protections."
                : "This policy contains several red flags that may impact your privacy and rights."
              }
            </p>
          </div>
        </div>
      </div>

      {/* Summary Bullets */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-400" />
          Key Points
        </h3>
        <div className="space-y-3">
          {result.summary.map((item, index) => (
            <SummaryBullet key={index} item={item} />
          ))}
        </div>
      </div>

      {/* Red Flags */}
      {result.redFlags && result.redFlags.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Red Flags ({result.redFlags.length})
          </h3>
          <div className="space-y-4">
            {result.redFlags.map((flag, index) => (
              <RedFlagCard key={index} flag={flag} />
            ))}
          </div>
        </div>
      )}

      {/* Score Breakdown */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-400" />
            Score Breakdown
          </h3>
          <button
            onClick={() => setShowFullBreakdown(!showFullBreakdown)}
            className="flex items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors text-sm"
          >
            {showFullBreakdown ? 'Hide Details' : 'Show Details'}
            {showFullBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        
        <ScoreBreakdown scores={result.scores} showDetails={showFullBreakdown} />
      </div>

      {/* Actions */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Export & Share</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCopyReport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4" />
            {copiedReport ? 'Copied!' : 'Copy Report'}
          </button>
          
          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
          
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Original
          </a>
        </div>
      </div>
    </div>
  );
};

const generateReportText = (result: AnalysisResult): string => {
  const domain = new URL(result.url).hostname;
  
  return `
T&C GUARD ANALYSIS REPORT
Domain: ${domain}
Analyzed: ${new Date(result.retrievedAt).toLocaleString()}
Trust Score: ${result.scores.aggregate}/100 (${Math.round(result.scores.confidence * 100)}% confidence)

KEY POINTS:
${result.summary.map(item => `• ${item.text}`).join('\n')}

${result.redFlags?.length ? `RED FLAGS:
${result.redFlags.map(flag => `⚠️ ${flag.title} (Severity: ${flag.severity}/5)
   Evidence: "${flag.evidence}"
   Impact: ${flag.whatItMeans}`).join('\n\n')}` : 'No significant red flags detected.'}

SCORE BREAKDOWN:
• Data Collection: ${result.scores.collection}/100
• Data Sharing/Selling: ${result.scores.sharingSelling}/100  
• User Rights: ${result.scores.rights}/100
• Data Retention: ${result.scores.retention}/100
• Dispute Resolution: ${result.scores.dispute}/100
• License to Content: ${result.scores.license}/100
• Tracking: ${result.scores.tracking}/100
• Children's Data: ${result.scores.children}/100
• Security: ${result.scores.security}/100

Generated by T&C Guard Web Application
  `.trim();
};

export default AnalysisResults;